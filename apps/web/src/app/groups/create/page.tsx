'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { groupsApi } from '@/lib/api';
import { SHARE_SIZES, getProductConfig, formatShare } from '@/lib/ShareCalculator';
import type { PriceTier } from '@sharesteak/types';

export default function CreateGroupPage() {
    const { user, isSeller, isLoading: authLoading } = useAuthStore();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('BEEF');

    // React Hook Form setup with basic validation
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            productId: '', // In real app, this would be a selector
            deadline: '',
            pricePerUnit: '',
            targetQuantity: '',
            category: 'BEEF'
        }
    });

    const category = watch('category');
    const config = getProductConfig(category);

    useEffect(() => {
        setSelectedCategory(category);
    }, [category]);

    // Authorization Check
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login?redirect=/groups/create');
            } else if (!isSeller()) {
                router.push('/'); // Redirect unauthorized users home
                // In a real app, maybe show a "Request Seller Access" page
            }
        }
    }, [user, isSeller, authLoading, router]);

    // eslint-disable-next-line
    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);

            // Mock Product Creation (since we don't have a product selector yet)
            // In a real scenario, the user would select an existing product or create one first.
            // We'll simulate creating a group with a "Virtual" product ID for now or require one.
            // For this demo, let's assume we pass a placeholder ID or the backend handles it.
            // ACTUALLY: The API requires a productId. 
            // Let's use a dummy ID or ask user to input content.

            // Simplified Price Tier creation based on linear price for now
            const price = parseFloat(data.pricePerUnit);
            const targetQty = parseInt(data.targetQuantity);

            const priceTiers: PriceTier[] = [
                {
                    minQuantity: 1,
                    pricePerUnit: price,
                    discountPercentage: 0
                },
                // Add a "Whole" tier discount example
                {
                    minQuantity: Math.floor(targetQty / 2),
                    pricePerUnit: price * 0.95, // 5% discount for bulk
                    discountPercentage: 5
                },
                {
                    minQuantity: targetQty,
                    pricePerUnit: price * 0.9, // 10% discount for whole
                    discountPercentage: 10
                }
            ];

            const groupData = {
                product_id: 'placeholder-product-id', // Needs valid UUID or handle in backend
                organizer_id: user.id,
                title: data.title,
                description: data.description,
                price_tiers: priceTiers,
                minimum_quantity: 1,
                target_quantity: targetQty,
                deadline: new Date(data.deadline).toISOString(),
            };

            await groupsApi.createGroup(groupData);

            router.push('/groups');
        } catch (error) {
            console.error('Failed to create group:', error);
            alert('Failed to create group. Please check your inputs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || !user || !isSeller()) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-8 border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-gray-900">Create New Group Buy</h1>
                        <p className="text-gray-600 mt-1">Start a community purchase for your produce.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                            <select
                                {...register('category')}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-meat-500 focus:border-meat-500"
                            >
                                <option value="BEEF">Beef / Bison</option>
                                <option value="PORK">Pork</option>
                                <option value="LAMB">Lamb / Goat</option>
                                <option value="CHICKEN">Chicken (Bulk)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Configures share sizing: {config.productName} ({config.unitWeight} lbs/{config.unitName.toLowerCase()})
                            </p>
                        </div>

                        {/* Basic Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    {...register('title', { required: true })}
                                    placeholder={`e.g. Grass-Fed ${config.productName} Share`}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-meat-500 focus:border-meat-500"
                                />
                                {errors.title && <span className="text-red-500 text-xs">Title is required</span>}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    {...register('description', { required: true })}
                                    rows={4}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-meat-500 focus:border-meat-500"
                                    placeholder="Describe the quality, cuts, and sourcing details..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Quantity ({config.unitName}s)</label>
                                <input
                                    type="number"
                                    {...register('targetQuantity', { required: true, min: 1 })}
                                    defaultValue={config.totalUnits || 100}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-meat-500 focus:border-meat-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    100% Goal = {watch('targetQuantity') || 0} {config.unitName}s
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price per {config.unitName}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('pricePerUnit', { required: true })}
                                        className="pl-7 w-full border-gray-300 rounded-lg shadow-sm focus:ring-meat-500 focus:border-meat-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                <input
                                    type="date"
                                    {...register('deadline', { required: true })}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-meat-500 focus:border-meat-500"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-meat-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-meat-700 transition shadow-lg shadow-meat-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    'Launch Group Buy'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
