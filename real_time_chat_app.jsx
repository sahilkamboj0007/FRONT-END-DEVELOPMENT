

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


const uid = () => Math.random().toString(36).slice(2, 9);

export default function RealTimeChatApp({ wsUrl = "ws://localhost:8080" }) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rtchat:messages") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [name, setName] = useState(() => localStorage.getItem("rtchat:name") || "Guest");
  const wsRef = useRef(null);
  const listRef = useRef(null);

  const connect = () => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      setConnected(true);
      // announce presence
      ws.send(JSON.stringify({ type: "join", id: uid(), name }));
    });

    ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "message") {
          pushMessage({ ...data.payload });
        } else if (data.type === "history") {
          // server-sent history (optional)
          setMessages((m) => mergeHistory(m, data.payload || []));
        }
      } catch (err) {
        console.error("failed parse ws message", err);
      }
    });

    ws.addEventListener("close", () => {
      setConnected(false);
      // try reconnect after short delay
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) connect();
      }, 1500);
    });

    ws.addEventListener("error", () => {
      ws.close();
    });
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };

  }, []);

  useEffect(() => {
    localStorage.setItem("rtchat:messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("rtchat:name", name);
  }, [name]);

  const mergeHistory = (current, incoming) => {
    // naive merge by id, keep unique
    const map = new Map();
    [...current, ...incoming].forEach((m) => map.set(m.id, m));
    return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
  };

  const pushMessage = (msg) => {
    setMessages((m) => {
      const next = [...m, msg].slice(-500); 
      return next;
    });
    // scroll to bottom
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const payload = { id: uid(), ts: Date.now(), text, name };
    // optimistically add
    pushMessage({ ...payload, local: true });

    try {
      wsRef.current?.send(JSON.stringify({ type: "message", payload }));
    } catch (e) {
      console.warn("not connected, message queued in local state");
    }

    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-12 gap-4">
        {/* Left: Room / Info */}
        <aside className="col-span-3 bg-white rounded-2xl shadow p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">RT</div>
            <div>
              <div className="text-sm font-semibold">Real-Time Chat</div>
              <div className="text-xs text-muted-foreground">WebSocket — {connected ? <span className="text-green-600">Connected</span> : <span className="text-red-600">Disconnected</span>}</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>

          <div className="mt-auto text-xs text-gray-500">
            Message history is saved to your browser (localStorage). This demo keeps the last 500 messages.
          </div>
        </aside>

        {/* Main chat */}
        <main className="col-span-9 bg-white rounded-2xl shadow p-4 flex flex-col h-[70vh]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Room: Lobby</h2>
            <div className="text-sm text-gray-500">Users: demo (server doesn't track real presence)</div>
          </div>

          <div ref={listRef} className="flex-1 overflow-auto p-2 space-y-2 rounded-lg border border-dashed border-gray-100">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-3 rounded-xl max-w-[80%] ${m.name === name ? "ml-auto bg-indigo-50 border border-indigo-100" : "bg-gray-50 border border-gray-100"}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">{m.name?.slice(0,2).toUpperCase()}</div>
                    <div className="text-xs text-gray-600">{m.name} • <span className="text-[11px] text-gray-400">{new Date(m.ts).toLocaleTimeString()}</span></div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-gray-800">{m.text}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-3 border-t pt-3">
            <div className="flex gap-2">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} rows={1} className="flex-1 resize-none rounded-lg border px-3 py-2" placeholder="Type a message — Enter to send" />
              <button onClick={sendMessage} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:brightness-110">Send</button>
            </div>
            <div className="mt-2 text-xs text-gray-400">Press Enter to send. Messages are optimistically rendered and sent over WebSocket.</div>
          </div>
        </main>
      </div>
    </div>
  );
}

