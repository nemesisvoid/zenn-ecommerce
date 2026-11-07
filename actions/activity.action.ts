'use server';

import { requireAdmin } from '@/lib/auth-guards';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface LogActivityParams {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE';
  entity: string;
  entityName: string;
  entityId: string;
  details?: any;
}
export const logActivity = async ({ action, entity, entityId, entityName, details }: LogActivityParams) => {
  try {
    const session = await auth();
    const user = session?.user.id;

    if (!user) {
      console.error('activity log failed, no authenticated user found');
      return;
    }

    await prisma.activityLog.create({
      data: {
        action,
        userId: user,
        entity,
        entityId,
        entityName,
        details,
      },
    });
  } catch (err) {
    console.error('[activity log error]:', err);
  }
};

export const getAllActivityLogs = async () => {
  await requireAdmin();
  try {
    const data = await prisma.activityLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: { user: { select: { name: true, image: true } } },
    });
    return data;
  } catch (err) {
    console.error('[activity log error]:', err);
  }
};

export const deleteAllActivityLogs = async () => {
  await requireAdmin();
  try {
    await prisma.activityLog.deleteMany();
    return { success: true, message: 'Logs deleted successfully' };
  } catch (error) {
    console.error('error deleting logs', error);
  }
};
