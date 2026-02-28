"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export interface Message {
  id: string;
  role: string;
  content: string;
}

interface IdeationChatProps {
  seriesId: string;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  onSnapshotUpdate: (snapshot: unknown) => void;
}

const NEAR_BOTTOM_THRESHOLD = 80;

function getInitials(role: string): string {
  if (role === "user") return "U";
  if (role === "assistant") return "A";
  return "?";
}

function getAvatarBg(role: string): string {
  if (role === "user") return "bg-indigo-500";
  if (role === "assistant") return "bg-slate-600";
  return "bg-slate-400";
}

export function IdeationChat({
  seriesId,
  messages,
  onMessagesChange,
  onSnapshotUpdate,
}: IdeationChatProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    setShowNewMessages(false);
    setIsNearBottom(true);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const near = scrollHeight - scrollTop - clientHeight <= NEAR_BOTTOM_THRESHOLD;
    setIsNearBottom(near);
    if (near) {
      setShowNewMessages(false);
    } else if (prevMessageCountRef.current < messages.length) {
      setShowNewMessages(true);
    }
  }, [messages.length]);

  useEffect(() => {
    const count = messages.length;
    if (count > prevMessageCountRef.current) {
      if (isNearBottom) {
        scrollToBottom();
      } else {
        setShowNewMessages(true);
      }
      prevMessageCountRef.current = count;
    }
  }, [messages.length, isNearBottom, scrollToBottom]);

  const hasInitialScroll = useRef(false);
  useEffect(() => {
    if (messages.length > 0 && !hasInitialScroll.current) {
      hasInitialScroll.current = true;
      prevMessageCountRef.current = messages.length;
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");
    prevMessageCountRef.current = messages.length;

    try {
      const res = await fetch(`/api/series/${seriesId}/ideation/send-json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInput(content);
        return;
      }
      onMessagesChange(data.messages || []);
      if (data.snapshot !== undefined) {
        onSnapshotUpdate(data.snapshot);
      }
      prevMessageCountRef.current = (data.messages || []).length;
      scrollToBottom();
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Message list - scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4"
      >
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-slate-500 text-sm py-4">
              Start the conversation. Your ideas will be extracted into structured memory.
            </p>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex gap-3 justify-end">
                <div className="min-w-0 max-w-[75%]">
                  <p className="text-xs text-slate-500 mb-0.5 text-right">You</p>
                  <div className="bg-indigo-500 text-white px-3 py-2 rounded-2xl rounded-tr-sm">
                    <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium bg-indigo-500">
                  U
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium bg-slate-600">
                  A
                </div>
                <div className="min-w-0 max-w-[75%]">
                  <p className="text-xs text-slate-500 mb-0.5">Assistant</p>
                  <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-tl-sm">
                    <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* New messages button */}
      {showNewMessages && (
        <div className="flex-shrink-0 px-4 pb-2 flex justify-center">
          <button
            onClick={scrollToBottom}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-indigo-700"
          >
            New messages ↓
          </button>
        </div>
      )}

      {/* Input bar - fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t bg-white">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Type your idea..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
