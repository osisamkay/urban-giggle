import { supabase } from '../supabase/client';
import type { Database } from '../supabase/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

export const notificationsApi = {
  // Get user's notifications
  getUserNotifications: async (userId: string, unreadOnly = false) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      // @ts-ignore - Type issue with Supabase generated types
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      // @ts-ignore - Type issue with Supabase generated types
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Delete a notification
  deleteNotification: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Create a notification
  createNotification: async (notification: {
    user_id: string;
    type: 'ORDER_UPDATE' | 'GROUP_PURCHASE_UPDATE' | 'MESSAGE' | 'REVIEW' | 'SYSTEM';
    title: string;
    message: string;
    link?: string;
  }) => {
    const { data, error } = await supabase
      .from('notifications')
      // @ts-ignore - Type issue with Supabase generated types
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  // Get unread count
  getUnreadCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },
};
