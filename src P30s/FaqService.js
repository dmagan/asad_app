// FaqService.js
// سرویس مدیریت سوالات متداول با قابلیت کش‌گذاری و به‌روزرسانی روزانه

class FaqService {
    constructor() {
      this.cachedFaqs = [];          // کش سوالات
      this.syncIntervalId = null;    // شناسه اینتروال برای همگام‌سازی
      this.lastSyncTime = null;      // زمان آخرین همگام‌سازی
      this.isSyncing = false;        // وضعیت همگام‌سازی فعلی
      this.listeners = [];           // شنوندگان برای تغییرات
      this.ONE_DAY = 24 * 60 * 60 * 1000; // 24 ساعت به میلی‌ثانیه
    }
  
    // آغاز سرویس و همگام‌سازی اولیه
    async start() {
      try {
        // بازیابی اطلاعات از localStorage اگر موجود باشد
        this._loadFromStorage();
  
        // شروع همگام‌سازی طبق شرایط
        const shouldSync = !this.lastSyncTime || 
                          (new Date() - new Date(this.lastSyncTime) > this.ONE_DAY);
        
        if (shouldSync) {
          await this.syncFaqs();
        } else if (this.cachedFaqs.length === 0) {
          // اگر کش خالی است ولی زمان زیادی از آخرین همگام‌سازی نگذشته
          await this.syncFaqs();
        }
  
        // شروع همگام‌سازی دوره‌ای (هر 24 ساعت)
        this._startSyncInterval();
        return true;
      } catch (error) {
        console.error('Error starting FAQ service:', error);
        // اگر هیچ داده‌ای نداریم، داده‌های پیش‌فرض را استفاده کنیم
        if (this.cachedFaqs.length === 0) {
          this._setDefaultFaqs();
        }
        return this.cachedFaqs.length > 0;
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
      this.listeners.push(callback);
      // اطلاع‌رسانی وضعیت فعلی به شنونده جدید
      callback({
        faqs: this.getFaqs(),
        isSyncing: this.isSyncing,
        lastSyncTime: this.lastSyncTime
      });
    }
  
    // حذف شنونده
    removeListener(callback) {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    }
  
    // دریافت سوالات متداول از کش
    getFaqs() {
      return this.cachedFaqs;
    }
  
    // همگام‌سازی سوالات متداول
    async syncFaqs() {
      if (this.isSyncing) return;
      try {
        this.isSyncing = true;
        this._notifyListeners();
        
        const newFaqs = await this._fetchFaqsFromServer();
        if (newFaqs && newFaqs.length > 0) {
          this.cachedFaqs = newFaqs;
        } else if (this.cachedFaqs.length === 0) {
          // اگر کش خالی است و دریافت داده جدید هم ناموفق بود
          this._setDefaultFaqs();
        }
        
        this.lastSyncTime = new Date();
        this._saveToStorage();
      } catch (error) {
        console.error('Error syncing FAQs:', error);
        // در صورت خطا، اگر کش خالی است، از داده‌های پیش‌فرض استفاده کنیم
        if (this.cachedFaqs.length === 0) {
          this._setDefaultFaqs();
        }
      } finally {
        this.isSyncing = false;
        this._notifyListeners();
      }
    }
  
    // توابع خصوصی (private)
    // --------------------------------------
  
    // تنظیم سوالات پیش‌فرض در صورت عدم دسترسی به سرور
    _setDefaultFaqs() {
      this.cachedFaqs = [
        {
          id: 1,
          question: "چگونه می‌توانم در سایت ثبت‌نام کنم؟",
          answer: "برای ثبت‌نام، روی دکمه پروفایل در منوی پایین کلیک کنید و گزینه ثبت‌نام را انتخاب کنید. سپس اطلاعات خواسته شده را تکمیل نمایید.",
          order: 1
        },
        {
          id: 2,
          question: "نحوه خرید اشتراک VIP چگونه است؟",
          answer: "برای خرید اشتراک VIP، ابتدا وارد حساب کاربری خود شوید. سپس از صفحه محصولات، اشتراک مورد نظر خود را انتخاب کرده و مراحل پرداخت را تکمیل کنید.",
          order: 2
        },
        {
          id: 3,
          question: "چگونه می‌توانم به سیگنال‌های VIP دسترسی داشته باشم؟",
          answer: "برای دسترسی به سیگنال‌های VIP نیاز به خرید اشتراک VIP دارید. پس از خرید اشتراک، بلافاصله به تمامی سیگنال‌ها دسترسی خواهید داشت.",
          order: 3
        },
        {
          id: 4,
          question: "آیا امکان لغو اشتراک وجود دارد؟",
          answer: "بله، شما می‌توانید در هر زمان از طریق پنل کاربری خود اشتراک خود را لغو کنید. البته توجه داشته باشید که مبلغ پرداختی برای دوره جاری قابل برگشت نیست.",
          order: 4
        },
        {
          id: 5,
          question: "تیم پشتیبانی چه ساعاتی پاسخگو است؟",
          answer: "تیم پشتیبانی ما در روزهای کاری از ساعت 9 صبح تا 6 عصر آماده پاسخگویی به سؤالات شما است. در ساعات غیرکاری می‌توانید پیام خود را ثبت کنید تا در اولین فرصت به آن رسیدگی شود.",
          order: 5
        }
      ];
      this._saveToStorage();
    }
  
    // بازیابی کش از localStorage
    _loadFromStorage() {
      try {
        const storedData = localStorage.getItem('faq_cache');
        if (storedData) {
          const data = JSON.parse(storedData);
          this.cachedFaqs = data.faqs || [];
          this.lastSyncTime = data.lastSyncTime ? new Date(data.lastSyncTime) : null;
        }
      } catch (error) {
        console.error('Error loading FAQs from storage:', error);
      }
    }
  
    // ذخیره کش در localStorage
    _saveToStorage() {
      try {
        localStorage.setItem('faq_cache', JSON.stringify({
          faqs: this.cachedFaqs,
          lastSyncTime: this.lastSyncTime
        }));
      } catch (error) {
        console.error('Error saving FAQs to storage:', error);
      }
    }
  
    // اطلاع‌رسانی به تمام شنوندگان
    _notifyListeners() {
      const data = {
        faqs: this.getFaqs(),
        isSyncing: this.isSyncing,
        lastSyncTime: this.lastSyncTime
      };
      
      this.listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error notifying listener:', error);
        }
      });
    }
  
    // دریافت سوالات متداول از سرور
    async _fetchFaqsFromServer() {
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const response = await fetch('https://p30s.com/wp-json/wp/v2/faqs?per_page=50', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('خطا در دریافت سوالات متداول');
      }
      
      const data = await response.json();
      
      // تبدیل داده‌های دریافتی به فرمت مورد نیاز
      const formattedFaqs = data.map(item => ({
        id: item.id,
        question: item.title.rendered,
        answer: item.content.rendered.replace(/<\/?[^>]+(>|$)/g, ""), // حذف تگ‌های HTML
        order: item.meta?.faq_order || 0,
        rawAnswer: item.content.rendered // نگهداری محتوای HTML برای نمایش غنی‌تر
      }));
      
      // مرتب‌سازی بر اساس فیلد order
      formattedFaqs.sort((a, b) => a.order - b.order);
      
      return formattedFaqs;
    }
  
    // شروع زمان‌بندی برای همگام‌سازی دوره‌ای (هر 24 ساعت)
    _startSyncInterval() {
      // متوقف کردن اینتروال قبلی اگر وجود دارد
      if (this.syncIntervalId) {
        clearInterval(this.syncIntervalId);
      }
      
      this.syncIntervalId = setInterval(() => {
        this.syncFaqs();
      }, this.ONE_DAY); // هر 24 ساعت
    }
  }
  
  // صادر کردن یک نمونه از کلاس به صورت singleton
  const faqService = new FaqService();
  export default faqService;