class NewSupportNotificationService {
  constructor() {
    this.listeners = [];
    this.isPolling = false;
    this.pollingInterval = null;
    this.lastReadMessageId = null;
    this.unreadCount = 0;
  }
  
  // شروع سرویس
  start() {
    if (this.isPolling) return;
    
    // خواندن آخرین پیام خوانده شده از localStorage
    this.lastReadMessageId = localStorage.getItem('lastReadNewSupportMessageId') || null;
    
    // بررسی فوری پیام‌های جدید
    this.isPolling = true;
    this.checkForNewMessages();
    
    // شروع polling هر 30 ثانیه
    this.pollingInterval = setInterval(() => {
      this.checkForNewMessages();
    }, 30000);
    
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
  
  // بررسی پیام‌های جدید از API جدید
  async checkForNewMessages() {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) return;
      
      // استفاده از API جدید
      const response = await fetch('https://p30s.com/wp-json/custom-support/v1/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log('Unread count API failed with status:', response.status);
        // در صورت خطا، مقدار را صفر قرار می‌دهیم
        if (this.unreadCount !== 0) {
          this.unreadCount = 0;
          this.notifyListeners();
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        const newUnreadCount = parseInt(data.unread_count) || 0;
        
        // اگر تعداد پیام‌های خوانده نشده تغییر کرده باشد
        if (newUnreadCount !== this.unreadCount) {
          this.unreadCount = newUnreadCount;
          this.notifyListeners();
        }
      } else {
        // در صورت عدم موفقیت، مقدار را صفر قرار می‌دهیم
        if (this.unreadCount !== 0) {
          this.unreadCount = 0;
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Error checking for new support messages:', error);
      // در صورت خطا، مقدار را صفر قرار می‌دهیم
      if (this.unreadCount !== 0) {
        this.unreadCount = 0;
        this.notifyListeners();
      }
    }
  }
  
  // علامت‌گذاری تمام پیام‌ها به عنوان خوانده شده
  markAllAsRead(latestMessageId = null) {
    if (latestMessageId) {
      this.lastReadMessageId = latestMessageId;
      localStorage.setItem('lastReadNewSupportMessageId', latestMessageId);
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
      try {
        listener(this.unreadCount);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }
  
  // تنظیم دستی تعداد پیام‌های ناخوانده
  setUnreadCount(count) {
    this.unreadCount = count;
    this.notifyListeners();
    return this.unreadCount;
  }

  // متد کمکی برای دیباگ
  debug() {
    console.log('NewSupportNotificationService Debug Info:', {
      isPolling: this.isPolling,
      unreadCount: this.unreadCount,
      lastReadMessageId: this.lastReadMessageId,
      listenersCount: this.listeners.length
    });
  }
}

// ایجاد یک نمونه واحد از سرویس
const newSupportNotificationService = new NewSupportNotificationService();

export default newSupportNotificationService;