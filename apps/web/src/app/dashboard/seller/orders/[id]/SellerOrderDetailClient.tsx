'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SellerOrderDetailClient({ id }: { id: string }) {
    const queryClient = useQueryClient();
    const [trackingNumber, setTrackingNumber] = useState('');

    const { data: order, isLoading } = useQuery({
        queryKey: ['seller-order', id],
        queryFn: () => ordersApi.getOrder(id),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: any) => ordersApi.updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-order', id] });
            alert('Order status updated successfully');
        },
        onError: (error) => {
            console.error(error);
            alert('Failed to update status');
        }
    });

    const updateTrackingMutation = useMutation({
        mutationFn: (tracking: string) => ordersApi.updateTracking(id, tracking),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-order', id] });
            alert('Tracking information updated');
            setTrackingNumber('');
        },
        onError: (error) => {
            console.error(error);
            alert('Failed to update tracking');
        }
    });

    if (isLoading) {
        return <div className="p-8 text-center">Loading order details...</div>;
    }

    if (!order) {
        return <div className="p-8 text-center">Order not found</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/dashboard/seller/orders" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Orders
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Order #{order.id.slice(0, 8)}</h1>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                        className="border-gray-300 rounded-lg shadow-sm focus:ring-meat-500 focus:border-meat-500"
                        disabled={updateStatusMutation.isPending}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.product?.images?.[0] && (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.product?.title}</h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">${item.price_at_purchase.toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">${(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Tracking */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Tracking Information</h2>
                        {order.tracking_number ? (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Current Tracking Number</p>
                                <p className="font-mono font-medium">{order.tracking_number}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">No tracking information added yet.</p>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter tracking number"
                                className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-meat-500 focus:border-meat-500"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                            <button
                                onClick={() => updateTrackingMutation.mutate(trackingNumber)}
                                disabled={!trackingNumber || updateTrackingMutation.isPending}
                                className="px-4 py-2 bg-meat-600 text-white rounded-lg hover:bg-meat-700 disabled:opacity-50"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Customer</h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium">
                                {order.buyer?.first_name?.[0]}{order.buyer?.last_name?.[0]}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{order.buyer?.first_name} {order.buyer?.last_name}</p>
                                <p className="text-sm text-gray-500">{order.buyer?.email}</p>
                            </div>
                        </div>

                        {order.shipping_address && (
                            <div className="border-t border-gray-100 pt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                                <address className="not-italic text-sm text-gray-600">
                                    <p>{order.shipping_address.street}</p>
                                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                                    <p>{order.shipping_address.country}</p>
                                </address>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
