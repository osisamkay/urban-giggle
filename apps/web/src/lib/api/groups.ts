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
    return data;
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
            last_name
          )
        )
      `)
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data;
  },

  // Join a group purchase
  joinGroup: async (groupId: string, userId: string, quantity: number) => {
    // Add participant
    const { data: participant, error: participantError } = await supabase
      .from('group_participants')
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

    if (groupError) throw groupError;

    const { error: updateError } = await supabase
      .from('group_purchases')
      .update({
        current_quantity: (group.current_quantity || 0) + quantity,
        participant_count: (group.participant_count || 0) + 1,
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

    if (groupError) throw groupError;

    const { error: updateError } = await supabase
      .from('group_purchases')
      .update({
        current_quantity: (group.current_quantity || 0) - participant.quantity,
        participant_count: (group.participant_count || 0) - 1,
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
    return data;
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
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
