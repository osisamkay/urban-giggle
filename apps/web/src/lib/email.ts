// Email notification templates using Supabase Edge Functions or SMTP
// For now, creates notifications in DB that can trigger email via Supabase hooks

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export type EmailTemplate = 
  | 'order_confirmation'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_refunded'
  | 'group_joined'
  | 'group_completed'
  | 'group_expired'
  | 'welcome'
  | 'password_reset';

interface EmailPayload {
  to: string;
  userId: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

// Create a notification + queue email
export async function sendEmailNotification(payload: EmailPayload) {
  const { to, userId, template, data } = payload;

  const subjects: Record<EmailTemplate, string> = {
    order_confirmation: `Order #${data.orderId?.slice(0, 8)} confirmed`,
    order_shipped: `Your order has shipped!`,
    order_delivered: `Your order has been delivered`,
    order_refunded: `Refund processed for order #${data.orderId?.slice(0, 8)}`,
    group_joined: `You joined "${data.groupTitle}"`,
    group_completed: `Group purchase "${data.groupTitle}" completed!`,
    group_expired: `Group purchase "${data.groupTitle}" has expired`,
    welcome: `Welcome to ShareSteak!`,
    password_reset: `Password reset request`,
  };

  const messages: Record<EmailTemplate, string> = {
    order_confirmation: `Your order of $${data.total?.toFixed(2)} CAD has been confirmed and is being processed.`,
    order_shipped: `Your order is on its way! Tracking: ${data.trackingNumber || 'Pending'}`,
    order_delivered: `Your order has been delivered. Enjoy your meat!`,
    order_refunded: `A refund of $${data.total?.toFixed(2)} CAD has been processed to your payment method.`,
    group_joined: `You've joined the group purchase "${data.groupTitle}" with ${data.quantity} units.`,
    group_completed: `Great news! The group purchase reached its target. Your order is being processed.`,
    group_expired: `Unfortunately, the group purchase didn't reach its minimum. No charges were made.`,
    welcome: `Welcome to ShareSteak! Start browsing quality meat from local producers.`,
    password_reset: `Click the link in your email to reset your password.`,
  };

  const notificationType = template.startsWith('order') ? 'ORDER_UPDATE'
    : template.startsWith('group') ? 'GROUP_PURCHASE_UPDATE'
    : 'SYSTEM';

  // Create in-app notification
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type: notificationType,
      title: subjects[template],
      message: messages[template],
      link: data.link || null,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }

  // TODO: Send actual email via Resend, SendGrid, or Supabase Edge Function
  // For now, log it
  console.log(`📧 Email queued: ${template} → ${to}`);
  console.log(`   Subject: ${subjects[template]}`);

  return { success: true, template, to };
}

// Convenience wrappers
export async function sendOrderConfirmation(userId: string, email: string, order: any) {
  return sendEmailNotification({
    to: email,
    userId,
    template: 'order_confirmation',
    data: { orderId: order.id, total: order.total, link: `/orders/${order.id}` },
  });
}

export async function sendWelcomeEmail(userId: string, email: string) {
  return sendEmailNotification({
    to: email,
    userId,
    template: 'welcome',
    data: { link: '/products' },
  });
}

export async function sendGroupCompletedEmail(userId: string, email: string, group: any) {
  return sendEmailNotification({
    to: email,
    userId,
    template: 'group_completed',
    data: { groupTitle: group.title, link: `/groups/${group.id}` },
  });
}
