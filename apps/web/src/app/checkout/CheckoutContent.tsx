'use client';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AddressSelection } from '@/components/AddressSelection';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CheckoutContent() {
    const stripe = useStripe();
    const elements = useElements();

    const user = useAuthStore((state) => state.user);
    const { items, getTotal, clearCart } = useCartStore();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [shippingAddressId, setShippingAddressId] = useState<string | null>(null);

    const subtotal = getTotal();
    const tax = subtotal * 0.08;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    const handlePlaceOrder = async () => {
        if (!user || !stripe || !elements || !shippingAddressId) return;

        setIsPlacingOrder(true);
        try {
            // 0. Validate Stock
            const validationRes = await fetch('/api/validate-cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.product!.id,
                        quantity: item.quantity
                    }))
                })
            });

            const validationData = await validationRes.json();

            if (!validationData.valid) {
                const errorMsg = validationData.errors
                    ? validationData.errors.map((e: any) => e.message).join('\n')
                    : validationData.message || 'Stock validation failed';

                toast.error(`Cannot proceed with checkout: ${errorMsg}`);
                setIsPlacingOrder(false);
                return;
            }

            // 1. Confirm Payment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            name: `${user.firstName} ${user.lastName}`,
                            // address: ... (could lookup address by id but skipping for now)
                        }
                    }
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error('Payment failed:', error);
                toast.error(`Payment failed: ${error.message}`);
                setIsPlacingOrder(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                // 2. Create Order
                // Get seller_id from the first item's product
                // TODO: For multi-seller carts, create separate orders per seller
                const sellerId = items[0]?.product?.sellerId;

                if (!sellerId) {
                    toast.error('Unable to determine seller. Please try again.');
                    setIsPlacingOrder(false);
                    return;
                }

                await ordersApi.createOrder({
                    buyer_id: user.id,
                    seller_id: sellerId,
                    items: items.map(item => ({
                        product_id: item.product!.id,
                        quantity: item.quantity,
                        price_at_purchase: item.product!.price,
                    })),
                    shipping_address_id: shippingAddressId,
                    subtotal,
                    tax,
                    shipping,
                    total,
                    // payment_intent_id: paymentIntent.id // Add this to order if schema supports it
                });

                clearCart();
                router.push('/order-confirmation');
            }
        } catch (error) {
            console.error('Order creation failed:', error);
            toast.error('Payment succeeded but order creation failed. Please contact support.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (!user || items.length === 0) {
        // Should handle redirect in parent or here
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
                    Checkout
                </h1>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center">
                            <div className={`flex items-center ${step >= 1 ? 'text-meat-600' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-meat-600 text-white' : 'bg-gray-200'}`}>
                                    1
                                </div>
                                <span className="ml-2 font-medium hidden sm:inline">Shipping</span>
                            </div>
                            <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-meat-600' : 'bg-gray-300'}`} />
                            <div className={`flex items-center ${step >= 2 ? 'text-meat-600' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-meat-600 text-white' : 'bg-gray-200'}`}>
                                    2
                                </div>
                                <span className="ml-2 font-medium hidden sm:inline">Payment</span>
                            </div>
                            <div className={`w-16 h-0.5 mx-4 ${step >= 3 ? 'bg-meat-600' : 'bg-gray-300'}`} />
                            <div className={`flex items-center ${step >= 3 ? 'text-meat-600' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-meat-600 text-white' : 'bg-gray-200'}`}>
                                    3
                                </div>
                                <span className="ml-2 font-medium hidden sm:inline">Review</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <div style={{ display: step === 1 ? 'block' : 'none' }}>
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Shipping Address
                                </h2>
                                <div className="mb-6">
                                    <AddressSelection
                                        userId={user.id}
                                        selectedAddressId={shippingAddressId}
                                        onSelectAddress={setShippingAddressId}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (shippingAddressId) {
                                            setStep(2);
                                        } else {
                                            toast.error('Please select a shipping address');
                                        }
                                    }}
                                    disabled={!shippingAddressId}
                                    className="w-full bg-meat-600 text-white py-3 rounded-lg font-semibold hover:bg-meat-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div style={{ display: step === 2 ? 'block' : 'none' }}>
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Payment Information
                                </h2>
                                <div className="py-4">
                                    <PaymentElement />
                                </div>
                                <div className="flex gap-3 justify-center mt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="px-6 py-3 bg-meat-600 text-white rounded-lg font-semibold hover:bg-meat-700"
                                    >
                                        Continue to Review
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order Review */}
                        {step === 3 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Review Order
                                </h2>
                                <div className="space-y-4 mb-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                                            <div className="w-16 h-16 bg-gray-200 rounded" />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{item.product?.title}</h4>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">
                                                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isPlacingOrder || !stripe || !elements}
                                        className="flex-1 px-6 py-3 bg-meat-600 text-white rounded-lg font-semibold hover:bg-meat-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPlacingOrder ? 'Processing...' : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-meat-600">${total.toFixed(2)}</span>
                                </div>
                            </div>
                            {shipping > 0 && (
                                <p className="text-sm text-gray-600 text-center">
                                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
