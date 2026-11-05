import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { createPasswordResetService, INVALID_RESET_MESSAGE } from '../lib/password-reset';
import { passwordVersion } from '../lib/password-session';
import { ResetPasswordSchema } from '../schemas/password-reset';

type Token = { email: string; token: string; createdAt: Date; expires: Date };
type TokenWhere = { email?: string; token?: string; createdAt?: { gt?: Date; lte?: Date }; expires?: { gt: Date } };
const values = { password: 'new-secret-password', confirmPassword: 'new-secret-password' };

async function fixture() {
  const state = {
    users: [{ id: 'user-1', email: 'Shopper@example.com', password: await bcrypt.hash('old-password', 4) as string | null, status: 'ACTIVE', isEmailVerified: false, emailVerified: null as Date | null }],
    tokens: [] as Token[], sessions: 2, verifications: 1,
  };
  const sent: { email: string; token: string }[] = [];
  const notifications: string[] = [];
  let failDelivery = false;
  let failNotification = false;
  let failUpdate = false;
  let queue = Promise.resolve();
  const matches = (row: Token, where: TokenWhere) =>
    (!where.email || row.email === where.email) && (!where.token || row.token === where.token) &&
    (!where.createdAt?.gt || row.createdAt > where.createdAt.gt) &&
    (!where.createdAt?.lte || row.createdAt <= where.createdAt.lte) &&
    (!where.expires?.gt || row.expires > where.expires.gt);
  const tx = {
    user: {
      findMany: async ({ where }: { where: { email: { equals: string } } }) => state.users.filter(user => user.email.toLowerCase() === where.email.equals.toLowerCase()),
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) => state.users.find(user => where.id ? user.id === where.id : user.email === where.email) ?? null,
      update: async ({ data }: { data: Partial<typeof state.users[number]> }) => {
        if (failUpdate) throw new Error('Database write failed');
        Object.assign(state.users[0], data);
        return state.users[0];
      },
    },
    passwordResetToken: {
      findMany: async ({ where }: { where: TokenWhere }) => state.tokens.filter(row => matches(row, where)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      findUnique: async ({ where }: { where: TokenWhere }) => state.tokens.find(row => matches(row, where)) ?? null,
      create: async ({ data }: { data: Omit<Token, 'createdAt'> }) => { state.tokens.push({ ...data, createdAt: new Date() }); },
      deleteMany: async ({ where }: { where: TokenWhere }) => {
        const before = state.tokens.length;
        state.tokens = state.tokens.filter(row => !matches(row, where));
        return { count: before - state.tokens.length };
      },
    },
    session: { deleteMany: async () => { state.sessions = 0; } },
    verificationToken: { deleteMany: async () => { state.verifications = 0; } },
    $queryRaw: async () => [],
  };
  const db = {
    ...tx,
    async $transaction<T>(callback: (transaction: typeof tx) => Promise<T>): Promise<T> {
      const previous = queue;
      let release!: () => void;
      queue = new Promise<void>(resolve => { release = resolve; });
      await previous;
      const snapshot = structuredClone(state);
      try { return await callback(tx); }
      catch (error) { Object.assign(state, snapshot); throw error; }
      finally { release(); }
    },
  };
  const service = createPasswordResetService(db as unknown as PrismaClient, async (email, token) => {
    if (failDelivery) throw new Error('SMTP failed');
    sent.push({ email, token });
  }, async email => {
    if (failNotification) throw new Error('SMTP failed');
    notifications.push(email);
  });
  return { state, sent, notifications, service,
    setFailDelivery: (value: boolean) => { failDelivery = value; },
    setFailNotification: () => { failNotification = true; },
    setFailUpdate: () => { failUpdate = true; },
  };
}

test('emails a random token, stores only its digest, and sets a 15 minute expiry', async () => {
  const f = await fixture();
  await f.service.request({ email: ' shopper@EXAMPLE.com ' });
  assert.equal(f.sent[0].email, 'Shopper@example.com');
  assert.match(f.sent[0].token, /^[a-f0-9]{64}$/);
  assert.equal(f.state.tokens[0].token, createHash('sha256').update(f.sent[0].token).digest('hex'));
  assert.ok(Math.abs(f.state.tokens[0].expires.getTime() - Date.now() - 900000) < 1000);
});

test('unknown, Google-only, inactive, ambiguous, and malformed accounts receive no link', async () => {
  for (const mode of ['unknown', 'oauth', 'inactive', 'ambiguous', 'malformed']) {
    const f = await fixture();
    if (mode === 'oauth') f.state.users[0].password = null;
    if (mode === 'inactive') f.state.users[0].status = 'SUSPENDED';
    if (mode === 'ambiguous') f.state.users.push({ ...f.state.users[0], id: 'user-2', email: 'shopper@example.com' });
    await f.service.request({ email: mode === 'unknown' ? 'unknown@example.com' : mode === 'malformed' ? 'invalid' : 'shopper@example.com' });
    assert.equal(f.sent.length, 0, mode);
  }
});

test('concurrent requests obey cooldown and hourly limit', async () => {
  const f = await fixture();
  await Promise.all(Array.from({ length: 5 }, () => f.service.request({ email: 'shopper@example.com' })));
  assert.equal(f.sent.length, 1);
  for (let i = 0; i < 3; i++) {
    for (const token of f.state.tokens) token.createdAt = new Date(Date.now() - 61000);
    await f.service.request({ email: 'shopper@example.com' });
  }
  assert.equal(f.sent.length, 3);
});

test('SMTP failure removes the undelivered token and allows retry', async () => {
  const f = await fixture();
  f.setFailDelivery(true);
  await assert.rejects(f.service.request({ email: 'shopper@example.com' }), /delivery failed/);
  assert.equal(f.state.tokens.length, 0);
  f.setFailDelivery(false);
  await f.service.request({ email: 'shopper@example.com' });
  assert.equal(f.sent.length, 1);
});

test('successful reset changes credentials, verifies email, invalidates sessions and all links', async () => {
  const f = await fixture();
  const oldVersion = passwordVersion(f.state.users[0].password);
  await f.service.request({ email: 'shopper@example.com' });
  f.state.tokens[0].createdAt = new Date(Date.now() - 61000);
  await f.service.request({ email: 'shopper@example.com' });
  assert.ok((await f.service.reset(f.sent[0].token, values)).success);
  assert.ok(await bcrypt.compare(values.password, f.state.users[0].password!));
  assert.equal(await bcrypt.compare('old-password', f.state.users[0].password!), false);
  assert.notEqual(passwordVersion(f.state.users[0].password), oldVersion);
  assert.equal(f.state.users[0].isEmailVerified, true);
  assert.equal(f.state.sessions, 0);
  assert.equal(f.state.verifications, 0);
  assert.equal(f.state.tokens.length, 0);
  assert.equal(f.notifications.length, 1);
  assert.equal((await f.service.reset(f.sent[1].token, values)).error, INVALID_RESET_MESSAGE);
});

test('malformed, unknown, expired and reused tokens cannot reset a password', async () => {
  const f = await fixture();
  for (const token of [null, '', 'a'.repeat(64)]) assert.equal((await f.service.reset(token, values)).error, INVALID_RESET_MESSAGE);
  await f.service.request({ email: 'shopper@example.com' });
  f.state.tokens[0].expires = new Date(Date.now() - 1);
  assert.equal((await f.service.reset(f.sent[0].token, values)).error, INVALID_RESET_MESSAGE);
  f.state.tokens[0].expires = new Date(Date.now() + 60000);
  assert.ok((await f.service.reset(f.sent[0].token, values)).success);
  assert.equal((await f.service.reset(f.sent[0].token, values)).error, INVALID_RESET_MESSAGE);
});

test('two concurrent redemptions have exactly one winner', async () => {
  const f = await fixture();
  await f.service.request({ email: 'shopper@example.com' });
  const results = await Promise.all([f.service.reset(f.sent[0].token, values), f.service.reset(f.sent[0].token, values)]);
  assert.equal(results.filter(result => result.success).length, 1);
  assert.equal(results.filter(result => result.error).length, 1);
});

test('write failure rolls back token consumption', async () => {
  const f = await fixture();
  await f.service.request({ email: 'shopper@example.com' });
  f.setFailUpdate();
  await assert.rejects(f.service.reset(f.sent[0].token, values), /Database write failed/);
  assert.equal(f.state.tokens.length, 1);
  assert.ok(await bcrypt.compare('old-password', f.state.users[0].password!));
});

test('password mismatch, short passwords and bcrypt byte overflow fail without consuming the link', async () => {
  const f = await fixture();
  await f.service.request({ email: 'shopper@example.com' });
  assert.ok((await f.service.reset(f.sent[0].token, { ...values, confirmPassword: 'different' })).error);
  assert.equal(f.state.tokens.length, 1);
  for (const password of ['short', 'a'.repeat(73), '😀'.repeat(19)]) {
    assert.equal(ResetPasswordSchema.safeParse({ password, confirmPassword: password }).success, false);
  }
});

test('notification failure does not undo a successful password reset', async () => {
  const f = await fixture();
  await f.service.request({ email: 'shopper@example.com' });
  f.setFailNotification();
  assert.ok((await f.service.reset(f.sent[0].token, values)).success);
  assert.equal(f.state.tokens.length, 0);
});

test('an account suspended after issuance cannot redeem its link', async () => {
  const f = await fixture();
  await f.service.request({ email: 'shopper@example.com' });
  f.state.users[0].status = 'BANNED';
  assert.equal((await f.service.reset(f.sent[0].token, values)).error, INVALID_RESET_MESSAGE);
});
