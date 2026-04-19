'use client';

import { useState, useEffect } from 'react';
import { addressesApi, Address, AddressInsert } from '@/lib/api/addresses';

interface AddressSelectionProps {
    userId: string;
    selectedAddressId: string | null;
    onSelectAddress: (addressId: string) => void;
}

export function AddressSelection({ userId, selectedAddressId, onSelectAddress }: AddressSelectionProps) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newAddress, setNewAddress] = useState<Partial<AddressInsert>>({
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA', // Default
        is_default: false,
    });

    const loadAddresses = async () => {
        setIsLoading(true);
        try {
            const data = await addressesApi.getUserAddresses(userId);
            setAddresses(data || []);
            // Auto-select default address if none selected
            if (!selectedAddressId && data && data.length > 0) {
                const defaultAddr = data.find(a => a.is_default);
                if (defaultAddr) {
                    onSelectAddress(defaultAddr.id);
                } else {
                    onSelectAddress(data[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to load addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAddresses();
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCreateAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addressesApi.createAddress({
                ...newAddress,
                user_id: userId,
            } as AddressInsert);
            setShowForm(false);
            setNewAddress({
                street: '',
                city: '',
                state: '',
                zip_code: '',
                country: 'USA',
                is_default: false,
            });
            loadAddresses();
        } catch (error) {
            console.error('Failed to create address:', error);
            alert('Failed to create address.');
        }
    };

    if (isLoading) {
        return <div className="text-gray-500 text-center py-4">Loading addresses...</div>;
    }

    return (
        <div className="space-y-6">
            {!showForm ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                onClick={() => onSelectAddress(address.id)}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAddressId === address.id
                                    ? 'border-meat-600 ring-1 ring-meat-600 bg-meat-50'
                                    : 'border-gray-200 hover:border-meat-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-gray-900">
                                        {address.street}
                                    </span>
                                    {address.is_default && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Default</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {address.city}, {address.state} {address.zip_code}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">{address.country}</div>
                            </div>
                        ))}

                        <button
                            onClick={() => setShowForm(true)}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:border-meat-400 hover:text-meat-600 transition-colors min-h-[120px]"
                        >
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add New Address</span>
                        </button>
                    </div>
                </>
            ) : (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Add New Address</h3>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleCreateAddress} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-meat-500"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-meat-500"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-meat-500"
                                    value={newAddress.state}
                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-meat-500"
                                    value={newAddress.zip_code}
                                    onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-meat-500"
                                    value={newAddress.country ?? ''}
                                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                >
                                    <option value="USA">United States</option>
                                    <option value="CAN">Canada</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is-default"
                                type="checkbox"
                                className="h-4 w-4 text-meat-600 focus:ring-meat-500 border-gray-300 rounded"
                                checked={newAddress.is_default ?? false}
                                onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            />
                            <label htmlFor="is-default" className="ml-2 block text-sm text-gray-900">
                                Set as default address
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-meat-600 text-white py-2 px-4 rounded-md hover:bg-meat-700 transition font-medium"
                            >
                                Save Address
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
