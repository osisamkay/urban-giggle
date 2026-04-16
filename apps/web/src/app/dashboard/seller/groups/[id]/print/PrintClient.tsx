'use client';

import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@/lib/api/groups';
import { useEffect } from 'react';

export default function PrintClient({ id }: { id: string }) {
    const { data: group, isLoading } = useQuery({
        queryKey: ['group', id],
        queryFn: () => groupsApi.getGroup(id),
    });

    useEffect(() => {
        if (group) {
            // Allow time for images/layout to settle
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [group]);

    if (isLoading) return <div className="p-8">Loading Packing List...</div>;
    if (!group) return <div className="p-8">Group not found</div>;

    return (
        <div className="p-8 bg-white text-black min-h-screen print:p-0">
            <div className="flex justify-between items-start mb-8 border-b border-black pb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Packing List</h1>
                    <h2 className="text-xl text-gray-700">{group.title}</h2>
                    <p className="mt-2 text-sm text-gray-600">Product: {group.product?.title}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">ShareSteak</p>
                    <p>Fullfillment Date: {new Date().toLocaleDateString()}</p>
                    <p>Group Status: {group.status}</p>
                </div>
            </div>

            <div className="mb-8">
                <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <h3 className="font-bold mb-2">Organizer Details</h3>
                        <p>{group.organizer?.first_name} {group.organizer?.last_name}</p>
                        <p>Total Items: {group.current_quantity}</p>
                        <p>Total Participants: {group.participant_count}</p>
                    </div>
                </div>
            </div>

            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2 pr-4">#</th>
                        <th className="py-2 pr-4">Participant</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Unit</th>
                        <th className="py-2 pr-4 text-right">Quantity</th>
                        <th className="py-2 pl-4 text-center">Check</th>
                    </tr>
                </thead>
                <tbody>
                    {group.participants?.map((p: any, index: number) => (
                        <tr key={p.id} className="border-b border-gray-300">
                            <td className="py-3 pr-4">{index + 1}</td>
                            <td className="py-3 pr-4 font-medium">{p.user?.first_name} {p.user?.last_name}</td>
                            <td className="py-3 pr-4 text-gray-600">{p.user?.email || '-'}</td>
                            <td className="py-3 pr-4">{group.product?.unit}</td>
                            <td className="py-3 pr-4 text-right font-bold text-lg">{p.quantity}</td>
                            <td className="py-3 pl-4 text-center">
                                <div className="w-6 h-6 border-2 border-black inline-block rounded-sm"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-12 pt-8 border-t-2 border-black text-center text-sm text-gray-500">
                <p>Printed from ShareSteak Seller Dashboard</p>
            </div>
        </div>
    )
}
