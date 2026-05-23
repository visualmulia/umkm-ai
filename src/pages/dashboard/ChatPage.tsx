import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  MessageCircle,
  Search,
  Send,
  Bot,
  User,
  AlertCircle,
  CheckCheck,
} from 'lucide-react'

export default function ChatPage() {
  const { data: chats } = trpc.chat.list.useQuery();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');

  const { data: selectedChat } = trpc.chat.getById.useQuery(
    { id: selectedChatId! },
    { enabled: !!selectedChatId }
  );

  const utils = trpc.useUtils();
  const createMessage = trpc.message.create.useMutation({
    onSuccess: () => {
      utils.chat.getById.invalidate();
      setReplyText('');
    },
  });

  const filteredChats = chats?.filter((c) =>
    c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    c.customerPhone?.includes(search)
  );

  return (
    <div className="h-full flex">
      {/* Chat List */}
      <div className="w-80 border-r flex flex-col" style={{ backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <h1 className="text-lg font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Chat</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5c5c5c' }} />
            <input
              type="text"
              placeholder="Cari customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
              style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats?.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className="w-full text-left p-4 border-b flex items-start gap-3 transition-colors"
              style={{
                borderColor: 'rgba(0,0,0,0.04)',
                backgroundColor: selectedChatId === chat.id ? 'rgba(212,117,74,0.06)' : 'white',
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0" style={{ backgroundColor: '#d4754a' }}>
                {chat.customerName?.[0]?.toUpperCase() || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate" style={{ color: '#1a1a1a' }}>{chat.customerName}</p>
                  {chat.unreadCount > 0 && (
                    <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#d4754a' }}>
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: '#5c5c5c' }}>{chat.lastMessage || 'Belum ada pesan'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    chat.status === 'ai_handled' ? 'bg-green-100 text-green-700' :
                    chat.status === 'human_needed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {chat.status === 'ai_handled' ? 'AI' : chat.status === 'human_needed' ? 'Human' : 'Active'}
                  </span>
                </div>
              </div>
            </button>
          ))}
          {(!filteredChats || filteredChats.length === 0) && (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-2" style={{ color: '#d4a853' }} />
              <p className="text-sm" style={{ color: '#5c5c5c' }}>Belum ada chat</p>
              <p className="text-xs mt-1" style={{ color: '#5c5c5c' }}>Chat dari customer akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Detail */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#faf8f4' }}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.06)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ backgroundColor: '#d4754a' }}>
                {selectedChat.customerName?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{selectedChat.customerName}</p>
                <p className="text-xs" style={{ color: '#5c5c5c' }}>{selectedChat.customerPhone}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedChat.status === 'ai_handled' ? 'bg-green-100 text-green-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedChat.status === 'ai_handled' ? (
                    <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> AI Handle</span>
                  ) : (
                    <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Need Human</span>
                  )}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {[...(selectedChat.messages || [])].reverse().map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                    msg.sender === 'customer'
                      ? 'rounded-bl-none'
                      : 'rounded-br-none'
                  }`}
                    style={{
                      backgroundColor: msg.sender === 'customer' ? 'white' : '#d4754a',
                      color: msg.sender === 'customer' ? '#1a1a1a' : 'white',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {msg.sender === 'ai' && <Bot className="w-3 h-3 opacity-70" />}
                      {msg.sender === 'user' && <User className="w-3 h-3 opacity-70" />}
                      <span className="text-[10px] opacity-70">
                        {msg.sender === 'customer' ? selectedChat.customerName : msg.sender === 'ai' ? 'AI' : 'You'}
                      </span>
                      {msg.aiConfidence && Number(msg.aiConfidence) > 0 && (
                        <CheckCheck className="w-3 h-3 opacity-70" />
                      )}
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] opacity-50 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t" style={{ backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik balasan..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && replyText.trim()) {
                      createMessage.mutate({
                        chatId: selectedChat.id,
                        sender: 'user',
                        content: replyText.trim(),
                      });
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-full text-sm border focus:outline-none focus:ring-2"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                />
                <button
                  onClick={() => {
                    if (replyText.trim()) {
                      createMessage.mutate({
                        chatId: selectedChat.id,
                        sender: 'user',
                        content: replyText.trim(),
                      });
                    }
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: '#d4754a' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#d4a853', opacity: 0.4 }} />
              <p className="text-lg font-medium" style={{ color: '#1a1a1a' }}>Pilih chat untuk mulai</p>
              <p className="text-sm mt-1" style={{ color: '#5c5c5c' }}>Chat dari customer akan muncul di panel kiri</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
