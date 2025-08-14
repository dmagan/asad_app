// MessageService.js
// سرویس مدیریت پیام‌های پشتیبانی با قابلیت کش‌گذاری - اولویت با کش

class MessageService {
  constructor() {
    this.cachedMessages = {};      // کش پیام‌ها
    this.cachedTickets = null;     // کش تیکت‌ها
    this.activeTicketId = null;    // شناسه تیکت فعال
    this.syncIntervalId = null;    // شناسه اینتروال برای همگام‌سازی
    this.lastSyncTime = null;      // زمان آخرین همگام‌سازی
    this.isSyncing = false;        // وضعیت همگام‌سازی فعلی
    this.listeners = [];           // شنوندگان برای تغییرات
    this.currentUserId = null;     // شناسه کاربر فعلی
  }

  // آغاز سرویس و همگام‌سازی اولیه - اولویت با کش
  async start() {
    // بررسی وجود توکن کاربر
    const token = this._getToken();
    if (!token) return false;
    
    // شناسایی کاربر فعلی
    const userId = this._getCurrentUserId();
    const userChanged = userId !== this.currentUserId;
    
  /*  console.log('Message Service - User check:', { 
      currentStored: this.currentUserId,
      newUser: userId,
      changed: userChanged
    });*/
    
    if (userChanged) {
      // اگر کاربر تغییر کرده، داده‌ها را بازنشانی کنیم
      this.cachedMessages = {};
      this.cachedTickets = null;
      this.activeTicketId = null;
      this.lastSyncTime = null;
      this.currentUserId = userId;
    } else {
      // اگر کاربر همان است، از کش استفاده کنیم
      this._loadFromStorage();
    }

    // اعلان اولیه به UI برای نمایش داده‌های کش
    this._notifyListeners();

    try {
      // شروع همگام‌سازی در پس‌زمینه
      this.isSyncing = true;
      this._notifyListeners();
      
      // اگر تیکت فعالی نداریم، یکی را دریافت کنیم
      if (!this.activeTicketId) {
        await this._getActiveTicket();
      } else {
        // اگر تیکت فعال داریم، پیام‌ها را در پس‌زمینه همگام‌سازی کنیم
        this._syncTickets().then(() => {
          if (this.activeTicketId) {
            this._syncTicketMessages(this.activeTicketId);
          }
        }).catch(error => {
          //console.error('Error in background sync:', error);
        });
      }

      // شروع همگام‌سازی دوره‌ای
      this._startSyncInterval();
      
      this.isSyncing = false;
      this._notifyListeners();
      
      return true;
    } catch (error) {
     // console.error('Error starting message service:', error);
      this.isSyncing = false;
      this._notifyListeners();
      
      // حتی در صورت خطا، اگر داده‌های کش داریم، true برگردانیم
      return this.activeTicketId !== null;
    }
  }

  // توقف سرویس
  stop() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    this.listeners = [];
  }

  // افزودن شنونده برای دریافت تغییرات
  addListener(callback) {
    // اضافه کردن شنونده به لیست
    this.listeners.push(callback);
    
    // اطلاع‌رسانی وضعیت فعلی به شنونده جدید
    callback({
      messages: this.getMessages(),
      activeTicketId: this.activeTicketId,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime
    });
  }

  // حذف شنونده
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // دریافت پیام‌های موجود در کش
  getMessages() {
    return this.activeTicketId ? (this.cachedMessages[this.activeTicketId] || []) : [];
  }

  // دریافت شناسه تیکت فعال
  getActiveTicketId() {
    return this.activeTicketId;
  }

  // همگام‌سازی دستی پیام‌ها
  async syncMessages() {
    if (this.isSyncing) return;
    try {
      this.isSyncing = true;
      this._notifyListeners();
      
      await this._syncTickets();
      if (this.activeTicketId) {
        await this._syncTicketMessages(this.activeTicketId);
      }
      
      this.lastSyncTime = new Date();
      this._saveToStorage();
    } catch (error) {
      // console.error('Error syncing messages:', error);
    } finally {
      this.isSyncing = false;
      this._notifyListeners();
    }
  }

  // ارسال پیام جدید
  async sendMessage(content) {
    if (!content.trim() || !this.activeTicketId) {
      throw new Error('پیام یا تیکت نامعتبر');
    }

    const token = this._getToken();
    if (!token) {
      throw new Error('توکن یافت نشد');
    }

    // ایجاد پیام موقت
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      content,
      date: new Date().toISOString(),
      isAdmin: false,
      isPending: true
    };

    // افزودن به کش
    if (!this.cachedMessages[this.activeTicketId]) {
      this.cachedMessages[this.activeTicketId] = [];
    }
    this.cachedMessages[this.activeTicketId].push(tempMessage);
    this._notifyListeners();

    try {
      // ارسال پیام به سرور
      const response = await fetch(
        `https://p30s.com/wp-json/wpas-api/v1/tickets/${this.activeTicketId}/replies`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        }
      );

      if (!response.ok) {
        throw new Error('خطا در ارسال پیام');
      }

      const data = await response.json();

      // به‌روزرسانی پیام در کش
      this.cachedMessages[this.activeTicketId] = this.cachedMessages[this.activeTicketId].map(msg => {
        if (msg.id === tempId) {
          return {
            id: data.id,
            content: data.content.rendered || data.content,
            date: data.date,
            isAdmin: false,
            isPending: false
          };
        }
        return msg;
      });

      this._saveToStorage();
      this._notifyListeners();
      return true;
    } catch (error) {
      // حذف پیام موقت در صورت خطا
      this.cachedMessages[this.activeTicketId] = this.cachedMessages[this.activeTicketId]
        .filter(msg => msg.id !== tempId);
      this._notifyListeners();
      throw error;
    }
  }


  async createTicket(title = 'پیام جدید') {
    try {
      const ticketId = await this._createNewTicket(title);
      return { id: ticketId, success: true };
    } catch (error) {
      console.error('Error creating ticket:', error);
      return { success: false, error: error.message };
    }
  }
  // توابع خصوصی (private)
  // --------------------------------------

  // گرفتن توکن کاربر
  _getToken() {
    return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  }

  // دریافت توکن در فرمت Bearer
  _getAuthHeader() {
    const token = this._getToken();
    return token ? `Bearer ${token}` : null;
  }
  
  // دریافت شناسه کاربر فعلی
  _getCurrentUserId() {
    try {
      const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (!userInfoStr) return null;
      
      const userInfo = JSON.parse(userInfoStr);
      // استفاده از ID کاربر یا آدرس ایمیل یا نام کاربری به عنوان شناسه
      return userInfo.id || 
             userInfo.user_id || 
             userInfo.ID || 
             userInfo.user_email || 
             userInfo.email ||
             userInfo.user_nicename ||
             'anonymous';
    } catch (error) {
      //console.error('Error getting current user ID:', error);
      return 'anonymous';
    }
  }

  // بازیابی کش از localStorage
  _loadFromStorage() {
    try {
      const userId = this._getCurrentUserId();
      const cacheKey = `support_messages_cache_${userId}`;
      const storedData = localStorage.getItem(cacheKey);
      
      if (storedData) {
        const data = JSON.parse(storedData);
        this.cachedMessages = data.messages || {};
        this.activeTicketId = data.activeTicketId;
        this.lastSyncTime = data.lastSyncTime ? new Date(data.lastSyncTime) : null;
        this.currentUserId = userId;
        
        /*console.log('Loaded from cache:', {
          ticketId: this.activeTicketId,
          messagesCount: this.activeTicketId ? (this.cachedMessages[this.activeTicketId]?.length || 0) : 0
        });*/
      }
    } catch (error) {
     // console.error('Error loading from storage:', error);
    }
  }

  // ذخیره کش در localStorage
  _saveToStorage() {
    try {
      const userId = this._getCurrentUserId();
      if (!userId) return; // اگر کاربر شناسایی نشد، ذخیره نکنیم
      
      const cacheKey = `support_messages_cache_${userId}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        messages: this.cachedMessages,
        activeTicketId: this.activeTicketId,
        lastSyncTime: this.lastSyncTime,
        currentUserId: userId
      }));
    } catch (error) {
     // console.error('Error saving to storage:', error);
    }
  }

  // اطلاع‌رسانی به تمام شنوندگان
  _notifyListeners() {
    const data = {
      messages: this.getMessages(),
      activeTicketId: this.activeTicketId,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime
    };
    
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
      // console.error('Error notifying listener:', error);
      }
    });
  }

  // شروع زمان‌بندی برای همگام‌سازی دوره‌ای (هر 10 دقیقه)
  _startSyncInterval() {
    // متوقف کردن اینتروال قبلی اگر وجود دارد
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    // همگام‌سازی اولیه
    this.syncMessages();
    
    // تنظیم همگام‌سازی دوره‌ای
    this.syncIntervalId = setInterval(() => {
      this.syncMessages();
    }, 10 * 60 * 1000); // هر 10 دقیقه
  }

  // همگام‌سازی لیست تیکت‌ها
  async _syncTickets() {
    const authHeader = this._getAuthHeader();
    if (!authHeader) return;

    try {
      const response = await fetch(
        'https://p30s.com/wp-json/wpas-api/v1/tickets',
        {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('خطا در دریافت تیکت‌ها');
      }

      const tickets = await response.json();
      this.cachedTickets = tickets;
      
      // اگر تیکتی فعال نداریم و تیکت‌ها موجود هستند
      if (!this.activeTicketId && tickets.length > 0) {
        this.activeTicketId = tickets[0].id;
        await this._syncTicketMessages(this.activeTicketId);
      }
    } catch (error) {
      //console.error('Error syncing tickets:', error);
    }
  }

// همگام‌سازی پیام‌های یک تیکت خاص
async _syncTicketMessages(ticketId) {
  const authHeader = this._getAuthHeader();
  if (!authHeader || !ticketId) return;

  try {
    // دریافت اطلاعات تیکت - با مدیریت خطای بهتر
    const ticketResponse = await fetch(
      `https://p30s.com/wp-json/wpas-api/v1/tickets/${ticketId}`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }
    ).catch(() => ({ ok: false })); // مدیریت خطا در سطح fetch

    if (!ticketResponse.ok) {
      // به جای پرتاب خطا، فقط return می‌کنیم
      return;
    }
    
    const ticketData = await ticketResponse.json();

    // دریافت پاسخ‌های تیکت
    const repliesResponse = await fetch(
      `https://p30s.com/wp-json/wpas-api/v1/tickets/${ticketId}/replies`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }
    ).catch(() => ({ ok: false })); // مدیریت خطا در سطح fetch

    if (!repliesResponse.ok) {
      // به جای پرتاب خطا، فقط return می‌کنیم
      return;
    }
    
    const repliesData = await repliesResponse.json();

    // تبدیل به فرمت مورد نظر
    const initialMessage = {
      id: ticketData.id,
      content: ticketData.content?.rendered || ticketData.content,
      date: ticketData.date,
      isAdmin: false,
      isPending: false
    };

    const formattedReplies = repliesData.map(reply => ({
      id: reply.id,
      content: reply.content.rendered || reply.content,
      date: reply.date,
      isAdmin: reply.author === 1 || !reply.author || reply.author === 'support',
      isPending: false
    }));

    // مرتب‌سازی پیام‌ها بر اساس تاریخ
    const allMessages = [initialMessage, ...formattedReplies].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // به‌روزرسانی کش
    this.cachedMessages[ticketId] = allMessages;
    this._saveToStorage();
    this._notifyListeners();
  } catch (error) {
    // کامنت شده است - خطا را در کنسول نمایش نمی‌دهیم
    // console.error(`Error syncing messages for ticket ${ticketId}:`, error);
  }
}


  // یافتن یا ایجاد تیکت فعال
  async _getActiveTicket() {
    try {
      await this._syncTickets();
      
      // اگر تیکتی موجود است، از آن استفاده می‌کنیم
      if (this.cachedTickets && this.cachedTickets.length > 0) {
        this.activeTicketId = this.cachedTickets[0].id;
        await this._syncTicketMessages(this.activeTicketId);
      } else {
        // ایجاد تیکت جدید
        await this._createNewTicket();
      }
    } catch (error) {
      // console.error('Error getting active ticket:', error);
      throw error;
    }
  }

  // ایجاد تیکت جدید
  async _createNewTicket() {
    const authHeader = this._getAuthHeader();
    if (!authHeader) {
      throw new Error('توکن یافت نشد');
    }

    try {
      // دریافت اطلاعات کاربر
      const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      let userInfo = null;
      
      if (userInfoStr) {
        userInfo = JSON.parse(userInfoStr);
      }

      const displayName = 
        userInfo?.user_display_name ||
        userInfo?.name ||
        userInfo?.user_nicename ||
        userInfo?.email ||
        userInfo?.user_email ||
        'کاربر';

      // ایجاد تیکت جدید
      const response = await fetch(
        'https://p30s.com/wp-json/wpas-api/v1/tickets',
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `گفتگو با: کاربر (${displayName})`,
            content: 'شروع گفتگو',
            department: 'پشتیبانی',
            priority: 'High'
          })
        }
      );

      if (!response.ok) {
        throw new Error('خطا در ایجاد تیکت');
      }

      const newTicket = await response.json();
      this.activeTicketId = newTicket.id;
      this.cachedMessages[this.activeTicketId] = [];
      this._saveToStorage();
      
      return newTicket.id;
    } catch (error) {
     // console.error('Error creating new ticket:', error);
      throw error;
    }
  }
}

// صادر کردن یک نمونه از کلاس به صورت singleton
const messageService = new MessageService();
export default messageService;