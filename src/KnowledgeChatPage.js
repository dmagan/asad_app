import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftCircle,
  Database,
  Download,
  MessageCircle,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'knowledge-bot-entries';

const KnowledgeChatPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to read stored knowledge', error);
      return [];
    }
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'سلام! می‌توانید دانش خود را اضافه کنید تا بر اساس آن به سوال‌ها پاسخ بدهم.',
    },
  ]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to persist knowledge', error);
    }
  }, [entries]);

  const addEntry = () => {
    if (!title.trim() || !content.trim()) return;
    const newEntry = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setTitle('');
    setContent('');
  };

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const relevantEntries = useMemo(() => {
    if (!question.trim()) return [];
    const queryWords = question
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return entries
      .map((entry) => {
        const haystack = `${entry.title} ${entry.content}`.toLowerCase();
        const score = queryWords.reduce(
          (total, word) => (haystack.includes(word) ? total + 1 : total),
          0,
        );
        return { entry, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.entry);
  }, [entries, question]);

  const answerQuestion = () => {
    if (!question.trim()) return;
    const userMessage = { sender: 'user', text: question.trim() };
    const bestMatches = relevantEntries.slice(0, 3);

    const botMessage = bestMatches.length
      ? {
          sender: 'bot',
          text: `بر اساس داده‌های ذخیره شده پاسخ می‌دهم:\n${bestMatches
            .map((entry, idx) => `${idx + 1}. ${entry.title}: ${entry.content}`)
            .join('\n')}`,
        }
      : {
          sender: 'bot',
          text: 'هیچ داده مرتبطی پیدا نکردم. لطفاً اطلاعات بیشتری اضافه کنید یا پرسش را دقیق‌تر بپرسید.',
        };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setQuestion('');
  };

  const exportEntries = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'knowledge-bot-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importEntries = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter((item) => item.title && item.content)
            .map((item) => ({
              id: item.id || Date.now() + Math.random(),
              title: String(item.title),
              content: String(item.content),
            }));
          setEntries(normalized);
        }
      } catch (error) {
        console.error('Failed to import knowledge', error);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`min-h-screen px-4 pb-10 pt-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
      dir="rtl"
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          aria-label="بازگشت"
          onClick={() => navigate(-1)}
          className={`p-2 rounded-full border ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-800'}`}
        >
          <ArrowLeftCircle size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">دستیار اطلاعات شما</h1>
          <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
            اطلاعات اختصاصی را ذخیره کنید و بر اساس آن‌ها پاسخ بگیرید.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Database size={20} className="text-yellow-400" />
            <h2 className="font-semibold">افزودن دانش جدید</h2>
          </div>
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان یا کلیدواژه"
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-700 text-white focus:border-yellow-400'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-yellow-500'
              }`}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="توضیحات یا پاسخ کامل"
              rows={4}
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-700 text-white focus:border-yellow-400'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-yellow-500'
              }`}
            />
            <button
              onClick={addEntry}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-yellow-500 text-gray-900 font-semibold py-2"
            >
              <Save size={18} />
              ذخیره اطلاعات
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportEntries}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold ${
                  isDarkMode
                    ? 'border-gray-700 text-gray-100 hover:bg-gray-900'
                    : 'border-gray-200 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Download size={16} />
                خروجی JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold ${
                  isDarkMode
                    ? 'border-gray-700 text-gray-100 hover:bg-gray-900'
                    : 'border-gray-200 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Upload size={16} />
                ورود JSON
              </button>
              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                onChange={importEntries}
                className="hidden"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle size={18} className="text-yellow-400" />
              حافظه شما ({entries.length})
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {entries.length === 0 && <p className="text-sm text-gray-500">هنوز داده‌ای ذخیره نشده است.</p>}
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-xl p-3 flex items-start justify-between gap-3 ${
                    isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{entry.title}</p>
                    <p className="text-sm mt-1 leading-relaxed text-gray-500 dark:text-gray-300">{entry.content}</p>
                  </div>
                  <button
                    aria-label="حذف"
                    onClick={() => deleteEntry(entry.id)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-4 shadow-sm flex flex-col ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={20} className="text-yellow-400" />
            <h2 className="font-semibold">گفتگو با ربات</h2>
          </div>
          <div className={`flex-1 rounded-2xl p-3 mb-3 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] leading-relaxed ${
                      message.sender === 'user'
                        ? isDarkMode
                          ? 'bg-gray-700 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                        : 'bg-yellow-500 text-gray-900'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {relevantEntries.length > 0 && (
            <div className={`rounded-xl p-2 mb-3 text-xs ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <p className="font-semibold mb-1">مطالب مرتبط در حافظه:</p>
              <div className="flex flex-wrap gap-2">
                {relevantEntries.map((entry) => (
                  <span key={entry.id} className="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-800">
                    {entry.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="سوال خود را بر اساس داده‌های ذخیره شده بپرسید"
              className={`flex-1 rounded-xl px-3 py-2 border focus:outline-none ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-700 text-white focus:border-yellow-400'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-yellow-500'
              }`}
            />
            <button
              onClick={answerQuestion}
              className="px-4 py-2 rounded-xl bg-yellow-500 text-gray-900 font-semibold"
            >
              پرسش
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeChatPage;
