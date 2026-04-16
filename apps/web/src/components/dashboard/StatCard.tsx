interface StatCardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
    trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            {trend}
                        </p>
                    )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-400" />
                </div>
            </div>
        </div>
    );
}
