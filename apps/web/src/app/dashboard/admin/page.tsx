'use client';

import { StatCard } from '@/components/dashboard/StatCard';

// Mock Icons
function UsersIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function CashIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function BadgeCheckIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ExclamationIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}

export default function AdminDashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Platform Administration</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value="1,234"
                    icon={UsersIcon}
                    trend="+54 this week"
                    trendUp={true}
                />
                <StatCard
                    title="Platform Revenue"
                    value="$45,200"
                    icon={CashIcon}
                    trend="+8% growth"
                    trendUp={true}
                />
                <StatCard
                    title="Active Groups"
                    value="42"
                    icon={BadgeCheckIcon}
                />
                <StatCard
                    title="Seller Requests"
                    value="5"
                    icon={ExclamationIcon}
                    trend="Needs review"
                    trendUp={false}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="font-semibold text-gray-900 mb-4">Pending Seller Approvals</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                            <tr>
                                <th className="p-3">User</th>
                                <th className="p-3">Business Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Date Applied</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1, 2].map(i => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-900">Jane Smith</td>
                                    <td className="p-3">Smith Family Farms</td>
                                    <td className="p-3">jane@example.com</td>
                                    <td className="p-3">Oct 23, 2024</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button className="text-green-600 hover:text-green-800 font-medium">Approve</button>
                                        <button className="text-red-600 hover:text-red-800 font-medium">Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
