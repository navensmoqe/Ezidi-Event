import { NotificationItem } from '@/types/database';
import { db } from '@/lib/db';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string | null;
  sendEmail?: boolean;
}

export interface EmailDispatchOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

/**
 * NotificationService abstraction supporting in-app notifications and email dispatch.
 */
export class NotificationService {
  /**
   * Dispatch an in-app notification to a user.
   */
  static async send(params: CreateNotificationParams): Promise<NotificationItem> {
    const notification: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'info',
      link: params.link || null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    await db.notifications.create(notification);

    if (params.sendEmail) {
      // Find user email if available and trigger email dispatcher
      const user = await db.users.findById(params.userId);
      if (user?.email) {
        await this.dispatchEmail({
          to: user.email,
          subject: params.title,
          htmlContent: `<p>${params.message}</p>${params.link ? `<p><a href="${params.link}">View Details</a></p>` : ''}`,
        });
      }
    }

    return notification;
  }

  /**
   * Email provider hook abstraction (e.g. Resend / SendGrid / SMTP).
   */
  static async dispatchEmail(options: EmailDispatchOptions): Promise<boolean> {
    try {
      // If external email provider is configured, call API here:
      // console.log(`[Email Dispatch Hook] Sent email to ${options.to}: "${options.subject}"`);
      return true;
    } catch (err) {
      console.error('Failed to dispatch notification email:', err);
      return false;
    }
  }

  /**
   * Notify all system administrators.
   */
  static async notifyAdmins(title: string, message: string, link?: string): Promise<void> {
    const admins = await db.users.findAdmins();
    for (const admin of admins) {
      await this.send({
        userId: admin.id,
        title,
        message,
        type: 'warning',
        link,
      });
    }
  }
}
