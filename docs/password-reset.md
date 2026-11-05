# Password recovery

Login now links to `/auth/forgot-password`. Emails link to `/auth/reset-password?token=…`. Google-only, inactive, unknown, or ambiguous email accounts do not receive reset links; responses do not disclose account existence.

Configure these values in `.env` (restart the server after changing them):

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-sending-address@gmail.com
EMAIL_PASSWORD=your-smtp-or-app-password
EMAIL_FROM="Zenn <your-sending-address@gmail.com>"
```

Use your deployed HTTPS origin in production. Gmail requires an app password. Port 465 uses implicit TLS; port 587 uses STARTTLS. `EMAIL_FROM` falls back to `EMAIL_USER`.

The existing Prisma `PasswordResetToken` model must be present in the database. The repository's historical migrations do not include this existing model; environments created solely from those migrations need their schema reconciled before using this flow. No schema fields were added by this feature.

Tokens contain 32 random bytes, are stored as SHA-256 digests, expire after 15 minutes, and are consumed with the password change in a database transaction. Requests are serialized per account, limited to one per minute and three per hour. Earlier unexpired links remain usable until any reset succeeds. Delivery failures remove only the affected token, allowing a retry. Account lookup and email sending run with Next.js `after()` so the response does not wait on account-specific work; background failures are logged without tokens or addresses.

Resetting verifies ownership of the email, updates the bcrypt password, removes remaining reset/verification tokens, clears database sessions, and invalidates JWT sessions using a password fingerprint. Existing sessions issued before this feature will also need to sign in again. Recovery pages remain accessible while signed in. Password reset does not activate suspended/banned accounts or add passwords to Google-only accounts.

Run `npm run test:password-reset` for the service tests. With working SMTP, request a link for an existing credentials account, open the email, submit matching passwords, and sign in with the new password. Confirm that the old password and reused link fail, and that other sessions require a fresh login. A missing mail configuration displays a temporary-unavailability message.

Security reference: [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
