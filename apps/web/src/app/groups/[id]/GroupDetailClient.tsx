'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { groupsApi } from '@/lib/api';
import {
    calculateSharePercentage,
    formatShare,
    getRemainingShares,
    getProductConfig
} from '@/lib/ShareCalculator';

// Explicit any to bypass complex type inference issues in this file
// eslint-disable-next-line
const safeGroup = (g: any) => g || {};

export default function GroupPurchaseDetailClient({ id: groupId }: { id: string }) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [hasJoined, setHasJoined] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const { data: group, isLoading } = useQuery({
        queryKey: ['group', groupId],
        queryFn: async () => {
            return await groupsApi.getGroup(groupId);
        },
    });

    // Check if user has joined
    useEffect(() => {
        const checkMembership = async () => {
            if (user && groupId) {
                const isMember = await groupsApi.isUserInGroup(groupId, user.id);
                setHasJoined(isMember);
            }
        };
        checkMembership();
    }, [user, groupId]);

    const handleJoinGroup = async () => {
        if (!user) {
            router.push('/login?redirect=/groups/' + groupId);
            return;
        }
        try {
            await groupsApi.joinGroup(groupId, user.id, quantity);
            setHasJoined(true);
        } catch (error) {
            console.error('Failed to join group:', error);
            alert('Failed to join group. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12 text-gray-500">Group not found</div>
                </div>
            </div>
        );
    }

    // Mock data for compatibility - ensuring we handle missing fields gracefully
    // In a real scenario, these would come from the API or be computed
    const g = group as any;
    const displayGroup: any = {
        ...g,
        currentPrice: g.priceTiers?.[0]?.pricePerUnit || 0,
        targetPrice: g.priceTiers?.[g.priceTiers.length - 1]?.pricePerUnit || 0,
        savings: (g.priceTiers?.[0]?.pricePerUnit || 0) - (g.priceTiers?.[g.priceTiers.length - 1]?.pricePerUnit || 0),
        timeLeft: Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) + ' days',
        // Fallback if no items defined in Description/Product
        items: [
            { name: 'Approx. Weight', quantity: 'Varies by share', price: 'Included' },
            { name: 'Quality', quantity: 'Premium Cuts', price: 'Standard' }
        ],
        features: [
            'Locally Sourced',
            'Vacuum Sealed',
            'Freezer Ready',
        ],
        producer: g.organizer?.firstName || 'Local Producer',
        participants: g.participantCount,
        targetParticipants: g.targetQuantity
    };

    const category = displayGroup.product?.category || 'BEEF';
    const config = getProductConfig(category);
    const progress = calculateSharePercentage(displayGroup.currentQuantity, displayGroup.targetQuantity);
    const remainingShares = Math.max(0, displayGroup.targetQuantity - displayGroup.currentQuantity);
    const estimatedTotal = (quantity * displayGroup.currentPrice).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        <li>
                            <Link href="/" className="hover:text-meat-600">
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link href="/groups" className="hover:text-meat-600">
                                Group Buys
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-gray-900 font-medium line-clamp-1">{displayGroup.title}</li>
                    </ol>
                </nav>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            {/* Product Image Banner */}
                            <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-6 group">
                                {displayGroup.product?.images && displayGroup.product.images.length > 0 ? (
                                    <Image
                                        src={displayGroup.product.images[0]}
                                        alt={displayGroup.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <Image
                                        src="/images/hero-1.png"
                                        alt={displayGroup.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-meat-700">
                                    {config.badgeLabel}
                                </div>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-3">
                                        Active {config.mode === 'bulk' ? 'Group Buy' : 'Share'}
                                    </span>
                                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                                        {displayGroup.title}
                                    </h1>
                                    <p className="text-lg text-gray-600">Raised by {displayGroup.producer}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">
                                        {displayGroup.participantCount} neighbors joined
                                    </span>
                                    <span className="font-semibold text-meat-600">
                                        {formatShare(displayGroup.currentQuantity, category)} Claimed
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-meat-500 to-meat-600 h-full rounded-full transition-all duration-500 relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-500 mt-1">
                                    {getRemainingShares(displayGroup.currentQuantity, displayGroup.targetQuantity, category)}
                                </div>
                            </div>

                            {/* Pricing Info */}
                            <div className="bg-meat-50 border border-meat-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Current Price</p>
                                        <p className="text-3xl font-bold text-gray-900">${displayGroup.currentPrice}</p>
                                        <p className="text-xs text-gray-500">per {formatShare(1, category)}</p>
                                    </div>
                                    <div className="h-12 w-px bg-meat-200 mx-4"></div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Target Price</p>
                                        <p className="text-3xl font-bold text-meat-600">${displayGroup.targetPrice}</p>
                                        <p className="text-xs text-gray-500">unlocks at full {config.productName.toLowerCase()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Time Left */}
                            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                                <svg className="w-5 h-5 text-meat-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="font-medium">
                                    {displayGroup.timeLeft} remaining until processing
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">About this {config.productName} Share</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">{displayGroup.description || displayGroup.product?.description}</p>

                            <h3 className="font-semibold text-gray-900 mb-3">Participation Features:</h3>
                            <div className="space-y-2 mb-6">
                                {displayGroup.features.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                            <h3 className="font-semibold text-gray-900 mb-4">
                                {config.mode === 'bulk' ? 'Select Quantity' : `Select Your ${config.productName} Share`}
                            </h3>

                            {/* Share Sector */}
                            {!hasJoined && (
                                <>
                                    {config.mode === 'fractional' ? (
                                        <div className="mb-6 space-y-2">
                                            {config.shareSizes.map((size) => (
                                                <button
                                                    key={size.units}
                                                    onClick={() => setQuantity(size.units)}
                                                    disabled={size.units > remainingShares}
                                                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${quantity === size.units
                                                        ? 'border-meat-600 bg-meat-50 ring-1 ring-meat-600'
                                                        : size.units > remainingShares
                                                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                                            : 'border-gray-200 hover:border-meat-300'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className={`font-semibold ${quantity === size.units ? 'text-meat-900' : 'text-gray-700'}`}>
                                                            {size.label}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {size.fraction}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Approx. {size.units * config.unitWeight} lbs
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                            <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-700 mb-2">
                                                {config.unitName}s to Reserve:
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                    className="w-10 h-10 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center font-bold"
                                                    disabled={quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    id="quantity-input"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        if (!isNaN(val) && val >= 1 && val <= remainingShares) {
                                                            setQuantity(val);
                                                        } else if (e.target.value === '') {
                                                            // keep old value or handle empty
                                                        }
                                                    }}
                                                    min="1"
                                                    max={remainingShares}
                                                    className="flex-grow text-center border border-gray-300 rounded-md py-2 text-lg font-semibold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(q => Math.min(remainingShares, q + 1))}
                                                    className="w-10 h-10 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center font-bold"
                                                    disabled={quantity >= remainingShares}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 text-center">
                                                Approx. {quantity * config.unitWeight} lbs
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Selected</span>
                                    <span className="font-medium">{formatShare(quantity, category)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Estimated Total</span>
                                    <span className="text-2xl font-bold text-meat-600">${estimatedTotal}</span>
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Does not include final shipping calculations.
                                </p>
                            </div>

                            {hasJoined ? (
                                <div className="space-y-3">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                        <svg
                                            className="w-8 h-8 text-green-600 mx-auto mb-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <p className="font-semibold text-green-900">Reserved!</p>
                                        <p className="text-sm text-green-700 mt-1">
                                            We'll notify you when the {config.productName.toLowerCase()} is fully reserved.
                                        </p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-center"
                                    >
                                        View My Orders
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handleJoinGroup}
                                    className="w-full bg-meat-600 text-white py-3 rounded-lg font-semibold hover:bg-meat-700 transition-colors mb-3 shadow-lg shadow-meat-600/20"
                                >
                                    Reserve Now
                                </button>
                            )}

                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold text-gray-900 mb-3 text-sm">{config.productName} Share Process</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 bg-meat-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                            <span className="text-meat-600 text-xs font-bold">1</span>
                                        </div>
                                        <p className="text-gray-600">Select quantity</p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 bg-meat-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                            <span className="text-meat-600 text-xs font-bold">2</span>
                                        </div>
                                        <p className="text-gray-600">Pay deposit to reserve</p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 bg-meat-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                            <span className="text-meat-600 text-xs font-bold">3</span>
                                        </div>
                                        <p className="text-gray-600">Farmer processes when full</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
