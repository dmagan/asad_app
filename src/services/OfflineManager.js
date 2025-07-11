import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Store } from 'react-notifications-component';

class OfflineManager {
  constructor() {
    this.CACHE_VERSION = '1.0.0';
    this.CACHE_PREFIX = 'pcs_cache_';
    this.CACHE_DURATION = {
      STATIC: 7 * 24 * 60 * 60 * 1000, // 7 روز
      DYNAMIC: 1 * 60 * 60 * 1000,     // 1 ساعت
      CRYPTO: 5 * 60 * 1000,           // 5 دقیقه
      USER: 30 * 60 * 1000             // 30 دقیقه
    };
    
    this.isOnline = true;
    this.pendingRequests = new Map();
    this.cacheStats = {
      totalSize: 0,
      lastUpdate: null,
      hitCount: 0,
      missCount: 0
    };
    
    this.initializeOfflineManager();
  }

  async initializeOfflineManager() {
    try {
      // تنظیم listener برای تغییرات اتصال
      NetInfo.addEventListener(state => {
        this.handleConnectionChange(state.isConnected);
      });
      
      // بررسی اتصال اولیه
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected;
      
      // پاک‌سازی کش منقضی شده
      await this.cleanExpiredCache();
      
      // محاسبه آمار کش
      await this.calculateCacheStats();
      
      console.log('OfflineManager initialized successfully');
    } catch (error) {
      console.error('Error initializing OfflineManager:', error);
    }
  }

  handleConnectionChange(isConnected) {
    const wasOffline = !this.isOnline;
    this.isOnline = isConnected;
    
    if (wasOffline && isConnected) {
      // اتصال برقرار شد
      this.onConnectionRestored();
    } else if (!wasOffline && !isConnected) {
      // اتصال قطع شد
      this.onConnectionLost();
    }
  }

  async onConnectionRestored() {
    console.log('🟢 اتصال اینترنت برقرار شد');
    
    // اجرای درخواست‌های معلق
    await this.processPendingRequests();
    
    // به‌روزرسانی خاموش کش
    await this.backgroundCacheUpdate();
    
    // نمایش پیام (اختیاری)
    Store.addNotification({
      title: 'اتصال برقرار شد',
      message: 'اطلاعات در حال به‌روزرسانی...',
      type: 'success',
      insert: 'top',
      container: 'top-right',
      dismiss: { duration: 2000 }
    });
  }

  onConnectionLost() {
    console.log('🔴 اتصال اینترنت قطع شد');
    
    // نمایش پیام آفلاین
    Store.addNotification({
      title: 'حالت آفلاین',
      message: 'از اطلاعات ذخیره شده استفاده می‌شود',
      type: 'info',
      insert: 'top',
      container: 'top-right',
      dismiss: { duration: 3000 }
    });
  }

  // درخواست هوشمند با کش
  async smartRequest(url, options = {}) {
    const cacheKey = this.generateCacheKey(url, options);
    const cacheType = this.determineCacheType(url);
    
    try {
      // بررسی کش موجود
      const cachedData = await this.getFromCache(cacheKey);
      
      if (this.isOnline) {
        // حالت آنلاین
        try {
          const response = await fetch(url, options);
          const data = await response.json();
          
          // ذخیره در کش
          await this.saveToCache(cacheKey, data, cacheType);
          
          this.cacheStats.hitCount++;
          return { data, fromCache: false };
        } catch (error) {
          // اگر درخواست شکست خورد، از کش استفاده کن
          if (cachedData) {
            console.log('⚠️ درخواست شکست خورد، از کش استفاده می‌شود');
            return { data: cachedData.data, fromCache: true };
          }
          throw error;
        }
      } else {
        // حالت آفلاین
        if (cachedData) {
          console.log('📱 حالت آفلاین: از کش استفاده می‌شود');
          this.cacheStats.hitCount++;
          return { data: cachedData.data, fromCache: true };
        } else {
          // اضافه کردن به لیست معلق
          this.addToPendingRequests(url, options);
          this.cacheStats.missCount++;
          throw new Error('اتصال اینترنت موجود نیست و اطلاعات کش شده وجود ندارد');
        }
      }
    } catch (error) {
      console.error('SmartRequest error:', error);
      throw error;
    }
  }

  // ذخیره در کش
  async saveToCache(key, data, cacheType) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        type: cacheType,
        version: this.CACHE_VERSION,
        expires: Date.now() + this.CACHE_DURATION[cacheType.toUpperCase()]
      };
      
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      
      console.log(`✅ کش شد: ${key} (${cacheType})`);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  // دریافت از کش
  async getFromCache(key) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const cachedItem = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedItem) return null;
      
      const parsed = JSON.parse(cachedItem);
      
      // بررسی انقضا
      if (Date.now() > parsed.expires) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      console.log(`📖 از کش خوانده شد: ${key}`);
      return parsed;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  // تشخیص نوع کش
  determineCacheType(url) {
    if (url.includes('crypto') || url.includes('price')) return 'CRYPTO';
    if (url.includes('user') || url.includes('profile')) return 'USER';
    if (url.includes('course') || url.includes('lesson')) return 'STATIC';
    return 'DYNAMIC';
  }

  // تولید کلید کش
  generateCacheKey(url, options) {
    const method = options.method || 'GET';
    const body = options.body || '';
    return btoa(`${method}:${url}:${body}`).replace(/[/+=]/g, '');
  }

  // اضافه کردن به درخواست‌های معلق
  addToPendingRequests(url, options) {
    const requestId = Date.now().toString();
    this.pendingRequests.set(requestId, { url, options, timestamp: Date.now() });
  }

  // اجرای درخواست‌های معلق
  async processPendingRequests() {
    if (this.pendingRequests.size === 0) return;
    
    console.log(`🔄 اجرای ${this.pendingRequests.size} درخواست معلق...`);
    
    for (const [requestId, { url, options }] of this.pendingRequests) {
      try {
        await this.smartRequest(url, options);
        this.pendingRequests.delete(requestId);
      } catch (error) {
        console.error(`خطا در اجرای درخواست معلق: ${url}`, error);
      }
    }
  }

  // به‌روزرسانی خاموش کش
  async backgroundCacheUpdate() {
    console.log('🔄 به‌روزرسانی خاموش کش...');
    
    try {
      // لیست URL های مهم برای به‌روزرسانی
      const importantUrls = [
        'https://p30s.com/wp-json/wc/v3/products?per_page=10',
        'https://p30s.com/wp-json/wp/v2/slider?_embed',
        'https://p30s.com/wp-json/wp/v2/story_highlights?_embed',
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true'
      ];
      
      for (const url of importantUrls) {
        try {
          await this.smartRequest(url);
          await new Promise(resolve => setTimeout(resolve, 100)); // فاصله کوتاه
        } catch (error) {
          console.error(`خطا در به‌روزرسانی ${url}:`, error);
        }
      }
      
      console.log('✅ به‌روزرسانی خاموش کش کامل شد');
    } catch (error) {
      console.error('خطا در به‌روزرسانی خاموش کش:', error);
    }
  }

  // پاک‌سازی کش منقضی شده
  async cleanExpiredCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let cleanedCount = 0;
      
      for (const key of cacheKeys) {
        try {
          const item = await AsyncStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (Date.now() > parsed.expires) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          // اگر آیتم خراب باشد، حذف کن
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      }
      
      console.log(`🧹 ${cleanedCount} آیتم منقضی شده پاک شد`);
    } catch (error) {
      console.error('خطا در پاک‌سازی کش:', error);
    }
  }

  // محاسبه آمار کش
  async calculateCacheStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      let lastUpdate = 0;
      
      for (const key of cacheKeys) {
        try {
          const item = await AsyncStorage.getItem(key);
          if (item) {
            totalSize += item.length;
            const parsed = JSON.parse(item);
            if (parsed.timestamp > lastUpdate) {
              lastUpdate = parsed.timestamp;
            }
          }
        } catch (error) {
          // نادیده گرفتن خطاهای parse
        }
      }
      
      this.cacheStats.totalSize = totalSize;
      this.cacheStats.lastUpdate = lastUpdate;
      
      console.log(`📊 آمار کش: ${this.formatBytes(totalSize)}, ${cacheKeys.length} آیتم`);
    } catch (error) {
      console.error('خطا در محاسبه آمار کش:', error);
    }
  }

  // فرمت کردن اندازه فایل
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // پاک کردن کل کش
  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      await AsyncStorage.multiRemove(cacheKeys);
      
      this.cacheStats = {
        totalSize: 0,
        lastUpdate: null,
        hitCount: 0,
        missCount: 0
      };
      
      console.log('🗑️ کل کش پاک شد');
    } catch (error) {
      console.error('خطا در پاک کردن کش:', error);
    }
  }

  // دریافت آمار کش
  getCacheStats() {
    return {
      ...this.cacheStats,
      isOnline: this.isOnline,
      pendingRequests: this.pendingRequests.size,
      hitRate: this.cacheStats.hitCount / (this.cacheStats.hitCount + this.cacheStats.missCount) * 100
    };
  }

  // بررسی وضعیت اینترنت
  checkInternetConnection() {
    return this.isOnline;
  }

  // نمایش پیام خطای اینترنت
  showInternetErrorMessage(action = 'این عمل') {
    Store.addNotification({
      title: 'خطای اتصال',
      message: `برای ${action} اتصال اینترنت لازم است`,
      type: 'error',
      insert: 'top',
      container: 'top-right',
      dismiss: { duration: 4000 }
    });
  }

  // کش کردن دستی
  async preloadContent(urls) {
    console.log('🔄 شروع کش کردن دستی...');
    
    for (const url of urls) {
      try {
        await this.smartRequest(url);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`خطا در کش کردن ${url}:`, error);
      }
    }
    
    console.log('✅ کش کردن دستی کامل شد');
  }
}

// ساخت instance واحد
const offlineManager = new OfflineManager();

export default offlineManager;