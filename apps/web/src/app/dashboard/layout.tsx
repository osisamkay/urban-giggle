import { DashboardSidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex">
            <div className="sticky top-[64px] h-[calc(100vh-64px)]">
                <DashboardSidebar />
            </div>
            <div className="flex-1 p-8">
                {children}
            </div>
        </div>
    );
}
