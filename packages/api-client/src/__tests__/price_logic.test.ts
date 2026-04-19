import { describe, it, expect } from 'vitest';
import { OrdersAPI } from '../orders';
import { GroupsAPI } from '../groups';

// Mocking the Supabase Client to test logic without a live DB
const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: { id: 'user-123' } }, error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: { 
            current_quantity: 15, 
            price_tiers: [
              { minQuantity: 1, pricePerUnit: 100 },
              { minQuantity: 10, pricePerUnit: 80 },
              { minQuantity: 20, pricePerUnit: 60 },
            ] 
          },
          error: null,
        }),
      }),
    }),
  }),
};

describe('GroupsAPI - Price Logic', () => {
  it('should return the base price when quantity is below the first tier', async () => {
    const api = new GroupsAPI(mockSupabase as any);
    const price = await api.getCurrentPrice('group-1');
    // 15 is >= 10 but < 20, so it should be 80
    expect(price.success).toBe(true);
    expect(price.data).toBe(80);
  });

  it('should return the highest applicable tier price', async () => {
    const mockSupabaseHigh = {
      ...mockSupabase,
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { 
                current_quantity: 25, 
                price_tiers: [
                  { minQuantity: 1, pricePerUnit: 100 },
                  { minQuantity: 10, pricePerUnit: 80 },
                  { minQuantity: 20, pricePerUnit: 60 },
                ] 
              },
              error: null,
            }),
          }),
        }),
      }),
    };
    const api = new GroupsAPI(mockSupabaseHigh as any);
    const price = await api.getCurrentPrice('group-1');
    expect(price.success).toBe(true);
    expect(price.data).toBe(60);
  });

  it('should fallback to the first tier if no tiers are met', async () => {
    const mockSupabaseLow = {
      ...mockSupabase,
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { 
                current_quantity: 5, 
                price_tiers: [
                  { minQuantity: 10, pricePerUnit: 80 },
                  { minQuantity: 20, pricePerUnit: 60 },
                ] 
              },
              error: null,
            }),
          }),
        }),
      }),
    };
    const api = new GroupsAPI(mockSupabaseLow as any);
    const price = await api.getCurrentPrice('group-1');
    expect(price.success).toBe(true);
    expect(price.data).toBe(80); // Fallback to first tier
  });
});
