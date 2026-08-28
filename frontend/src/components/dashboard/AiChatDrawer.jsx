import  { useState } from 'react';
import { heatApi } from '../../services/api';

export default function AiChatDrawer({ isOpen, onClose, city = 'Raipur', location }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Urban Heat AI Analyst. How can I help you interpret the predictive LST data today?' }
  ]);
  const [input, setInput] = useState('');

  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    if (!location) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Location data is still loading. Please try again in a moment.' }]);
      return;
    }
    setIsSending(true);
    try {
      const result = await heatApi.analyzeLocation({ question: input, city, latitude: location.latitude, longitude: location.longitude });
      setMessages(prev => [...prev, { sender: 'ai', text: result.answer || 'The analyst did not return an answer for this location.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: `AI analysis failed: ${error.message}` }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 bottom-4 w-96 bg-black/60 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-400 text-3xl">psychology</span>
          <h2 className="text-white font-semibold text-lg">AI Analyst</h2>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.sender === 'user' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-50 rounded-tr-sm' : 'bg-white/10 border border-white/10 text-white/90 rounded-tl-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the LST data..." 
            className="w-full bg-black/40 border border-white/20 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
          />
          <button type="submit" disabled={isSending} className="absolute right-2 text-emerald-400 p-2 hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center">
            <span className={`material-symbols-outlined text-[18px] ${isSending ? 'animate-spin' : ''}`}>{isSending ? 'sync' : 'send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
