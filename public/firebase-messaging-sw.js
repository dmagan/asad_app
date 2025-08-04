// firebase-messaging-sw.js - این فایل باید در root پروژه باشد

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Firebase config - از فایل google-services.json شما
const firebaseConfig = {
  apiKey: "AIzaSyAtBAJX43-u8aUnHblM3J1xuc0H8qI4qPc",
  authDomain: "pcs-notification-2fb25.firebaseapp.com",
  projectId: "pcs-notification-2fb25",
  storageBucket: "pcs-notification-2fb25.firebasestorage.app",
  messagingSenderId: "315610759144",
  appId: "1:315610759144:android:ea31a415115291b6ddae5d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification?.title || 'پیام جدید';
  const notificationOptions = {
    body: payload.notification?.body || 'پیام جدیدی دریافت شده',
    icon: '/logo192.png', // آیکون نوتیفیکیشن
    badge: '/badge-icon.png', // بج آیکون کوچک
    tag: 'pcs-notification',
    requireInteraction: true, // نوتیف تا کلیک نکنن نمیره
    vibrate: [200, 100, 200], // ویبریشن
    sound: '/notification-sound.mp3', // صدای نوتیفیکیشن
    data: {
      url: payload.data?.url || '/',
      ...payload.data
    },
    actions: [
      {
        action: 'open',
        title: 'مشاهده',
        icon: '/open-icon.png'
      },
      {
        action: 'close',
        title: 'بستن',
        icon: '/close-icon.png'
      }
    ]
  };

  // نمایش نوتیفیکیشن
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // باز کردن صفحه مورد نظر
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // اگر تب باز هست، focus کن
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // اگر تب باز نیست، تب جدید باز کن
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});