'use client';
import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function NotificationsDropdown() {
    const user = useAuthStore(s => s.user);
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => notificationsApi.getUserNotifications(user!.id),
        enabled: !!user,
        refetchInterval: 30000,
    });

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications-unread', user?.id],
        queryFn: () => notificationsApi.getUnreadCount(user!.id),
        enabled: !!user,
        refetchInterval: 30000
    });

    const markReadMutation = useMutation({
        mutationFn: notificationsApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(user!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id] });
        }
    });

    if (!user) return null;

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className={`group inline-flex items-center p-2 text-gray-700 hover:text-meat-600 focus:outline-none transition-colors rounded-full hover:bg-gray-100 ${open ? 'text-meat-600 bg-gray-100' : ''}`}>
                        <div className="relative">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute right-0 z-50 mt-2 w-80 lg:w-96 transform px-0 origin-top-right">
                            <div className="overflow-hidden rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 bg-white border border-gray-100 m-2 sm:m-0">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllReadMutation.mutate()}
                                            className="text-xs font-medium text-meat-600 hover:text-meat-700 hover:underline"
                                            disabled={markAllReadMutation.isPending}
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[24rem] overflow-y-auto overscroll-contain">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                                            <div className="rounded-full bg-gray-100 p-3 mb-3">
                                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">No notifications</p>
                                            <p className="text-xs text-gray-500 mt-1">We'll let you know when updates arrive.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {notifications.map((n: any) => (
                                                <div
                                                    key={n.id}
                                                    className={`relative p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}
                                                    onClick={() => !n.read && markReadMutation.mutate(n.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? 'bg-meat-500' : 'bg-transparent'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    {n.link && (
                                                        <Link href={n.link} className="absolute inset-0 z-10 focus:outline-none">
                                                            <span className="sr-only">View</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}
