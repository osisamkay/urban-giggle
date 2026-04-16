'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function OrderDetailClient({ id }: { id: string }) {
    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => ordersApi.getOrder(id),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                <Link href="/orders" className="text-meat-600 hover:text-meat-700 font-semibold">
                    Return to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900">
                            Order Details
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Order #{order.id}
                        </p>
                    </div>
                    <Link
                        href="/orders"
                        className="text-meat-600 hover:text-meat-700 font-semibold flex items-center gap-2"
                    >
                        ← Back to Orders
                    </Link>
                </div>

                <div className="grid gap-8">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex flex-wrap gap-6 justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                            {order.tracking_number && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                                    <p className="font-mono font-medium text-gray-900">
                                        {order.tracking_number}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Items</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-6 flex gap-6">
                                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.product?.images?.[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {item.product?.title || 'Unknown Product'}
                                        </h3>
                                        <p className="text-gray-600 mb-2">
                                            Qty: {item.quantity}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            ${item.price_at_purchase.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">
                                            ${(item.price_at_purchase * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping & Payment Summary */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Shipping Address
                            </h2>
                            {order.shipping_address ? (
                                <address className="not-italic text-gray-600">
                                    <p>{order.shipping_address.street}</p>
                                    <p>
                                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                                    </p>
                                    <p>{order.shipping_address.country}</p>
                                </address>
                            ) : (
                                <p className="text-gray-500">No shipping address provided</p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>${order.shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>${order.tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                                    <span>Total</span>
                                    <span className="text-meat-600">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
