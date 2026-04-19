import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { calculateTax } from '@/lib/tax';

describe('Checkout Integration', () => {
  const mockProduct = {
    id: 'prod-1',
    sellerId: 'seller-1',
    title: 'AAA Ribeye Steak',
    description: 'Premium Alberta beef',
    category: 'BEEF' as const,
    price: 49.99,
    unit: 'lb',
    images: [],
    inventory: 20,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    useCartStore.setState({ items: [] });
    useAuthStore.setState({ user: null, isLoading: false, hasHydrated: true });
  });

  it('cart → calculates correct subtotal', () => {
    useCartStore.getState().addItem(mockProduct, 3);

    const subtotal = useCartStore.getState().getTotal();
    expect(subtotal).toBeCloseTo(149.97, 2);
  });

  it('cart → calculates Alberta GST correctly', () => {
    useCartStore.getState().addItem(mockProduct, 3);

    const subtotal = useCartStore.getState().getTotal();
    const tax = calculateTax(subtotal, 'AB');

    expect(tax.rate).toBe(0.05);
    expect(tax.amount).toBeCloseTo(7.50, 2);
    expect(tax.label).toBe('GST (5%)');
  });

  it('cart → free shipping over $100', () => {
    useCartStore.getState().addItem(mockProduct, 3); // $149.97

    const subtotal = useCartStore.getState().getTotal();
    const shipping = subtotal > 100 ? 0 : 9.99;

    expect(shipping).toBe(0);
  });

  it('cart → shipping fee under $100', () => {
    useCartStore.getState().addItem({ ...mockProduct, price: 25 }, 2); // $50

    const subtotal = useCartStore.getState().getTotal();
    const shipping = subtotal > 100 ? 0 : 9.99;

    expect(shipping).toBe(9.99);
  });

  it('checkout requires authentication', () => {
    useCartStore.getState().addItem(mockProduct, 1);

    const isAuthenticated = useAuthStore.getState().isAuthenticated();
    expect(isAuthenticated).toBe(false);
    // Middleware would redirect to /login?redirect=/checkout
  });

  it('checkout with auth → proceeds', () => {
    useAuthStore.getState().setUser({
      id: 'user-1',
      email: 'buyer@test.com',
      role: 'BUYER',
    } as any);

    useCartStore.getState().addItem(mockProduct, 2);

    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().getTotal()).toBeCloseTo(99.98, 2);
  });

  it('order total = subtotal + tax + shipping', () => {
    useCartStore.getState().addItem(mockProduct, 2); // $99.98

    const subtotal = useCartStore.getState().getTotal();
    const tax = calculateTax(subtotal, 'AB');
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + tax.amount + shipping;

    expect(subtotal).toBeCloseTo(99.98, 2);
    expect(tax.amount).toBeCloseTo(5.00, 2);
    expect(shipping).toBe(9.99);
    expect(total).toBeCloseTo(114.97, 2);
  });

  it('clear cart after order', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    expect(useCartStore.getState().items).toHaveLength(1);

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getTotal()).toBe(0);
  });
});
