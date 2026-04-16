'use client';

export default function AdminUsersPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex gap-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="flex-1 border-gray-300 rounded-lg shadow-sm font-sm"
                    />
                    <select className="border-gray-300 rounded-lg shadow-sm font-sm">
                        <option>All Roles</option>
                        <option>Buyer</option>
                        <option>Seller</option>
                        <option>Admin</option>
                    </select>
                </div>

                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                        UN
                                    </div>
                                    <span className="font-medium text-gray-900">User Name {i}</span>
                                </td>
                                <td className="p-4">user{i}@example.com</td>
                                <td className="p-4">
                                    {i === 1 ? (
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Admin</span>
                                    ) : i === 2 ? (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Seller</span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Buyer</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                                </td>
                                <td className="p-4">Jan {i}, 2025</td>
                                <td className="p-4 text-right">
                                    <button className="text-gray-500 hover:text-gray-700 font-medium">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
