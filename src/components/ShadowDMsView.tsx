import React, { useState, useEffect } from 'react';
import { Conversation, DirectMessage, EphemeralDuration } from '../types';
import { CountdownChip } from './CountdownChip';
import { Send, Eye, ShieldAlert, Clock, Mic, MicOff, Play, Pause, Flame, UserCheck, MessageSquare } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  conversations: Conversation[];
  currentUserId: string;
  currentUserHandle: string;
  onSendMessage: (conversationId: string, message: Omit<DirectMessage, 'id' | 'createdAt'>) => void;
  onOpenSnapGate: (message: DirectMessage) => void;
}

const LIFESPANS: { id: EphemeralDuration; label: string; ms: number }[] = [
  { id: 'snap', label: 'Snap (1-view)', ms: 60000 },
  { id: '1h', label: '1 Hour', ms: 3600000 },
  { id: '24h', label: '24 Hours', ms: 86400000 },
  { id: '1w', label: '1 Week', ms: 86400000 * 7 },
];

export const ShadowDMsView: React.FC<Props> = ({
  conversations,
  currentUserId,
  currentUserHandle,
  onSendMessage,
  onOpenSnapGate,
}) => {
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [destructionType, setDestructionType] = useState<EphemeralDuration>('24h');
  const [isTypingSimulated, setIsTypingSimulated] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Voice note recording simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    playHapticSound('send');

    const lifespanObj = LIFESPANS.find((l) => l.id === destructionType) || LIFESPANS[2];
    const isSnap = destructionType === 'snap';

    onSendMessage(activeConvId, {
      senderId: currentUserId,
      senderHandle: currentUserHandle,
      content: inputText.trim(),
      isSnap,
      isViewed: !isSnap,
      destructionType,
      expiresAt: new Date(Date.now() + lifespanObj.ms).toISOString(),
    });

    setInputText('');

    // Trigger simulated peer response after 2.5s for authentic interactivity
    setTimeout(() => {
      setIsTypingSimulated(true);
      setTimeout(() => {
        setIsTypingSimulated(false);
        playHapticSound('pop');
        onSendMessage(activeConvId, {
          senderId: 'usr_peer_sim',
          senderHandle: activeConversation.participantHandle,
          content: 'Got your message! Everything self-destructs per the set TTL protocol.',
          isSnap: false,
          isViewed: true,
          destructionType: '24h',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        });
      }, 2000);
    }, 1500);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    playHapticSound('send');

    onSendMessage(activeConvId, {
      senderId: currentUserId,
      senderHandle: currentUserHandle,
      content: `[Voice Note: ${recordingSeconds}s encrypted audio clip]`,
      mediaType: 'voice',
      audioDurationSec: recordingSeconds || 4,
      isSnap: destructionType === 'snap',
      isViewed: false,
      destructionType,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
  };

  return (
    <div className="rounded-2xl bg-[#121020]/90 border border-[rgba(255,255,255,0.1)] overflow-hidden flex flex-col md:flex-row h-[650px] shadow-xl">
      {/* Sidebar: Conversation List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.08)] bg-[#0E0C1C] flex flex-col">
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#6FFFE0]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SHADOW DMS</span>
            </div>
            <div className="text-[11px] text-[#F0EEFF]/50 font-mono">Disappearing P2P Threads</div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
            {conversations.length} Active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  playHapticSound('click');
                  setActiveConvId(conv.id);
                }}
                className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                  isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#18152E] border border-[#6FFFE0]/40 flex items-center justify-center text-xs font-mono text-[#6FFFE0] shrink-0 mt-0.5">
                  DM
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#F0EEFF] truncate">
                      @{conv.participantHandle}
                    </span>
                    <span className="text-[10px] font-mono text-[#F0EEFF]/40">
                      {conv.lastMessageTime}
                    </span>
                  </div>

                  <p className="text-xs text-[#F0EEFF]/60 truncate font-mono mt-0.5">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-mono text-[#5EEAD4] bg-[#5EEAD4]/10 px-1.5 py-0.2 rounded">
                      [{conv.destructionType}]
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="text-[10px] font-mono font-bold text-[#0A0912] bg-[#FF6FD8] px-1.5 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-[#0B0A16]">
          {/* Chat Header */}
          <div className="px-6 py-3.5 border-b border-[rgba(255,255,255,0.08)] bg-[#121020] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#18152E] border border-[#FF6FD8] flex items-center justify-center text-xs font-mono text-[#FF6FD8]">
                Anon
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#F0EEFF]">
                    @{activeConversation.participantHandle}
                  </span>
                  <span className="text-[10px] font-mono text-[#6FFFE0] bg-[#6FFFE0]/10 px-2 py-0.5 rounded">
                    ENCRYPTED
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#F0EEFF]/50">
                  {activeConversation.universityName}
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#F0EEFF]/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#5EEAD4]" />
              <span>TTL: {activeConversation.destructionType} auto-purge</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConversation.messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-[#F0EEFF]/40">
                    <span>@{msg.senderHandle}</span>
                    <span>·</span>
                    <span>{msg.createdAt}</span>
                    {msg.isSnap && (
                      <span className="text-[#6FFFE0] bg-[#6FFFE0]/15 px-1 rounded">SNAP</span>
                    )}
                  </div>

                  {msg.isSnap ? (
                    // Snap Message One-Tap Gate
                    <div className="max-w-[85%] sm:max-w-md p-3.5 rounded-2xl bg-[#141224] border border-[#6FFFE0]/40 shadow-sm space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-[#6FFFE0]">
                        <Eye className="w-4 h-4" />
                        <span>CONFIDENTIAL SNAP (VIEW ONCE)</span>
                      </div>
                      <p className="text-xs text-[#F0EEFF]/70 font-mono">
                        This whisper self-destructs forever after being viewed.
                      </p>
                      <button
                        onClick={() => {
                          playHapticSound('snap');
                          onOpenSnapGate(msg);
                        }}
                        className="w-full py-2 rounded-xl bg-[#6FFFE0] text-[#0A0912] font-semibold text-xs font-mono transition-transform active:scale-95"
                      >
                        Tap to Decrypt & View
                      </button>
                    </div>
                  ) : msg.mediaType === 'voice' ? (
                    // Voice Note Bubble
                    <div
                      className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl border text-xs font-mono flex items-center gap-3 ${
                        isMine
                          ? 'bg-[#FF6FD8]/15 border-[#FF6FD8] text-[#F0EEFF]'
                          : 'bg-[#16142A] border-white/10 text-[#F0EEFF]'
                      }`}
                    >
                      <button
                        onClick={() => playHapticSound('pop')}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 text-[#6FFFE0]" />
                      </button>
                      <div className="flex-1">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-[#6FFFE0] rounded-full" />
                        </div>
                        <div className="text-[10px] text-[#F0EEFF]/50 mt-1 flex justify-between">
                          <span>Voice Whisper</span>
                          <span>{msg.audioDurationSec || 4}s</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Standard Direct Message Bubble
                    <div
                      className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-[#FF6FD8] text-[#0A0912] font-medium rounded-br-none shadow-sm'
                          : 'bg-[#16142A] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] rounded-bl-none font-sans'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Simulated Typing Indicator */}
            {isTypingSimulated && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#6FFFE0] bg-[#141224] p-2 rounded-xl w-fit border border-white/5 animate-pulse">
                <span>@{activeConversation.participantHandle} is typing...</span>
              </div>
            )}
          </div>

          {/* Destruction Type Selector & Chat Input Bar */}
          <div className="p-3 bg-[#121020] border-t border-[rgba(255,255,255,0.08)] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[11px] text-[#F0EEFF]/60">
                <span>Self-Destruct TTL:</span>
                {LIFESPANS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      playHapticSound('click');
                      setDestructionType(l.id);
                    }}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      destructionType === l.id
                        ? 'bg-[#FF6FD8] text-[#0A0912] font-bold'
                        : 'text-[#F0EEFF]/50 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {isRecordingVoice && (
                <div className="text-[#FF5C7A] flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#FF5C7A]" />
                  <span>Recording {recordingSeconds}s...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  destructionType === 'snap'
                    ? 'Type a self-destructing Snap message (view once)...'
                    : 'Encrypted message into the void...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#090814] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-xs font-mono placeholder-[#F0EEFF]/40 focus:border-[#FF6FD8] outline-none"
              />

              {/* Voice Note Record Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  if (isRecordingVoice) {
                    handleSendVoiceNote();
                  } else {
                    playHapticSound('click');
                    setIsRecordingVoice(true);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isRecordingVoice
                    ? 'bg-[#FF5C7A] text-white border-[#FF5C7A]'
                    : 'bg-[#16142A] text-[#F0EEFF]/70 border-white/10 hover:text-white'
                }`}
                title={isRecordingVoice ? 'Finish & Send Voice Note' : 'Record Voice Note'}
              >
                {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-[#FF6FD8] text-[#0A0912] font-semibold transition-transform active:scale-95 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-xs font-mono text-[#F0EEFF]/40">
          Select or start a conversation to initiate disappearing Shadow DMs.
        </div>
      )}
    </div>
  );
};
