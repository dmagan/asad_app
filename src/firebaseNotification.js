import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

class FirebaseNotificationService {
  constructor() {
    this.messaging = null;
    this.vapidKey = null;
    this.initialized = false;
    this.foregroundSetup = false;
    this.onMessageUnsubscribe = null; // برای cleanup
  }

  /**
   * Public initializer: fetches config & sets up Firebase Messaging
   */
  async initialize() {
    if (this.initialized) {
      console.log('Firebase already initialized');
      return true;
    }
    return this.init();
  }

  /**
   * Internal init: calls WP REST endpoint and configures Firebase
   */
  async init() {
    try {
      // بررسی پشتیبانی از Web Push
      if (!await isSupported()) {
        console.warn('Web Push not supported in this browser');
        return false;
      }

      // fetch Web Push config from WordPress
      const response = await fetch('https://p30s.com/wp-json/pcs/v1/web-push-config');
      const data = await response.json();

      if (data.success) {
        // initialize Firebase app (فقط اگر قبلاً initialize نشده)
        const app = initializeApp(data.config);
        
        // configure messaging
        this.messaging = getMessaging(app);
        this.vapidKey = data.vapidKey;
        this.initialized = true;
        
        console.log('Firebase initialized successfully');
        return true;
      }
      return false;

    } catch (error) {
      console.error('Firebase init failed:', error);
      return false;
    }
  }

  /**
   * Request Notification permission and obtain FCM token
   * @returns {Promise<string|false|null>}
   */
  async requestPermission() {
    if (!this.messaging) {
      console.error('Firebase messaging not initialized');
      return false;
    }

    // اول چک کن permission چیه
    console.log('Current permission:', Notification.permission);

    try {
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);

      if (permission === 'granted') {
        const token = await this.getToken();
        console.log('Token received:', token);
        return token;
      }
      return false;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Retrieve the FCM token and send to server
   */
  async getToken() {
    try {
      const token = await getToken(this.messaging, { vapidKey: this.vapidKey });
      if (token) {
        await this.sendTokenToServer(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Token generation failed:', error);
      return null;
    }
  }

  /**
   * Send the FCM token to WordPress (authenticated)
   */
  async sendTokenToServer(token) {
    const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!userToken) {
      console.warn('No user token found, skipping server update');
      return;
    }

    try {
      const response = await fetch('https://p30s.com/wp-json/pcs/v1/save-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          fcm_token: token,
          platform: 'web',
          app_version: '1.0.0'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('Token saved to server successfully');
      } else {
        console.error('Failed to save token:', result);
      }
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  /**
   * Handle foreground messages - اصلاح شده برای جلوگیری از تکرار
   */
  setupForegroundMessaging() {
    if (!this.messaging) {
      console.error('Messaging not initialized for foreground setup');
      return;
    }
    
    // جلوگیری از setup مکرر
    if (this.foregroundSetup) {
      console.log('Foreground messaging already setup');
      return;
    }

    // پاک کردن listener قبلی (اگر وجود دارد)
    if (this.onMessageUnsubscribe) {
      this.onMessageUnsubscribe();
    }

    // تنظیم listener جدید
    this.onMessageUnsubscribe = onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);

      // فقط در حالت foreground نوتیفیکیشن نمایش بده
      if (document.visibilityState === 'visible') {
        this.showForegroundNotification(payload);
      }
    });

    this.foregroundSetup = true;
    console.log('Foreground messaging setup completed');
  }

  /**
   * نمایش نوتیفیکیشن در foreground با جلوگیری از تکرار
   */
  showForegroundNotification(payload) {
    if (Notification.permission !== 'granted' || !payload.notification) {
      return;
    }

    // استفاده از tag برای جلوگیری از نوتیفیکیشن مکرر
    const notificationTag = `pcs-${Date.now()}`;
    
    const notification = new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: payload.notification.icon || '/logo192.png',
      badge: '/badge-icon.png',
      tag: notificationTag,
      renotify: false, // مهم: جلوگیری از اعلان مجدد
      silent: false,
      requireInteraction: false,
      data: payload.data || {}
    });

    // کلیک handler
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // اگر URL در data وجود دارد، navigate کن
      if (payload.data?.url) {
        window.location.href = payload.data.url;
      }
    };

    // بستن خودکار بعد از 5 ثانیه
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  /**
   * پاک کردن listeners و cleanup
   */
  cleanup() {
    if (this.onMessageUnsubscribe) {
      this.onMessageUnsubscribe();
      this.onMessageUnsubscribe = null;
    }
    this.foregroundSetup = false;
    console.log('Firebase service cleaned up');
  }

  /**
   * بررسی وضعیت سرویس
   */
  getStatus() {
    return {
      initialized: this.initialized,
      foregroundSetup: this.foregroundSetup,
      hasMessaging: !!this.messaging,
      hasVapidKey: !!this.vapidKey,
      permission: Notification.permission
    };
  }
}

// Export singleton instance
export default new FirebaseNotificationService();