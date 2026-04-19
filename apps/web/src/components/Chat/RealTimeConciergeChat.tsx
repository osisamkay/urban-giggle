import React, { useState, useEffect } from 'react';
import { Send, Smile, Paperclip, User, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function RealTimeConciergeChat({ chatId, currentUserId }: { chatId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mocking WebSocket behavior for the UI logic
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate a seller "typing" occasionally
      if (Math.random() > 0.8) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      content: input,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Simulate a "Read" receipt after 2 seconds
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, is_read: true } : m));
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[600px] bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">S</div>
          <div>
            <h3 className="font-bold text-sm">Premium Seller Concierge</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-zinc-500 uppercase font-medium">Online Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
              <Smile size={32} />
            </div>
            <p className="text-sm">Start a conversation with your seller about your order.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.sender_id === currentUserId 
                ? 'bg-red-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700'
            }`}>
              {msg.content}
              {msg.sender_id === currentUserId && (
                <div className="flex justify-end mt-1">
                  {msg.is_read ? <CheckCheck size={14} className="text-red-200" /> : <CheckCheck size={14} className="text-red-400 opacity-50" />}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
        <button type="button" className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
          <Paperclip size={20} />
        </button>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 ring-red-600 outline-none"
        />
        <button 
          type="submit" 
          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
