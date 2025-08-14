import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftCircle, Send } from 'lucide-react';
import { Store } from 'react-notifications-component';
import MessageSkeleton from './MessageSkeleton';

const TicketMessage = ({ message, isDarkMode }) => {
  const formattedDate = new Date(message.date).toLocaleDateString('fa-IR');
  const formattedTime = new Date(message.date).toLocaleTimeString('fa-IR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex w-full ${message.isAdmin ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[80%] rounded-2xl p-4 relative ${
        message.isAdmin 
          ? isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          : 'bg-[#f7d55d]'
      }`}>
        <div 
          className={`text-sm ${
            message.isAdmin 
              ? isDarkMode ? 'text-white' : 'text-gray-800'
              : 'text-gray-900'
          }`}
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
        <div className="flex justify-end items-center gap-2 mt-2">
          <span className={`text-xs ${
            message.isAdmin 
              ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
              : 'text-gray-700'
          }`}>
            {formattedTime}
          </span>
          <span className={`text-xs ${
            message.isAdmin 
              ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
              : 'text-gray-700'
          }`}>
            {formattedDate}
          </span>
          {!message.isAdmin && (
            <div className="flex items-center">
              {message.isPending ? (
                <svg 
                  className="w-3 h-3 text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg 
                  className="w-3 h-3 text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TicketDetailsModal = ({ isOpen, onClose, ticketId, isDarkMode, isNewTicket = false, onCreateTicket }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch messages when modal opens and ticketId changes
  useEffect(() => {
    if (isOpen && !isNewTicket && ticketId) {
      // Show loading state
      setLoading(true);

      // Fetch messages for the given ticketId
      fetchMessages(ticketId)
        .then(({ messages }) => {
          // Save fetched messages to state
          setMessages(messages);
        })
        .catch(error => {
          // Display error notification to the user
          Store.addNotification({
            title: "خطا",
            message: "خطا در بارگذاری پیام‌ها",
            type: "danger",
            insert: "top",
            container: "center",
            dismiss: { duration: 3000 }
          });
        })
        .finally(() => {
          // End loading state
          setLoading(false);
        });
    }
  }, [isOpen, ticketId, isNewTicket]);

  const fetchMessages = async (ticketId) => {
    try {
      const auth = btoa('test:test');
      // First fetch the ticket information
      const ticketResponse = await fetch(`https://p30s.com/wp-json/wpas-api/v1/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      if (!ticketResponse.ok) throw new Error('خطا در دریافت اطلاعات تیکت');
      const ticketData = await ticketResponse.json();

      // Fetch the replies
      const repliesResponse = await fetch(`https://p30s.com/wp-json/wpas-api/v1/tickets/${ticketId}/replies`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      if (!repliesResponse.ok) throw new Error('خطا در دریافت پیام‌ها');
      const repliesData = await repliesResponse.json();

      // Combine the initial ticket message with the replies
      const initialMessage = {
        id: ticketData.id,
        content: ticketData.content?.rendered || ticketData.message,
        date: ticketData.date,
        isAdmin: false,
        isPending: false
      };

      const formattedReplies = repliesData.map(reply => ({
        id: reply.id,
        content: reply.content.rendered,
        date: reply.date,
        isAdmin: reply.author === 1,
        isPending: false
      }));

      // Combine all messages and sort them by date
      const allMessages = [initialMessage, ...formattedReplies].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      return { messages: allMessages };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNewTicket) {
      if (!title.trim()) {
        Store.addNotification({
          title: "خطا",
          message: "لطفاً عنوان تیکت را وارد کنید",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000 }
        });
        return;
      }
    }

    if (!message.trim()) {
      Store.addNotification({
        title: "خطا",
        message: "لطفاً متن پیام را وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
      return;
    }

    // Add message immediately with pending status
    const tempMessage = {
      id: Date.now(),
      content: message,
      date: new Date().toISOString(),
      isAdmin: false,
      isPending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessage('');
    scrollToBottom();

    try {
      const auth = btoa('test:test');
      const response = await fetch(`https://p30s.com/wp-json/wpas-api/v1/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: tempMessage.content,
          ticket_id: ticketId
        })
      });

      if (!response.ok) throw new Error('خطا در ارسال پیام');

      // Update the message status after successful send
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id
          ? { ...msg, isPending: false }
          : msg
      ));

    } catch (error) {
      console.error('Error:', error);

      // Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));

      Store.addNotification({
        title: "خطا",
        message: "خطا در ارسال پیام",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button 
          onClick={onClose}
          className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
        >
          <ArrowLeftCircle className="w-8 h-8" />
        </button>
        <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {isNewTicket ? 'تیکت جدید' : 'جزئیات تیکت'}
        </h2>
      </div>

      {/* Messages Area */}
      <div className="absolute top-16 bottom-20 left-0 right-0 overflow-y-auto p-4">
        {loading ? (
          <>
            <MessageSkeleton isDarkMode={isDarkMode} />
            <MessageSkeleton isDarkMode={isDarkMode} />
            <MessageSkeleton isDarkMode={isDarkMode} />
          </>
        ) : (
          <>
            {[...messages]
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((message) => (
                <TicketMessage 
                  key={message.id}
                  message={message}
                  isDarkMode={isDarkMode}
                />
              ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {isNewTicket && (
          <div className={`mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2 p-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان تیکت را وارد کنید..."
                className={`flex-1 p-2 bg-transparent focus:outline-none ${
                  isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'
                }`}
                style={{ direction: 'rtl' }}
              />
            </div>
          </div>
        )}
          
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              className={`flex-1 p-2 bg-transparent focus:outline-none ${
                isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'
              }`}
              style={{ direction: 'rtl' }}
            />
            
            <button 
              type="submit"
              className={`p-2 rounded-full transition-colors ${
                message.trim() && (!isNewTicket || (isNewTicket && title.trim()))
                  ? 'text-[#f7d55d]'
                  : isDarkMode ? 'text-gray-600' : 'text-gray-400'
              } ${
                message.trim() && (!isNewTicket || (isNewTicket && title.trim())) && 
                (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
              disabled={!message.trim() || (isNewTicket && !title.trim())}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
