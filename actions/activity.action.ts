'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

// A 'use server' file may only export async functions, so these stay module-private.
const ACTIVITY_ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'ARCHIVE'] as const;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_QUERY_LENGTH = 100;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

interface LogActivityParams {
  action: ActivityAction;
  entity: string;
  entityName: string;
  entityId: string;
  /** UPDATE logs: compareData() output. Other actions: null, or a small snapshot of the record. */
  details?: Prisma.InputJsonValue | null;
}

const isActivityAction = (value: unknown): value is ActivityAction =>
  typeof value === 'string' && (ACTIVITY_ACTIONS as readonly string[]).includes(value);

/**
 * Records an admin action. Never throws: a failed log write must not fail the action being logged.
 * Exported from a 'use server' file, so it is a public endpoint — only admins may write to the log.
 */
export const logActivity = async ({ action, entity, entityId, entityName, details }: LogActivityParams) => {
  try {
    const admin = await requireAdmin();
    if (!isActivityAction(action)) throw new Error(`unknown activity action: ${String(action)}`);

    await prisma.activityLog.create({
      data: {
        action,
        userId: admin.id,
        entity: String(entity).toUpperCase(),
        entityId: String(entityId),
        entityName: String(entityName),
        // Prisma rejects a literal `null` for Json columns; DbNull stores SQL NULL.
        details: details ?? Prisma.DbNull,
      },
    });
  } catch (err) {
    console.error('[activity log error]:', err);
  }
};

const activityLogInclude = {
  user: { select: { name: true, firstName: true, lastName: true, email: true, image: true, avatar: true } },
} satisfies Prisma.ActivityLogInclude;

export type ActivityLogEntry = Prisma.ActivityLogGetPayload<{ include: typeof activityLogInclude }>;

export interface ActivityLogQuery {
  page?: number;
  pageSize?: number;
  action?: string;
  entity?: string;
  q?: string;
}

export interface ActivityLogFilters {
  action: ActivityAction | null;
  entity: string | null;
  q: string;
}

export type ActivityLogPage =
  | {
      success: true;
      logs: ActivityLogEntry[];
      /** Entries matching the filters. */
      total: number;
      /** Whether the log holds any entries at all (to tell "empty log" from "no matches"). */
      hasAnyLogs: boolean;
      page: number;
      pageSize: number;
      totalPages: number;
      filters: ActivityLogFilters;
      /** Entity types that appear in the log, for the entity filter. */
      entities: string[];
    }
  | { success: false; message: string; filters: ActivityLogFilters };

const toFilters = ({ action, entity, q }: ActivityLogQuery): ActivityLogFilters => {
  const normalisedAction = typeof action === 'string' ? action.toUpperCase() : null;
  const normalisedEntity = typeof entity === 'string' ? entity.trim().toUpperCase() : '';
  return {
    action: isActivityAction(normalisedAction) ? normalisedAction : null,
    entity: /^[A-Z_]{1,40}$/.test(normalisedEntity) ? normalisedEntity : null,
    q: typeof q === 'string' ? q.trim().slice(0, MAX_QUERY_LENGTH) : '',
  };
};

const clampInt = (value: unknown, min: number, max: number, fallback: number) => {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : fallback;
  return Math.min(Math.max(n, min), max);
};

/** One page of the activity log, newest first, filtered by action / entity / free text. */
export const getActivityLogs = async (query: ActivityLogQuery = {}): Promise<ActivityLogPage> => {
  await requireAdmin();

  const filters = toFilters(query);
  const pageSize = clampInt(query.pageSize, 1, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE);

  const where: Prisma.ActivityLogWhereInput = {
    ...(filters.action && { action: filters.action }),
    ...(filters.entity && { entity: filters.entity }),
    ...(filters.q && {
      OR: [
        { entityName: { contains: filters.q, mode: 'insensitive' } },
        { user: { name: { contains: filters.q, mode: 'insensitive' } } },
        { user: { email: { contains: filters.q, mode: 'insensitive' } } },
      ],
    }),
  };
  const isFiltered = Boolean(filters.action || filters.entity || filters.q);

  try {
    const [total, entityRows] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({ distinct: ['entity'], select: { entity: true }, orderBy: { entity: 'asc' } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = clampInt(query.page, 1, totalPages, 1);

    const logs =
      total === 0
        ? []
        : await prisma.activityLog.findMany({
            where,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: activityLogInclude,
          });

    return {
      success: true,
      logs,
      total,
      hasAnyLogs: isFiltered ? entityRows.length > 0 : total > 0,
      page,
      pageSize,
      totalPages,
      filters,
      entities: entityRows.map(row => row.entity),
    };
  } catch (err) {
    console.error('[activity log error]:', err);
    return { success: false, message: 'The activity log could not be loaded.', filters };
  }
};

/**
 * Wipes the activity log. The purge itself is recorded (who, when, how many entries) in the same
 * transaction, so clearing the log never leaves it without a trace.
 */
export const deleteAllActivityLogs = async (): Promise<{ success: boolean; message: string }> => {
  const admin = await requireAdmin();
  try {
    const count = await prisma.$transaction(async tx => {
      const deleted = await tx.activityLog.deleteMany();
      await tx.activityLog.create({
        data: {
          action: 'DELETE',
          entity: 'ACTIVITY_LOG',
          entityId: 'all',
          entityName: 'Activity log',
          userId: admin.id,
          details: { deletedEntries: deleted.count },
        },
      });
      return deleted.count;
    });

    revalidatePath('/admin/activities');
    return { success: true, message: count === 1 ? 'Deleted 1 log entry' : `Deleted ${count.toLocaleString('en-US')} log entries` };
  } catch (error) {
    console.error('error deleting logs', error);
    return { success: false, message: 'Could not delete the activity log. Please try again.' };
  }
};
