class SupportNotificationService {
  constructor() {
    this.listeners = [];
    this.isPolling = false;
    this.pollingInterval = null;
    this.lastReadMessageId = null;
    this.unreadCount = 0;
  }
  
  // شروع سرویس با بررسی پیام‌ها در پس‌زمینه
  start() {
    if (this.isPolling) return;
    
    // خواندن آخرین پیام خوانده شده از localStorage
    this.lastReadMessageId = localStorage.getItem('lastReadSupportMessageId') || null;
    
    // بررسی فوری پیام‌ها در زمان شروع
    this.isPolling = true;
    this.checkForNewMessages();
    
    // شروع polling هر نیم ساعت (30 دقیقه)
    this.pollingInterval = setInterval(() => {
      this.checkForNewMessages();
    }, 1800000); // 1800000 میلی‌ثانیه = 30 دقیقه
    
    return true;
  }
  
  // توقف سرویس
  stop() {
    this.isPolling = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  // بررسی پیام‌های جدید از سرور - با آدرس API درست
  async checkForNewMessages() {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) return;
      
      // استفاده از API صحیح wpas-api به جای awesome-support
      const ticketsResponse = await fetch('https://p30s.com/wp-json/wpas-api/v1/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!ticketsResponse.ok) {
        // اگر API اصلی کار نکرد، ادامه نده
        console.log('Tickets API failed with status:', ticketsResponse.status);
        return;
      }
      
      const tickets = await ticketsResponse.json();
      
      // بررسی تیکت‌ها برای پیام‌های ادمین
      let adminMessages = [];
      
      // چک کردن هر تیکت و پاسخ‌های آن
      for (const ticket of tickets) {
        try {
          // دریافت پاسخ‌های هر تیکت
          const repliesResponse = await fetch(`https://p30s.com/wp-json/wpas-api/v1/tickets/${ticket.id}/replies`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (repliesResponse.ok) {
            const replies = await repliesResponse.json();
            // فیلتر کردن پاسخ‌های ادمین
            const agentReplies = replies.filter(reply => 
              reply.author === 1 || 
              reply.author_name === 'admin' || 
              reply.author_name === 'support'
            );
            
            adminMessages = [...adminMessages, ...agentReplies];
          }
        } catch (err) {
          // خطای یک تیکت را نادیده بگیر و به بقیه ادامه بده
          continue;
        }
      }
      
      if (adminMessages.length === 0) return;
      
      // مرتب‌سازی بر اساس تاریخ
      adminMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // آخرین پیام ادمین
      const latestAdminMessage = adminMessages[0];
      
      // بررسی آیا پیام‌های خوانده نشده داریم
      if (!this.lastReadMessageId || parseInt(this.lastReadMessageId) < parseInt(latestAdminMessage.id)) {
        // محاسبه تعداد پیام‌های خوانده نشده
        const unreadMessages = adminMessages.filter(msg => 
          !this.lastReadMessageId || parseInt(msg.id) > parseInt(this.lastReadMessageId)
        );
        
        this.unreadCount = unreadMessages.length;
        
        // اطلاع‌رسانی به listeners
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error checking for new support messages:', error);
    }
  }
  
  // علامت‌گذاری تمام پیام‌ها به عنوان خوانده شده
  markAllAsRead(latestMessageId) {
    if (latestMessageId) {
      this.lastReadMessageId = latestMessageId;
      localStorage.setItem('lastReadSupportMessageId', latestMessageId);
    }
    this.unreadCount = 0;
    this.notifyListeners();
  }
  
  // دریافت تعداد پیام‌های خوانده نشده
  getUnreadCount() {
    return this.unreadCount;
  }
  
  // افزودن listener
  addListener(callback) {
    this.listeners.push(callback);
    // بلافاصله اطلاعات فعلی را برگردان
    callback(this.unreadCount);
  }
  
  // حذف listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  // اطلاع‌رسانی به تمام listener ها
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.unreadCount);
    });
  }
  
  // تنظیم دستی تعداد پیام‌های ناخوانده
  setUnreadCount(count) {
    this.unreadCount = count;
    this.notifyListeners();
    return this.unreadCount;
  }
}

// ایجاد یک نمونه واحد از سرویس
const supportNotificationService = new SupportNotificationService();

export default supportNotificationService;