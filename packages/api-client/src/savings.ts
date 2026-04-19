export interface BuyerSavings {
  total_saved: number;
  total_spent: number;
  groups_joined: number;
  carbon_offset_kg: number;
  last_updated: string;
}

export class SavingsAPI {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Fetch the current user's savings vault data
   */
  async getMySavings(): Promise<BuyerSavings | null> {
    const { data, error } = await this.supabase
      .from('buyer_savings_vault')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore 'no rows found'
    return data;
  }
}
