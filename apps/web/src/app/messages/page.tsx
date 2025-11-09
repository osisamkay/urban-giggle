'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Message {
  id: string;
  sender: {
    name: string;
    avatar?: string;
    role: string;
  };
  subject: string;
  preview: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    // TODO: Fetch messages from API
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleMarkAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
    // TODO: API call to mark as read
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      handleMarkAsRead(message.id);
    }
  };

  const handleDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
    // TODO: API call to delete message
  };

  const filteredMessages =
    filter === 'unread' ? messages.filter((msg) => !msg.isRead) : messages;

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'No unread messages'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Filter Tabs */}
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      filter === 'all'
                        ? 'text-meat-600 border-b-2 border-meat-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Messages
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      filter === 'unread'
                        ? 'text-meat-600 border-b-2 border-meat-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="overflow-y-auto max-h-[600px]">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-600">No messages</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-meat-50' : ''
                      } ${!message.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-meat-100 rounded-full flex items-center justify-center text-meat-600 font-semibold mr-3">
                            {message.sender.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-gray-900 truncate ${!message.isRead ? 'font-bold' : ''}`}>
                              {message.sender.name}
                            </p>
                            <p className="text-xs text-gray-600">{message.sender.role}</p>
                          </div>
                        </div>
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-meat-600 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm mb-1 truncate ${!message.isRead ? 'font-semibold' : 'text-gray-900'}`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{message.preview}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Message Header */}
                <div className="border-b p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-meat-100 rounded-full flex items-center justify-center text-meat-600 font-semibold mr-4">
                        {selectedMessage.sender.name[0]}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedMessage.sender.name}
                        </h2>
                        <p className="text-sm text-gray-600">{selectedMessage.sender.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedMessage.subject}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedMessage.timestamp.toLocaleString()}
                  </p>
                </div>

                {/* Message Body */}
                <div className="p-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.content}
                  </div>
                </div>

                {/* Reply Section */}
                <div className="border-t p-6 bg-gray-50">
                  <button className="px-6 py-3 bg-meat-600 text-white rounded-lg font-semibold hover:bg-meat-700 transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <svg
                  className="w-24 h-24 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-600">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
