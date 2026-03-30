import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cartStore';

const mockProduct = {
  id: 'prod-1',
  sellerId: 'seller-1',
  title: 'Premium Ribeye',
  description: 'AAA Alberta beef',
  category: 'BEEF' as const,
  price: 45.99,
  unit: 'lb',
  images: ['https://example.com/ribeye.jpg'],
  inventory: 50,
  status: 'ACTIVE' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProduct2 = {
  ...mockProduct,
  id: 'prod-2',
  title: 'Ground Beef',
  price: 12.99,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe('cartStore', () => {
  it('should start with empty cart', () => {
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getTotal()).toBe(0);
    expect(useCartStore.getState().getItemCount()).toBe(0);
  });

  it('should add item to cart', () => {
    useCartStore.getState().addItem(mockProduct, 2);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('prod-1');
    expect(items[0].quantity).toBe(2);
    expect(items[0].product).toEqual(mockProduct);
  });

  it('should increase quantity when adding existing item', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    useCartStore.getState().addItem(mockProduct, 3);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
  });

  it('should calculate total correctly', () => {
    useCartStore.getState().addItem(mockProduct, 2); // 45.99 * 2 = 91.98
    useCartStore.getState().addItem(mockProduct2, 3); // 12.99 * 3 = 38.97

    expect(useCartStore.getState().getTotal()).toBeCloseTo(130.95, 2);
  });

  it('should count items correctly', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    useCartStore.getState().addItem(mockProduct2, 3);

    expect(useCartStore.getState().getItemCount()).toBe(5);
  });

  it('should update quantity', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    useCartStore.getState().updateQuantity('prod-1', 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('should remove item when quantity set to 0', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    useCartStore.getState().updateQuantity('prod-1', 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('should remove item', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    useCartStore.getState().addItem(mockProduct2, 1);
    useCartStore.getState().removeItem('prod-1');

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe('prod-2');
  });

  it('should clear cart', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    useCartStore.getState().addItem(mockProduct2, 1);
    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getTotal()).toBe(0);
  });
});
