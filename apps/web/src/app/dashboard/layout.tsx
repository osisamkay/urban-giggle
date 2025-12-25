import { DashboardSidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <DashboardSidebar />
            <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-64px)]">
                {children}
            </div>
        </div>
    );
}
