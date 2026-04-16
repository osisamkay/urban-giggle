import { supabase } from '../supabase/client';
import type { Database } from '../supabase/database.types';

type GroupPurchase = Database['public']['Tables']['group_purchases']['Row'];

export const groupsApi = {
  // Get all active group purchases
  getActiveGroups: async () => {
    const { data, error } = await supabase
      .from('group_purchases')
      .select(`
        *,
        product:products(
          id,
          title,
          images,
          category,
          unit
        ),
        organizer:users(
          first_name,
          last_name
        )
      `)
      .eq('status', 'ACTIVE')
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data as any;
  },

  // Get a single group purchase by ID
  getGroup: async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_purchases')
      .select(`
        *,
        product:products(
          id,
          title,
          description,
          images,
          category,
          unit,
          seller:seller_profiles(
            business_name,
            rating,
            verified
          )
        ),
        organizer:users(
          first_name,
          last_name
        ),
        participants:group_participants(
          id,
          user_id,
          quantity,
          joined_at,
          user:users(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data as any;
  },

  // Join a group purchase
  joinGroup: async (groupId: string, userId: string, quantity: number) => {
    // Add participant
    const { data: participant, error: participantError } = await supabase
      .from('group_participants')
      // @ts-ignore - Type issue with Supabase generated types
      .insert({
        group_id: groupId,
        user_id: userId,
        quantity,
      })
      .select()
      .single();

    if (participantError) throw participantError;

    // Update group counts
    const { data: group, error: groupError } = await supabase
      .from('group_purchases')
      .select('current_quantity, participant_count')
      .eq('id', groupId)
      .single();

    if (groupError || !group) throw groupError || new Error('Group not found');

    const { error: updateError } = await supabase
      .from('group_purchases')
      // @ts-ignore - Type issue with Supabase generated types
      .update({
        current_quantity: ((group as any).current_quantity || 0) + quantity,
        participant_count: ((group as any).participant_count || 0) + 1,
      })
      .eq('id', groupId);

    if (updateError) throw updateError;

    return participant;
  },

  // Leave a group purchase
  leaveGroup: async (groupId: string, userId: string) => {
    // Get participant's quantity
    const { data: participant, error: getError } = await supabase
      .from('group_participants')
      .select('quantity')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (getError) throw getError;

    // Remove participant
    const { error: deleteError } = await supabase
      .from('group_participants')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Update group counts
    const { data: group, error: groupError } = await supabase
      .from('group_purchases')
      .select('current_quantity, participant_count')
      .eq('id', groupId)
      .single();

    if (groupError || !group) throw groupError || new Error('Group not found');
    if (!participant) throw new Error('Participant not found');

    const { error: updateError } = await supabase
      .from('group_purchases')
      // @ts-ignore - Type issue with Supabase generated types
      .update({
        current_quantity: ((group as any).current_quantity || 0) - (participant as any).quantity,
        participant_count: ((group as any).participant_count || 0) - 1,
      })
      .eq('id', groupId);

    if (updateError) throw updateError;
  },

  // Check if user is in a group
  isUserInGroup: async (groupId: string, userId: string) => {
    const { data, error } = await supabase
      .from('group_participants')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Get user's group purchases
  getUserGroups: async (userId: string) => {
    const { data, error } = await supabase
      .from('group_participants')
      .select(`
        *,
        group:group_purchases(
          *,
          product:products(
            title,
            images,
            unit
          )
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data as any;
  },

  // Create a new group purchase
  createGroup: async (groupData: {
    product_id: string;
    organizer_id: string;
    title: string;
    description?: string;
    price_tiers: any;
    minimum_quantity: number;
    target_quantity: number;
    deadline: string;
  }) => {
    const { data, error } = await supabase
      .from('group_purchases')
      // @ts-ignore - Type issue with Supabase generated types
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  // Get groups organized by seller
  getSellerGroups: async (sellerId: string) => {
    const { data, error } = await supabase
      .from('group_purchases')
      .select(`
        *,
        product:products(
          title,
          images,
          unit
        )
      `)
      .eq('organizer_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update group status
  updateGroupStatus: async (groupId: string, status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED') => {
    const { data, error } = await supabase
      .from('group_purchases')
      // @ts-ignore
      .update({ status })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all groups for admin
  getAllGroups: async () => {
    const { data, error } = await supabase
      .from('group_purchases')
      .select(`
        *,
        product:products(title, images),
        organizer:users(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
  },

  // Get group stats for admin dashboard
  getGroupStats: async () => {
    const { data, error } = await supabase
      .from('group_purchases')
      .select('id, status, current_quantity, target_quantity, participant_count, deadline');

    if (error) throw error;

    const groups = data || [];
    const activeGroups = groups.filter((g: any) => g.status === 'ACTIVE').length;
    const completedGroups = groups.filter((g: any) => g.status === 'COMPLETED').length;
    const totalParticipants = groups.reduce((sum: number, g: any) => sum + (g.participant_count || 0), 0);

    // Groups expiring soon (within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const expiringSoon = groups.filter((g: any) =>
      g.status === 'ACTIVE' && new Date(g.deadline) <= threeDaysFromNow
    ).length;

    return {
      totalGroups: groups.length,
      activeGroups,
      completedGroups,
      totalParticipants,
      expiringSoon,
    };
  },
};
