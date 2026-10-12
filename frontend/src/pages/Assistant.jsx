import { useState, useRef, useEffect } from 'react';
import { assistantAPI } from '../services/api';
import { Send, Bot, User } from 'lucide-react';

const SUGGESTIONS = [
  'Which products may go out of stock next month?',
  'Which supplier has the best performance?',
  'What is the total inventory value?',
  'Which shipments are delayed?',
  'How can I reduce transportation cost?',
  'What happens if demand increases by 20%?',
];

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am the AI Supply Chain Assistant. Ask me about inventory, demand, suppliers, risk, cost, or run what-if scenarios.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (q) => {
    const query = (q || input).trim();
    if (!query || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: query }]);
    setLoading(true);
    try {
      const { data } = await assistantAPI.query(query);
      setMessages((m) => [...m, { role: 'assistant', text: data.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Sorry, I could not process that request. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">AI Supply Chain Assistant</h2>
        <p className="text-sm text-slate-500">Natural-language Q&A grounded in live data</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-brand-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-700 rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-600" />
            </div>
            <div className="bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-400">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 transition"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about inventory, suppliers, risk, cost…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
