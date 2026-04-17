'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, MessageSquare, Shield, Brain, ArrowDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

export default function AuraPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    if (!apiKey) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'I require a connection to the neural network to proceed. Please ensure the NEXT_PUBLIC_GEMINI_API_KEY is configured in the Secrets panel.' 
      }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: "You are Aura, a minimalist AI. You can generate images by outputting a Markdown image tag in the format ![Image](https://image.pollinations.ai/prompt/DESCRIPTION?width=1024&height=1024&nologo=true) where DESCRIPTION is a URL-encoded detailed prompt. If the user asks to draw or see something, generate this tag. Keep your text responses brief and elegant."
        }
      });
      const text = response.text || 'Forgive me, I returned an empty response.';
      setMessages(prev => [...prev, { role: 'ai', content: text }]);
    } catch (error: any) {
      console.error('Error generating response:', error);
      let errorMessage = 'Forgive me, I encountered a disturbance in the flow. Please try again.';
      
      if (error?.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'The provided API key is invalid. Please check your configuration in the Secrets panel.';
      } else if (error?.message?.includes('model not found')) {
        errorMessage = 'The neural bridge is still being constructed. (Model not found error).';
      }
      
      setMessages(prev => [...prev, { role: 'ai', content: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-zinc-800 selection:text-zinc-100">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/30 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-zinc-900 backdrop-blur-md bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-zinc-950" />
          </div>
          <span className="font-medium tracking-tight text-xl">Aura</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Philosophy</a>
          <a href="#" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Capabilities</a>
          <button className="px-4 py-1.5 rounded-full border border-zinc-800 text-sm hover:bg-zinc-900 transition-colors">
            Sign In
          </button>
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 pt-12 pb-24">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-12 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-none italic font-serif">
                Pure intelligence,<br />distilled into air.
              </h1>
              <p className="text-zinc-500 max-w-xl mx-auto text-lg leading-relaxed">
                Experience a minimalist AI crafted for focused brainstorms, creative writing, and deep exploration.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
            >
              {[
                { icon: Brain, title: "Neural Logic", desc: "Powered by Gemini for advanced reasoning." },
                { icon: Shield, title: "Private by Design", desc: "Your data is ephemeral and encrypted." },
                { icon: MessageSquare, title: "Fluent Flow", desc: "Natural, nuanced conversations." }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl border border-zinc-900 bg-zinc-950/50 hover:border-zinc-800 transition-all group cursor-pointer">
                  <feature.icon className="w-6 h-6 mb-4 text-zinc-500 group-hover:text-zinc-100 transition-colors" />
                  <h3 className="font-medium mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-8 mb-8 pr-4 custom-scrollbar" ref={scrollRef}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex max-w-[90%] flex-col gap-2",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-zinc-100 text-zinc-950 rounded-tr-none" 
                      : "bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800"
                  )}>
                    <div className="markdown-body">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          img: ({ node, ...props }) => (
                            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-lg">
                              <img 
                                {...props} 
                                referrerPolicy="no-referrer"
                                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                              />
                            </div>
                          ),
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium px-1">
                    {msg.role === 'user' ? 'Inquiry' : 'Aura'}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-zinc-500 text-xs italic"
                >
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  </div>
                  Thinking...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Input area */}
        <div className="fixed bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Aura anything..."
                className="w-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full px-8 py-5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-2xl"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-100 text-zinc-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                <ArrowDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
