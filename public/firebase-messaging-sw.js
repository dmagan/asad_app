// firebase-messaging-sw.js
// SW_VERSION: 5  ← هر بار آپدیت کردی، این عدد را زیاد کن تا SW فورس آپدیت شود.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// کانفیگ فایربیس (نسخه Web)
const firebaseConfig = {
  apiKey: "AIzaSyAtBAJX43-u8aUnHblM3J1xuc0H8qI4qPc",
  authDomain: "notificationsfinal-10f4a.firebaseapp.com",
  projectId: "notificationsfinal-10f4a",
  storageBucket: "notificationsfinal-10f4a.firebasestorage.app",
  messagingSenderId: "315610759144",
  appId: "1:315610759144:android:ea31a415115291b6ddae5d"
};

firebase.initializeApp(firebaseConfig);

// فقط یک listener برای همه پیام‌ها
self.addEventListener('push', (event) => {
  let incoming = {};
  try {
    incoming = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Push payload parse error', e);
  }

  // هم ساختار FCM v1 (message:{}) و هم ساختار ساده رو پشتیبانی می‌کنیم
  const msg = incoming.message || incoming;
  const d = msg.data || {};
  const n = msg.notification || {};

  // اولویت: data → notification → پیش‌فرض
  const title = d.title || n.title || 'اعلان جدید';
  const body  = d.body  || n.body  || 'پیام جدیدی دریافت شد';
  const icon  = d.icon  || n.icon  || '/logo192.png';
  const badge = d.badge || '/badge-icon.png';
  const image = d.image || n.image || undefined;
  const url   = d.url   || d.click_action || n.click_action || '/';

  const options = {
    body,
    icon,
    badge,
    image,
    tag: d.tag || 'pcs-notification',
    renotify: d.renotify === 'true',
    vibrate: d.vibrate ? tryParseJSON(d.vibrate, [200, 100, 200]) : [200, 100, 200],
    data: { url, ...d }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// کلیک روی نوتیف → باز یا فوکوس کردن تب
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if (client.url && client.url.startsWith(self.location.origin)) {
        try { await client.focus(); return; } catch (e) {}
      }
    }
    if (clients.openWindow) {
      await clients.openWindow(targetUrl);
    }
  })());
});

// تابع کمکی برای parse ایمن JSON
function tryParseJSON(str, fallback) {
  try { return JSON.parse(str); } catch (e) { return fallback; }
}
