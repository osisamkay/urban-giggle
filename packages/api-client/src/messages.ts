import type { SupabaseClient } from '@supabase/supabase-js';
import type { Conversation, Message, ApiResponse } from '@sharesteak/types';

export class MessagesAPI {
  constructor(private supabase: SupabaseClient) {}

  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Conversation[],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch conversations',
        },
      };
    }
  }

  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    try {
      const response = await fetch(`/api/messages/get?conversationId=${conversationId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages via API');
      }

      const data = await response.json();

      return {
        success: true,
        data: data as Message[],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch messages',
        },
      };
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<ApiResponse<Message>> {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message via API');
      }

      const data = await response.json();

      return {
        success: true,
        data: data as Message,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to send message',
        },
      };
    }
  }

  async createConversation(participantId: string): Promise<ApiResponse<Conversation>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const participants = [user.id, participantId];

      const { data, error } = await this.supabase
        .from('conversations')
        .insert({ participants })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Conversation,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create conversation',
        },
      };
    }
  }

  async markAsRead(conversationId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await this.supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to mark messages as read',
        },
      };
    }
  }
}
