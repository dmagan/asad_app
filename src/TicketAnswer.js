import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftCircle, Send, RefreshCw, MessageCircle, User, Clock, AlertCircle, Menu, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';

const TicketAnswer = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const [currentView, setCurrentView] = useState('list');
  
  const cardRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
        loadTickets();
      }, 100);
    }
  }, [isOpen]);

  const loadTickets = async (page = 1, status = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      const endpoint = `https://p30s.com/wp-json/custom-support/v1/admin/all-tickets?page=${page}&per_page=20&status=${status}`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.data || []);
        
        if (data.pagination) {
          setTotalPages(Math.ceil(data.pagination.total / data.pagination.per_page));
          setCurrentPage(data.pagination.page);
        }
      } else {
        console.error('Failed to load tickets:', response.status);
        Store.addNotification({
          title: "خطا",
          message: "خطا در بارگیری تیکت‌ها",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000 }
        });
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      Store.addNotification({
        title: "خطای شبکه",
        message: "خطا در اتصال به سرور",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId) => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`https://p30s.com/wp-json/custom-support/v1/tickets/${ticketId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
        scrollToBottom();
        
        setSelectedTicket(prev => prev ? ({
          ...prev,
          unread_admin_count: isAdmin ? 0 : prev.unread_admin_count,
          unread_user_count: !isAdmin ? 0 : prev.unread_user_count
        }) : null);
        
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? {
                  ...ticket,
                  unread_admin_count: isAdmin ? 0 : ticket.unread_admin_count,
                  unread_user_count: !isAdmin ? 0 : ticket.unread_user_count
                }
              : ticket
          )
        );
      } else {
        console.error('Failed to load messages:', response.status);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      const endpoint = isAdmin 
        ? `https://p30s.com/wp-json/custom-support/v1/admin/tickets/${selectedTicket.id}/reply`
        : `https://p30s.com/wp-json/custom-support/v1/tickets/${selectedTicket.id}/messages`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: replyMessage
        })
      });

      if (response.ok) {
        setReplyMessage('');
        loadMessages(selectedTicket.id);
        
        setSelectedTicket(prev => ({
          ...prev,
          unread_admin_count: isAdmin ? 0 : prev.unread_admin_count,
          unread_user_count: !isAdmin ? 0 : prev.unread_user_count
        }));
        
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === selectedTicket.id 
              ? {
                  ...ticket,
                  unread_admin_count: isAdmin ? 0 : ticket.unread_admin_count,
                  unread_user_count: !isAdmin ? 0 : ticket.unread_user_count
                }
              : ticket
          )
        );
        
        loadTickets(currentPage, statusFilter);
        
        Store.addNotification({
          title: "موفق",
          message: "پیام با موفقیت ارسال شد",
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 2000 }
        });
      } else {
        throw new Error('خطا در ارسال پیام');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      Store.addNotification({
        title: "خطا",
        message: "خطا در ارسال پیام",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('آیا از حذف این پیام اطمینان دارید؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      const response = await fetch(`https://p30s.com/wp-json/custom-support/v1/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        
        Store.addNotification({
          title: "موفق",
          message: "پیام با موفقیت حذف شد",
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 2000 }
        });
      } else {
        throw new Error('خطا در حذف پیام');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      Store.addNotification({
        title: "خطا",
        message: "خطا در حذف پیام",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

 const closeCard = () => {
  if (currentView === 'messages') {
    // اگر در صفحه پیام‌ها هستیم، برگرد به لیست
    setCurrentView('list');
    setSelectedTicket(null);
  } else {
    // اگر در لیست هستیم، صفحه را ببند
    setShowCard(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }
};

  const selectTicket = (ticket) => {
    setSelectedTicket(ticket);
    loadMessages(ticket.id);
    setCurrentView('messages');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadTickets(newPage, statusFilter);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    loadTickets(1, status);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'open': 'باز',
      'closed': 'بسته',
      'in_progress': 'در حال بررسی'
    };
    return statusMap[status] || 'نامشخص';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'open': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}
    >
      <div 
        ref={cardRef}
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: `translateX(${showCard ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99)'
        }}
      >
        {/* Header */}
        <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={closeCard} 
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          

          
          <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isAdmin ? 'مدیریت تیکت‌های پشتیبانی' : 'تیکت‌های پشتیبانی'}
          </h2>
          <button 
            onClick={() => loadTickets(currentPage, statusFilter)}
            className={`absolute right-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-blue-500`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

     {/* Main Content */}
<div className="absolute top-16 bottom-0 left-0 right-0">
  {currentView === 'list' ? (
    // نمایش لیست تیکت‌ها
    <div className="h-full flex flex-col">
      {/* Filters */}
      {isAdmin && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              فیلتر بر اساس وضعیت:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">همه تیکت‌ها</option>
              <option value="open">تیکت‌های باز</option>
              <option value="in_progress">در حال بررسی</option>
              <option value="closed">تیکت‌های بسته</option>
            </select>
          </div>
        </div>
      )}

      {/* Tickets Count */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {isAdmin ? 'همه تیکت‌ها' : 'تیکت‌های شما'}: {tickets.length}
          </span>
          {isAdmin && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}>
              ادمین
            </span>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded text-xs ${
                currentPage === 1 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              } ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              قبلی
            </button>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentPage} از {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded text-xs ${
                currentPage === totalPages 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              } ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              بعدی
            </button>
          </div>
        )}
      </div>
      
      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              در حال بارگذاری...
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              هیچ تیکتی یافت نشد
            </p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => selectTicket(ticket)}
              className={`p-4 border-b cursor-pointer transition-colors ${
                isDarkMode ? 'hover:bg-gray-800 border-gray-700' : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className={`font-medium text-sm leading-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {ticket.title}
                  </h4>
                  {ticket.unread_admin_count > 0 && isAdmin && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                      {ticket.unread_admin_count}
                    </span>
                  )}
                  {ticket.unread_user_count > 0 && !isAdmin && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                      {ticket.unread_user_count}
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <User className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {ticket.display_name || 'کاربر ناشناس'} ({ticket.user_email})
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      #{ticket.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(ticket.updated_at)}
                    </span>
                  </div>

                  {ticket.user_email && (
                    <div className="flex items-center gap-2">
                      <svg className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                        {ticket.user_email}
                      </span>
                    </div>
                  )}

                  {ticket.last_message && (
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} truncate`}>
                      <span className="font-medium">
                        {ticket.last_message.sender_type === 'admin' ? 'ادمین: ' : 'کاربر: '}
                      </span>
                      {ticket.last_message.message?.replace(/<[^>]*>/g, '').substring(0, 50)}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  ) : (
    // نمایش پیام‌های تیکت
    <div className="h-full flex flex-col">
      {selectedTicket && (
        <>
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedTicket.title}
                </h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    تیکت #{selectedTicket.id}
                  </span>
                  {isAdmin && (
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      کاربر: {selectedTicket.display_name || 'ناشناس'}
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                {getStatusText(selectedTicket.status)}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>هنوز پیامی در این تیکت نیست</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 relative ${
                    message.isAdmin
                      ? 'bg-[#f7d55d] text-gray-900'
                      : isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {isAdmin && (
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-red-500 hover:text-white ${
                          message.isAdmin ? 'text-gray-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                        title="حذف پیام"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    
                    <div 
                      className="text-sm message-content"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                    <div className="flex justify-between items-center gap-2 mt-1">
                      <span className={`text-xs ${
                        message.isAdmin ? 'text-gray-700' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {message.isAdmin ? 'ادمین' : (isAdmin ? (message.sender_name || 'کاربر') : 'شما')}
                      </span>
                      <span className={`text-xs ${
                        message.isAdmin ? 'text-gray-700' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(message.date).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className={`
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
              rounded-2xl border
              ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}
            `}>
              <div className="flex items-end gap-2 p-2">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className={`
                    flex-1 p-2 bg-transparent focus:outline-none resize-none
                    ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}
                  `}
                  style={{ 
                    direction: 'rtl',
                    fontSize: '16px'
                  }}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={!replyMessage.trim() || sending}
                  className={`
                    p-2 rounded-full transition-colors
                    ${
                      replyMessage.trim() && !sending
                        ? 'text-[#f7d55d] hover:bg-gray-600'
                        : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }
                  `}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default TicketAnswer;