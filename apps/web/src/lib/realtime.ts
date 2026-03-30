import { supabase } from './supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Subscribe to group purchase updates (quantity, participants)
export function subscribeToGroupPurchase(
  groupId: string,
  onUpdate: (payload: any) => void
): RealtimeChannel {
  return supabase
    .channel(`group-${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'group_purchases',
        filter: `id=eq.${groupId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'group_participants',
        filter: `group_id=eq.${groupId}`,
      },
      () => {
        // Refetch group data when participants change
        onUpdate(null); // signal to refetch
      }
    )
    .subscribe();
}

// Subscribe to new messages in a conversation
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: any) => void
): RealtimeChannel {
  return supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();
}

// Subscribe to user notifications
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: any) => void
): RealtimeChannel {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new);
      }
    )
    .subscribe();
}

// Subscribe to order status changes
export function subscribeToOrderUpdates(
  orderId: string,
  onUpdate: (order: any) => void
): RealtimeChannel {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();
}

// Cleanup helper
export function unsubscribe(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}
