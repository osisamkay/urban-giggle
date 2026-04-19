import type { SupabaseClient } from '@supabase/supabase-js';
import type { GroupPurchase, GroupParticipant, PriceTier, ApiResponse, PaginatedResponse } from '@sharesteak/types';

export class GroupsAPI {
  constructor(private supabase: SupabaseClient) {}

  async getActiveGroups(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<GroupPurchase>>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from('group_purchases')
        .select(`
          *,
          product:products(*),
          organizer:users(*)
        `, { count: 'exact' })
        .eq('status', 'ACTIVE')
        .order('deadline', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          items: data as GroupPurchase[],
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
          message: error instanceof Error ? error.message : 'Failed to fetch groups',
        },
      };
    }
  }

  async getGroup(id: string): Promise<ApiResponse<GroupPurchase>> {
    try {
      const { data, error } = await this.supabase
        .from('group_purchases')
        .select(`
          *,
          product:products(*),
          organizer:users(*),
          participants:group_participants(*, user:users(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as GroupPurchase,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch group',
        },
      };
    }
  }

  async createGroup(group: {
    productId: string;
    title: string;
    description?: string;
    priceTiers: PriceTier[];
    minimumQuantity: number;
    targetQuantity: number;
    deadline: string;
  }): Promise<ApiResponse<GroupPurchase>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('group_purchases')
        .insert({
          product_id: group.productId,
          organizer_id: user.id,
          title: group.title,
          description: group.description,
          price_tiers: group.priceTiers,
          minimum_quantity: group.minimumQuantity,
          target_quantity: group.targetQuantity,
          deadline: group.deadline,
          status: 'ACTIVE',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as GroupPurchase,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create group',
        },
      };
    }
  }

  async joinGroup(groupId: string, quantity: number): Promise<ApiResponse<GroupParticipant>> {
    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join group via API');
      }

      const data = await response.json();

      return {
        success: true,
        data: data as GroupParticipant,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to join group',
        },
      };
    }
  }

  async leaveGroup(groupId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/groups/leave?groupId=${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave group via API');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to leave group',
        },
      };
    }
  }

  async getCurrentPrice(groupId: string): Promise<ApiResponse<number>> {
    try {
      const { data, error } = await this.supabase
        .from('group_purchases')
        .select('current_quantity, price_tiers')
        .eq('id', groupId)
        .single();

      if (error) throw error;

      const currentQuantity = data.current_quantity;
      const priceTiers = data.price_tiers as PriceTier[];

      // Find applicable tier
      const tier = priceTiers
        .sort((a, b) => b.minQuantity - a.minQuantity)
        .find((t) => currentQuantity >= t.minQuantity);

      const price = tier?.pricePerUnit || priceTiers[0].pricePerUnit;

      return {
        success: true,
        data: price,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to calculate price',
        },
      };
    }
  }
}
