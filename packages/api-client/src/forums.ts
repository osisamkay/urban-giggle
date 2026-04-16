import type { SupabaseClient } from '@supabase/supabase-js';
import type { ForumCategory, ForumThread, ForumReply, ApiResponse, PaginatedResponse } from '@sharesteak/types';

export class ForumsAPI {
  constructor(private supabase: SupabaseClient) {}

  async getCategories(): Promise<ApiResponse<ForumCategory[]>> {
    try {
      const { data, error } = await this.supabase
        .from('forum_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data as ForumCategory[],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch categories',
        },
      };
    }
  }

  async getThreads(categoryId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<ForumThread>>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from('forum_threads')
        .select('*, author:users(id, first_name, last_name, avatar_url)', { count: 'exact' })
        .eq('category_id', categoryId)
        .order('pinned', { ascending: false })
        .order('last_activity_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          items: data as ForumThread[],
          page,
          limit,
          total: count || 0,
          hasMore: offset + limit < (count || 0),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch threads',
        },
      };
    }
  }

  async getThread(id: string): Promise<ApiResponse<ForumThread>> {
    try {
      const { data, error } = await this.supabase
        .from('forum_threads')
        .select('*, author:users(id, first_name, last_name, avatar_url)')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Increment view count
      await this.supabase
        .from('forum_threads')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);

      return {
        success: true,
        data: data as ForumThread,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch thread',
        },
      };
    }
  }

  async createThread(thread: {
    categoryId: string;
    title: string;
    content: string;
  }): Promise<ApiResponse<ForumThread>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('forum_threads')
        .insert({
          category_id: thread.categoryId,
          author_id: user.id,
          title: thread.title,
          content: thread.content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update category thread count
      await this.supabase.rpc('increment_category_threads', {
        p_category_id: thread.categoryId,
      });

      return {
        success: true,
        data: data as ForumThread,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create thread',
        },
      };
    }
  }

  async getReplies(threadId: string): Promise<ApiResponse<ForumReply[]>> {
    try {
      const { data, error } = await this.supabase
        .from('forum_replies')
        .select('*, author:users(id, first_name, last_name, avatar_url)')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as ForumReply[],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch replies',
        },
      };
    }
  }

  async createReply(reply: {
    threadId: string;
    content: string;
  }): Promise<ApiResponse<ForumReply>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('forum_replies')
        .insert({
          thread_id: reply.threadId,
          author_id: user.id,
          content: reply.content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update thread reply count and last activity
      await this.supabase.rpc('increment_thread_replies', {
        p_thread_id: reply.threadId,
      });

      return {
        success: true,
        data: data as ForumReply,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create reply',
        },
      };
    }
  }
}
