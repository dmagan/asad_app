class VIPNotificationService {
  constructor() {
    this.listeners = [];
    this.isPolling = false;
    this.pollingInterval = null;
    this.lastReadTimestamp = null;
    this.unreadCount = 0;
    this.cachedPosts = [];
  }
  
  // شروع سرویس با بررسی پیام‌ها در پس‌زمینه
  async start() {
    if (this.isPolling) return true;
    
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) return false;
    
    // بررسی وضعیت VIP بودن کاربر
    const hasVIP = await this.checkVIPStatus(token);
    if (!hasVIP) {
      this.unreadCount = 0;
      this.notifyListeners();
      return false;
    }
    
    // خواندن آخرین زمان خوانده شده از localStorage
    this.lastReadTimestamp = localStorage.getItem('lastReadVIPTimestamp') || null;
    
    // بررسی فوری پیام‌ها در زمان شروع
    this.isPolling = true;
    this.checkForNewPosts();
    
    // شروع polling هر 15 دقیقه
    this.pollingInterval = setInterval(() => {
      this.checkForNewPosts();
    }, 900000); // 900000 میلی‌ثانیه = 15 دقیقه
    
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
  
  // بررسی پیام‌های جدید از سرور
  async checkForNewPosts() {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) return;
      
      // بررسی وضعیت VIP بودن کاربر
      const hasVIP = await this.checkVIPStatus(token);
      if (!hasVIP) {
        this.unreadCount = 0;
        this.notifyListeners();
        return;
      }
      
      // دریافت پست‌های کانال VIP - دریافت 10 پست آخر برای محاسبه دقیق‌تر
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const response = await fetch(
        'https://p30s.com/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&categories=109',
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      if (!response.ok) {
        console.log('VIP posts API failed with status:', response.status);
        return;
      }
      
      const posts = await response.json();
      
      if (posts.length === 0) return;
      
      // ذخیره پست‌ها در کش
      this.cachedPosts = posts;
      
      // آخرین زمان خوانده شده
      const lastReadTime = this.lastReadTimestamp ? new Date(this.lastReadTimestamp) : null;
      
      if (lastReadTime) {
        // محاسبه تعداد پست‌های خوانده نشده
        const unreadPosts = posts.filter(post => {
          const postDate = new Date(post.date);
          return postDate > lastReadTime;
        });
        
        this.unreadCount = unreadPosts.length;
      } else {
        // اگر تا به حال هیچ پستی خوانده نشده، همه را ناخوانده در نظر می‌گیریم
        this.unreadCount = posts.length;
      }
      
      // اطلاع‌رسانی به listeners
      this.notifyListeners();
    } catch (error) {
      console.error('Error checking for new VIP posts:', error);
    }
  }
  
  // بررسی وضعیت VIP بودن کاربر
  async checkVIPStatus(token) {
    try {
      // ابتدا در localStorage بررسی می‌کنیم
      const purchasedProductsStr = localStorage.getItem('purchasedProducts');
      
      if (purchasedProductsStr) {
        try {
          const purchasedProducts = JSON.parse(purchasedProductsStr);
          
          // بررسی برای یافتن اشتراک فعال VIP
          const subscriptionProduct = purchasedProducts.find(p => 
            (p.isVIP === true || 
             (p.title && typeof p.title === 'string' && 
              (p.title.includes('VIP') || p.title.includes('اشتراک')))
            ) && 
            p.status === 'active'
          );
          
          if (subscriptionProduct) {
            return true;
          }
        } catch (error) {
          console.error('Error parsing purchasedProducts:', error);
        }
      }
      
      // اگر در localStorage نبود، از API بررسی می‌کنیم
      const response = await fetch('https://p30s.com/wp-json/pcs/v1/check-vip-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error checking VIP status');
      }
      
      const data = await response.json();
      return data.success && data.has_vip;
      
    } catch (error) {
      console.error('Error checking VIP status:', error);
      return false;
    }
  }
  
  // علامت‌گذاری تمام پیام‌ها به عنوان خوانده شده
  markAllAsRead() {
    // زمان فعلی را ذخیره می‌کنیم
    const now = new Date().toISOString();
    this.lastReadTimestamp = now;
    localStorage.setItem('lastReadVIPTimestamp', now);
    
    // تعداد ناخوانده‌ها را صفر می‌کنیم
    this.unreadCount = 0;
    this.notifyListeners();
  }
  
  // دریافت تعداد پیام‌های خوانده نشده
  getUnreadCount() {
    return this.unreadCount;
  }
  
  // دریافت پست‌های کش شده
  getCachedPosts() {
    return this.cachedPosts;
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
const vipNotificationService = new VIPNotificationService();

export default vipNotificationService;