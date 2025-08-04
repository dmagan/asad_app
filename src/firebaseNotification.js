import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

class FirebaseNotificationService {
  constructor() {
    this.messaging = null;
    this.vapidKey = null;
  }

  /**
   * Public initializer: fetches config & sets up Firebase Messaging
   */
  async initialize() {
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
        // initialize Firebase app
        const app = initializeApp(data.config);
        // configure messaging
        this.messaging = getMessaging(app);
        this.vapidKey = data.vapidKey;
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
    if (!userToken) return;

    try {
      await fetch('https://p30s.com/wp-json/pcs/v1/save-fcm-token', {
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
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  /**
   * Handle foreground messages and show notifications
   */
setupForegroundMessaging() {
  if (!this.messaging) {
    console.error('Messaging not initialized for foreground setup');
    return;
  }

  onMessage(this.messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // نوتیف نمایش بده
    if (Notification.permission === 'granted' && payload.notification) {
      const notification = new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/logo192.png',
        badge: '/badge-icon.png',
        tag: 'pcs-notification'
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  });
}
}

export default new FirebaseNotificationService();