import React, { useState } from 'react';
import { Conversation, DirectMessage } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { Modal } from '../../components/Modal';
import { formatRelativeTime, generateId } from '../../lib/utils';
import { playHapticSound } from '../../utils/sound';
import { Send, Plus, Clock, ArrowLeft, MessageSquare } from 'lucide-react';

export const ShadowDMsPage: React.FC = () => {
  const { profile, campus } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [targetHandle, setTargetHandle] = useState('');
  const [selectedTTL, setSelectedTTL] = useState<'snap' | '1h' | '24h' | '1w'>('24h');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Record<string, DirectMessage[]>>({});

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  const handleStartConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHandle.trim()) return;

    playHapticSound('click');
    const newConv: Conversation = {
      id: generateId(),
      universityId: campus.id,
      participantId: generateId(),
      participantHandle: targetHandle.trim().replace(/^@/, ''),
      participantAvatar: 'cyber_neko',
      unreadCount: 0,
      ttlDuration: selectedTTL,
      createdAt: new Date().toISOString(),
    };

    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
    setIsNewChatOpen(false);
    setTargetHandle('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversationId) return;

    playHapticSound('whisper');

    const durationMs = {
      snap: 60 * 1000,
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
    }[activeConversation?.ttlDuration || '24h'];

    const newMsg: DirectMessage = {
      id: generateId(),
      conversationId: activeConversationId,
      senderId: profile?.id || 'anon',
      senderHandle: profile?.handle || 'CampusStudent',
      content: messageText.trim(),
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
      viewOnce: activeConversation?.ttlDuration === 'snap',
      viewedAt: null,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessage: newMsg.viewOnce ? '[View-once snap]' : newMsg.content,
              lastMessageTime: 'just now',
            }
          : c
      )
    );

    setMessageText('');
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl water-glass-card border border-border-glass overflow-hidden shadow-xl h-[calc(100vh-7rem)] min-h-[520px] flex flex-col">
      {/* Container with responsive list-to-chat layout for mobile */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Side: Conversation List (hidden on mobile if activeConversationId is selected) */}
        <aside
          aria-label="Direct message conversations"
          className={`w-full md:w-80 border-r border-border-glass flex flex-col ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header */}
          <div className="p-4 border-b border-border-glass bg-surface flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold font-mono text-text-primary">Shadow DMs</h1>
              <p className="text-[11px] font-mono text-text-secondary">
                Messages delete after timer
              </p>
            </div>
            <button
              onClick={() => setIsNewChatOpen(true)}
              className="p-2 rounded-xl bg-lavender/20 text-lavender hover:bg-lavender/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Start new shadow direct message"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Send className="w-6 h-6 text-text-muted mx-auto" aria-hidden="true" />
                <p className="text-xs font-mono text-text-secondary">No open Shadow DMs.</p>
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-lavender text-neutral-900 font-mono text-[11px] font-bold min-h-[44px]"
                >
                  Start Conversation
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                    }}
                    className={`w-full p-3 rounded-2xl text-left transition-all min-h-[44px] flex items-center gap-3 ${
                      isSelected
                        ? 'bg-surface-elevated border border-border-glass font-bold'
                        : 'hover:bg-surface'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-lavender/15 text-lavender flex items-center justify-center font-mono text-xs shrink-0">
                      @{conv.participantHandle.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="truncate text-text-primary">
                          @{conv.participantHandle}
                        </span>
                        <span className="text-[10px] text-text-muted">TTL: {conv.ttlDuration}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary truncate font-mono mt-0.5">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: Active Chat View (hidden on mobile if no conversation selected) */}
        <section
          aria-label="Active conversation"
          className={`flex-1 flex flex-col bg-canvas/50 ${
            !activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border-glass bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveConversationId(null)}
                    aria-label="Back to conversations"
                    className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <div>
                    <h2 className="text-xs font-bold font-mono text-text-primary">
                      @{activeConversation.participantHandle}
                    </h2>
                    <p className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3 text-peach" aria-hidden="true" />
                      <span>Delete timer: {activeConversation.ttlDuration}</span>
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-text-secondary bg-surface px-2.5 py-1 rounded-full border border-border-glass">
                  Pseudonymous 1-on-1
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs font-mono text-text-secondary space-y-1">
                    <Clock className="w-5 h-5 text-peach" aria-hidden="true" />
                    <p>No messages yet.</p>
                    <p className="text-text-muted text-[11px]">
                      Demo messages are held in memory for this session only.
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMine = msg.senderId === profile?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted mb-0.5">
                          <span>@{msg.senderHandle}</span>
                          <span>·</span>
                          <span>{formatRelativeTime(msg.createdAt)}</span>
                        </div>
                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-mono shadow-sm water-glass-card border border-border-glass ${
                            isMine
                              ? 'bg-lavender text-neutral-900 font-medium'
                              : 'text-text-primary'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-border-glass bg-surface flex items-center gap-2"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a disappearing whisper message..."
                  className="flex-1 p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-lavender min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-lavender text-neutral-900 font-mono font-bold text-xs disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-1.5"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-text-muted" aria-hidden="true" />
              <h2 className="text-sm font-bold font-mono text-text-primary">
                Select a Shadow Conversation
              </h2>
              <p className="text-xs text-text-secondary max-w-xs">
                Pick a peer from the list or start a new disappearing message exchange.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        title="Start Shadow DM"
        description="Start a pseudonymous chat using a handle."
      >
        <form onSubmit={handleStartConversation} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Recipient Handle
            </label>
            <input
              type="text"
              value={targetHandle}
              onChange={(e) => setTargetHandle(e.target.value)}
              placeholder="e.g. CyberNeko"
              className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-lavender"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Conversation Disappearance Lifespan
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'snap', label: 'View Once' },
                { id: '1h', label: '1 Hour' },
                { id: '24h', label: '24 Hours' },
                { id: '1w', label: '1 Week' },
              ].map((ttl) => (
                <button
                  key={ttl.id}
                  type="button"
                  onClick={() => setSelectedTTL(ttl.id as 'snap' | '1h' | '24h' | '1w')}
                  className={`p-2 rounded-xl text-xs font-mono border min-h-[44px] transition-all ${
                    selectedTTL === ttl.id
                      ? 'bg-lavender text-neutral-900 border-lavender font-bold'
                      : 'bg-canvas border-border-glass text-text-secondary'
                  }`}
                >
                  {ttl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewChatOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-text-secondary min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-lavender text-neutral-900 font-mono text-xs font-bold min-h-[44px]"
            >
              Open Shadow Chat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
