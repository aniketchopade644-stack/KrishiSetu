import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  Sprout,
  Layers,
  CloudSun,
  Droplets,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AIAssistant = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextDetails, setContextDetails] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const initAI = async () => {
      try {
        const [farmsRes, historyRes] = await Promise.all([
          api.get('/farms'),
          api.get('/ai/history'),
        ]);

        const farmList = farmsRes.data.data || [];
        setFarms(farmList);
        if (farmList.length > 0) setSelectedFarmId(farmList[0]._id);

        const history = historyRes.data.data || [];
        if (history.length > 0) {
          setMessages(history);
        } else {
          // Welcome greeting
          const welcomeGreetings = {
            mr: 'नमस्कार! मी **कृषी मित्र (Krishi Mitra)** आहे – तुमचा AI शेती सल्लागार. तुमच्या शेताच्या माती परीक्षण, पीक नोंदी आणि थेट हवामानाच्या आधारे अचूक सल्ला देण्यासाठी मी सदैव सज्ज आहे. आज मी तुम्हाला कोणती मदत करू?',
            hi: 'नमस्ते! मैं **कृषि मित्र (Krishi Mitra)** हूँ – आपका AI कृषि सलाहकार। आपके खेत की मिट्टी, मौसम और फसलों की स्थिति के अनुसार मार्गदर्शन करने के लिए तैयार हूँ। आज आपका क्या प्रश्न है?',
            en: 'Welcome! I am **Krishi Mitra**, your AI Smart Farming Advisor. I analyze your real-time farm soil metrics, active crops, and hyperlocal meteorological data to provide tailored agronomic guidance. How can I assist your farm today?',
          };

          setMessages([
            {
              role: 'assistant',
              content: welcomeGreetings[currentLanguage] || welcomeGreetings.en,
            },
          ]);
        }
      } catch (err) {
        console.error('Error loading AI context:', err);
      }
    };

    initAI();
  }, [currentLanguage]);

  const handleSend = async (customPrompt) => {
    const query = customPrompt || inputQuery;
    if (!query || query.trim() === '') return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', {
        prompt: query,
        farmId: selectedFarmId || null,
        language: currentLanguage,
      });

      if (res.data.success) {
        const assistantMsg = {
          role: 'assistant',
          content: res.data.data.response,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setContextDetails(res.data.data.contextUsed);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error connecting to the agricultural AI service. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear conversation history?')) return;
    try {
      await api.delete('/ai/history');
      setMessages([
        {
          role: 'assistant',
          content: 'Conversation history cleared. How can I assist you with your farming decisions?',
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedFarmObj = farms.find((f) => f._id === selectedFarmId);

  const quickPrompts = [
    t('ai.prompt_irrigation'),
    t('ai.prompt_fertilizer'),
    t('ai.prompt_pest'),
    t('ai.prompt_weather'),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4 pb-4">
      {/* AI Header & Context Bar */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:via-teal-800 dark:to-slate-900 p-4 sm:p-5 text-white shadow-lg shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 border border-white/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold font-heading text-white">Krishi Mitra AI</h2>
                <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-200 border border-emerald-400/30">
                  Your Smart Farming Assistant
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Get simple advice based on your farm, soil and weather.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-white/20 bg-white/10 py-1.5 px-3 text-xs font-semibold text-white focus:outline-none backdrop-blur-md"
            >
              <option value="" className="text-slate-900">🌱 Select Your Farm</option>
              {farms.map((f) => (
                <option key={f._id} value={f._id} className="text-slate-900">
                  🌱 {f.farmName}{f.currentCrop ? ` — ${f.currentCrop}` : ' — Select Farm'}
                </option>
              ))}
            </select>

            <button
              onClick={handleClearHistory}
              className="rounded-xl border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20 backdrop-blur-md transition"
              title="Clear Chat History"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Stream Box */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/90 p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-amber-500 text-slate-900 shadow-sm'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-50 text-slate-800 dark:bg-slate-800/80 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700/60 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state suggestion cards — shown only when no user message exists yet */}
        {messages.length <= 1 && !loading && (
          <div className="py-4">
            <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wide">Try asking</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🌧️', text: 'Should I irrigate today?' },
                { icon: '🌱', text: 'What fertilizer should I use?' },
                { icon: '🐛', text: 'How can I control crop pests?' },
                { icon: '☀️', text: 'How will the upcoming weather affect my crop?' },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.text)}
                  disabled={loading}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-left hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 transition group"
                >
                  <span className="text-lg leading-none mt-0.5">{s.icon}</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 leading-relaxed">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-900 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-3xl rounded-tl-none border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/60 dark:bg-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                <span>Thinking about your farm...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Bubbles */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick Ask:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="shrink-0 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center shrink-0"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={t('ai.input_placeholder')}
          disabled={loading}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-12 text-xs font-medium text-slate-800 shadow-md focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
