// PostsNotificationService.js
class PostsNotificationService {
  constructor() {
    this.listeners = [];
    this.unreadCount = 0;
    this.isActive = false;
    this.checkInterval = null;
    this.lastReadTimestamp = null;
    this.STORAGE_KEY = 'posts_last_read_timestamp';
    this.CHECK_INTERVAL = 30000; // 30 ثانیه
  }

  // شروع سرویس
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.loadLastReadTimestamp();
    this.checkForNewPosts();
    
    // تنظیم interval برای چک کردن دوره‌ای
    this.checkInterval = setInterval(() => {
      this.checkForNewPosts();
    }, this.CHECK_INTERVAL);
    
    console.log('Posts notification service started');
  }

  // توقف سرویس
  stop() {
    this.isActive = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('Posts notification service stopped');
  }

  // اضافه کردن listener
  addListener(callback) {
    this.listeners.push(callback);
  }

  // حذف listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // اطلاع‌رسانی به listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.unreadCount);
      } catch (error) {
        console.error('Error in posts notification listener:', error);
      }
    });
  }

  // بارگیری آخرین زمان خوانده شده
  loadLastReadTimestamp() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.lastReadTimestamp = parseInt(stored);
      } else {
        // اگر هیچ زمانی ذخیره نشده، زمان فعلی را به عنوان پیش‌فرض تنظیم می‌کنیم
        this.lastReadTimestamp = Date.now();
        this.saveLastReadTimestamp();
      }
    } catch (error) {
      console.error('Error loading last read timestamp for posts:', error);
      this.lastReadTimestamp = Date.now();
    }
  }

  // ذخیره آخرین زمان خوانده شده
  saveLastReadTimestamp() {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.lastReadTimestamp.toString());
    } catch (error) {
      console.error('Error saving last read timestamp for posts:', error);
    }
  }

  // علامت‌گذاری همه پست‌ها به عنوان خوانده شده
  markAllAsRead() {
    this.lastReadTimestamp = Date.now();
    this.unreadCount = 0;
    this.saveLastReadTimestamp();
    this.notifyListeners();
    console.log('All posts marked as read');
  }

  // چک کردن پست‌های جدید
  async checkForNewPosts() {
    if (!this.isActive) return;

    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        this.unreadCount = 0;
        this.notifyListeners();
        return;
      }

      // دریافت پست‌های جدید از API
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const response = await fetch(
        'https://p30s.com/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&categories=112',
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      if (!response.ok) {
        console.log('Posts API failed with status:', response.status);
        return;
      }

      const posts = await response.json();
      
      if (!Array.isArray(posts) || posts.length === 0) {
        this.unreadCount = 0;
        this.notifyListeners();
        return;
      }

      // شمارش پست‌های جدید
      const newPostsCount = posts.filter(post => {
        const postDate = new Date(post.date).getTime();
        return postDate > this.lastReadTimestamp;
      }).length;

      // اگر تعداد پست‌های جدید تغییر کرده باشد، listeners را مطلع کنیم
      if (newPostsCount !== this.unreadCount) {
        this.unreadCount = newPostsCount;
        this.notifyListeners();
      }

    } catch (error) {
      console.error('Error checking for new posts:', error);
    }
  }

  // دریافت تعداد پست‌های خوانده نشده
  getUnreadCount() {
    return this.unreadCount;
  }

  // بررسی اینکه آیا سرویس فعال است
  isRunning() {
    return this.isActive;
  }
}

// ایجاد و export کردن instance
const postsNotificationService = new PostsNotificationService();
export default postsNotificationService;