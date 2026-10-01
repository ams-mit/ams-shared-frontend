import type { BackendNotification, CreateNotificationPayload } from '@/features/notifications/types/notification.types';
import { ROUTES } from '@/constants/routes';
import { createCollection, mockActor, numericId, nowIso, respond } from './mockDb';

// Demo-mode stand-in for community-service notifications (COMM-008 to COMM-010). Read state is
// kept per user, so marking a notification read for one persona doesn't affect another.

interface StoredNotification extends Omit<BackendNotification, 'isRead' | 'readAt'> {
  /** ALL, or one of the UI roles (ADMIN, STAFF, RESIDENT, OWNER). */
  audience: string;
  readBy: Record<string, string>;
}

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const notifications = createCollection<StoredNotification>('notifications', () => [
  {
    id: 1,
    audience: 'ALL',
    title: 'Quarterly Fire Alarm & Siren Verification',
    summary: 'Testing of sirens, detectors and emergency elevators this Saturday at 10:00 AM.',
    message:
      'The quarterly fire safety inspection will take place this Saturday from 10:00 AM to 11:30 AM across all towers. Elevators will briefly park at ground level. No evacuation is required.',
    type: 'maintenance',
    category: 'MAINTENANCE',
    priority: 'high',
    issuedBy: 'Central Operations & Safety',
    affectedArea: 'Tower A, Tower B & Underground Parking',
    actionRoute: ROUTES.ANNOUNCEMENTS,
    actionLabel: 'View Bulletin',
    createdAt: minutesAgo(15),
    readBy: {},
  },
  {
    id: 2,
    audience: 'ALL',
    title: 'Swimming Pool Scheduled Maintenance',
    summary: 'Water filtration maintenance on Monday morning; the pool reopens at 2:00 PM.',
    message: 'The pool will be closed on Monday from 6:00 AM to 2:00 PM for filtration system maintenance.',
    type: 'facility',
    category: 'FACILITY',
    priority: 'normal',
    issuedBy: 'Facilities Management',
    affectedArea: 'Level 5 Pool Deck',
    actionRoute: ROUTES.FACILITIES,
    actionLabel: 'View Facilities',
    createdAt: minutesAgo(180),
    readBy: {},
  },
  {
    id: 3,
    audience: 'RESIDENT',
    title: 'Your invoice for last month is ready',
    summary: 'Management, parking, clubhouse and utility charges have been billed.',
    message: 'Your monthly invoice has been issued. Payment is due on the 15th. Contact the finance office for any questions.',
    type: 'announcement',
    category: 'BULLETIN',
    priority: 'normal',
    issuedBy: 'Finance Office',
    createdAt: minutesAgo(60 * 20),
    readBy: {},
  },
  {
    id: 4,
    audience: 'STAFF',
    title: 'Visitor parking overflow expected',
    summary: 'A community event on Saturday may fill visitor parking; direct overflow to Basement 2.',
    message: 'Please direct overflow visitor vehicles to Basement 2 on Saturday between 4 PM and 10 PM.',
    type: 'security',
    category: 'SECURITY',
    priority: 'high',
    issuedBy: 'Security Desk',
    affectedArea: 'Visitor Parking',
    actionRoute: ROUTES.VISITORS,
    actionLabel: 'Open Visitor Log',
    createdAt: minutesAgo(45),
    readBy: {},
  },
  {
    id: 5,
    audience: 'ADMIN',
    title: 'New registration requests waiting',
    summary: 'Several self-registered residents are waiting for account activation.',
    message: 'Review pending registrations on the Users page under Registration Requests.',
    type: 'announcement',
    category: 'BULLETIN',
    priority: 'normal',
    issuedBy: 'Identity & Access',
    actionRoute: ROUTES.USERS,
    actionLabel: 'Review Requests',
    createdAt: minutesAgo(90),
    readBy: {},
  },
  {
    id: 6,
    audience: 'OWNER',
    title: 'Owners’ association meeting',
    summary: 'The annual owners’ meeting is on the last Sunday of the month in the clubhouse.',
    message: 'Agenda items include the sinking fund and lobby renovation. Proxy forms are available from the management office.',
    type: 'announcement',
    category: 'BULLETIN',
    priority: 'normal',
    issuedBy: 'Management Office',
    createdAt: minutesAgo(60 * 30),
    readBy: {},
  },
]);

const forViewer = (n: StoredNotification, viewerId: string): BackendNotification => {
  const { audience: _audience, readBy, ...rest } = n;
  return { ...rest, recipientId: n.recipientId, isRead: Boolean(readBy[viewerId]), readAt: readBy[viewerId] };
};

const visibleTo = (n: StoredNotification, userId: string, role: string) =>
  n.recipientId ? n.recipientId === userId : n.audience === 'ALL' || n.audience === role;

export const mockNotificationApi = {
  getNotifications: (recipientId?: string, role?: string, unreadOnly?: boolean): Promise<BackendNotification[]> =>
    respond(() => {
      const actor = mockActor();
      const userId = recipientId ?? actor.id;
      return notifications
        .all()
        .filter((n) => visibleTo(n, userId, role ?? actor.role))
        .map((n) => forViewer(n, userId))
        .filter((n) => !unreadOnly || !n.isRead)
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    }),

  createNotification: (payload: CreateNotificationPayload): Promise<BackendNotification> =>
    respond(() => {
      const created = notifications.insert({
        ...payload,
        id: numericId(),
        audience: payload.recipientRole ?? 'ALL',
        createdAt: nowIso(),
        readBy: {},
      });
      return forViewer(created, mockActor().id);
    }),

  markAsRead: (notificationId: string | number): Promise<BackendNotification> =>
    respond(() => {
      const userId = mockActor().id;
      const n = notifications.require(Number(notificationId), 'NOTIFICATION_NOT_FOUND', 'This notification could not be found.');
      const updated = notifications.update(n.id, { readBy: { ...n.readBy, [userId]: nowIso() } });
      return forViewer(updated, userId);
    }),

  markAllAsRead: (recipientId?: string): Promise<{ updatedCount: number }> =>
    respond(() => {
      const actor = mockActor();
      const userId = recipientId ?? actor.id;
      let updatedCount = 0;
      notifications
        .all()
        .filter((n) => visibleTo(n, userId, actor.role) && !n.readBy[userId])
        .forEach((n) => {
          notifications.update(n.id, { readBy: { ...n.readBy, [userId]: nowIso() } });
          updatedCount += 1;
        });
      return { updatedCount };
    }),
};
