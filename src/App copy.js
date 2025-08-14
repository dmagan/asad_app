import { X, Bell } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import CourseApp from './CourseApp-support.js';
import AsadPage from './AsadPage';
import Chat from './vipChanel';
import StoriesPage from './components/StoriesPage';
import ProfilePage from './ProfilePage';
import LoginPage from './LoginPage';
import OrientationLock from './OrientationLock';
import MentorPage from './MentorPage';
import SupportPage from './SupportPage';
import DexPage from './dex'; 
import CustomLoading from './CustomLoading';
import FaqPage from './faq'; 
import VIPPage from './VIP-Service-Page';  
import ZeroTo100ServicePage from './0to100-Service-Page';
import DexServicesPage from './Dex-Services-Page';
import SignalStreamServicePage from './SignalStream-Service-Page';
import ProductsPage from './ProductsPage';
import PageTransition from './components/PageTransition';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import 'react-notifications-component/dist/theme.css'
import 'animate.css/animate.min.css'
import { Navigate } from 'react-router-dom';
import SignalStreamChannel from './chanel-signal-stream';
import PublicChannel from './chanel-public';
import PostsChannel from './chanel-posts';
import { Toaster } from 'react-hot-toast';
import IOSInstallPrompt from './IOSInstallPrompt';
import { shouldShowInstallPrompt } from './detectIOS';
import DesktopWarning from './DesktopWarning';
import ZeroTo100 from './0to100';
import supportNotificationService from './SupportNotificationService';
import TradeProPage from './TradePro-Service-Page';
import TradeProCoursePage from './tradepro';
import CryptoTermsPage from './CryptoTermsPage';
import ErrorBoundary from './ErrorBoundary';
import NewSupportPage from './NewSupportPage';
import newSupportNotificationService from './NewSupportNotificationService';
import MimCoinChannel from './MimCoinChannel';
import MimCoinServicesPage from './MimCoin-Services-Page';
import BuyPage from './BuyPage';
import firebaseNotificationService from './firebaseNotification';
import NotificationPromptCard from './NotificationPromptCard';








// تشخیص محیط React Native
const isReactNative = typeof window !== 'undefined' && window.ReactNativeWebView;
// تابع کمکی برای ارسال پیام به React Native
const sendMessageToNative = (message) => {
  if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
      console.log('پیام به اپ نیتیو ارسال شد:', message);
    } catch (error) {
      console.error('خطا در ارسال پیام به اپ نیتیو:', error);
    }
  }
};

// دسترسی سراسری به تابع
window.sendMessageToNative = sendMessageToNative;


// بازنویسی کامل متد چک کردن پیام‌های جدید
supportNotificationService.checkForNewMessages = async function() {
  try {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) return;
    
    // استفاده از API صحیح wpas-api به جای awesome-support
    const ticketsResponse = await fetch('https://p30s.com/wp-json/wpas-api/v1/tickets', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!ticketsResponse.ok) {
      // اگر API اصلی کار نکرد، ادامه نده
      console.log('Tickets API failed with status:', ticketsResponse.status);
      return;
    }
    
    const tickets = await ticketsResponse.json();
    
    // بررسی تیکت‌ها برای پیام‌های ادمین
    let adminMessages = [];
    
    // چک کردن هر تیکت و پاسخ‌های آن
    for (const ticket of tickets) {
      try {
        // دریافت پاسخ‌های هر تیکت
        const repliesResponse = await fetch(`https://p30s.com/wp-json/wpas-api/v1/tickets/${ticket.id}/replies`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (repliesResponse.ok) {
          const replies = await repliesResponse.json();
          // فیلتر کردن پاسخ‌های ادمین
          const agentReplies = replies.filter(reply => 
            reply.author === 1 || 
            reply.author_name === 'admin' || 
            reply.author_name === 'support'
          );
          
          adminMessages = [...adminMessages, ...agentReplies];
        }
      } catch (err) {
        // خطای یک تیکت را نادیده بگیر و به بقیه ادامه بده
        continue;
      }
    }
    
    if (adminMessages.length === 0) return;
    
    // مرتب‌سازی بر اساس تاریخ
    adminMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // آخرین پیام ادمین
    const latestAdminMessage = adminMessages[0];
    
    // بررسی آیا پیام‌های خوانده نشده داریم
    if (!this.lastReadMessageId || parseInt(this.lastReadMessageId) < parseInt(latestAdminMessage.id)) {
      // محاسبه تعداد پیام‌های خوانده نشده
      const unreadMessages = adminMessages.filter(msg => 
        !this.lastReadMessageId || parseInt(msg.id) > parseInt(this.lastReadMessageId)
      );
      
      this.unreadCount = unreadMessages.length;
      
      // اطلاع‌رسانی به listeners
      this.notifyListeners();
    }
  } catch (error) {
    console.error('Error checking for new support messages:', error);
  }
};

// تعریف تابع درخواست با توکن
window.authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  
  if (!token) {
    // اگر توکن وجود نداشت، به صفحه لاگین هدایت کنیم
    window.location.href = '/login';
    return null;
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // اگر توکن منقضی شده باشد، تلاش برای تمدید خودکار
      if (localStorage.getItem('userPassword')) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        console.log('توکن نامعتبر است، در حال تمدید خودکار در authenticatedFetch...');
        
        const loginResponse = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: userInfo.user_email,
            password: localStorage.getItem('userPassword')
          })
        });
        
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          if (data.token) {
            // ذخیره توکن جدید
            if (localStorage.getItem('userToken')) {
              localStorage.setItem('userToken', data.token);
              localStorage.setItem('userInfo', JSON.stringify(data));
              localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
              localStorage.setItem('tokenExpiration', (new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toString());
            } else {
              sessionStorage.setItem('userToken', data.token);
              sessionStorage.setItem('userInfo', JSON.stringify(data));
              sessionStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
            }
            
            console.log('توکن با موفقیت در authenticatedFetch تمدید شد');
            
            // تلاش مجدد درخواست با توکن جدید
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${data.token}`
              }
            });
          }
        }
      }
      
      // اگر تمدید توکن موفق نبود، کاربر را به صفحه لاگین هدایت کنیم
      window.location.href = '/login';
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('خطا در ارسال درخواست:', error);
    throw error;
  }
};

// این کامپوننت برای استفاده از useNavigate ایجاد شده است
function AppRoutes({
  isDarkMode, 
  setIsDarkMode,
  products,
  cryptoPrices,
  stories,
  loading,
  sliders,
  isLoggedIn,
  handleLogout,
  setIsLoggedIn,
  unreadSupportMessages,
  setUnreadSupportMessages
}) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={
  <CourseApp 
    isDarkMode={isDarkMode} 
    setIsDarkMode={setIsDarkMode} 
    products={products} 
    cryptoPrices={cryptoPrices} 
    stories={stories} 
    loading={loading} 
    sliders={sliders}
    isLoggedIn={isLoggedIn}
    onLogout={handleLogout}
    unreadSupportMessages={unreadSupportMessages}
    setUnreadSupportMessages={setUnreadSupportMessages}
  />
} />

<Route path="/buy" element={
  <BuyPage 
    isDarkMode={isDarkMode}
  />
} />
      
<Route path="/new-support" element={
  isLoggedIn ? (
    <>
      <CourseApp 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        products={products} 
        cryptoPrices={cryptoPrices} 
        stories={stories} 
        loading={loading} 
        sliders={sliders}
        isLoggedIn={isLoggedIn}    
        onLogout={handleLogout}
        unreadSupportMessages={unreadSupportMessages}
        setUnreadSupportMessages={setUnreadSupportMessages}
      />
      <NewSupportPage 
        isDarkMode={isDarkMode} 
      />
    </>
  ) : (
    <>
      <CourseApp 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        products={products} 
        cryptoPrices={cryptoPrices} 
        stories={stories} 
        loading={loading} 
        sliders={sliders}
        isLoggedIn={isLoggedIn}    
        onLogout={handleLogout}
        unreadSupportMessages={unreadSupportMessages}
        setUnreadSupportMessages={setUnreadSupportMessages}
      />
      <LoginPage 
        isDarkMode={isDarkMode} 
        setIsLoggedIn={setIsLoggedIn} 
      />
    </>
  )
} />

<Route path="/mimcoin" element={<MimCoinChannel isDarkMode={isDarkMode} />} />







<Route path="/tradepro" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      unreadSupportMessages={unreadSupportMessages}
      setUnreadSupportMessages={setUnreadSupportMessages}
    />
    <TradeProPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />




<Route
  path="/dex-terms"
  element={<CryptoTermsPage isDarkMode={isDarkMode} onBack={() => navigate(-1)} />}
/>

<Route path="/tradepro-course" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      unreadSupportMessages={unreadSupportMessages}      
      setUnreadSupportMessages={setUnreadSupportMessages}
    />
    <TradeProCoursePage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />

      <Route path="/asad" element={<AsadPage isDarkMode={isDarkMode} />} />

      <Route path="/chat" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
        unreadSupportMessages={unreadSupportMessages}       
      setUnreadSupportMessages={setUnreadSupportMessages}  
    />
    <Chat
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />

<Route path="/chanel-posts" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
    />
    <PostsChannel 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />



      <Route path="/chanel-signal-stream" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
    />
    <SignalStreamChannel 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />

      <Route path="/chanel-public" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
    />
    <PublicChannel 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />

      <Route path="/vip" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}    
      onLogout={handleLogout}    
      unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages} 
    />
    <VIPPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />




      <Route path="/stories/:storyId" element={<StoriesPage isDarkMode={isDarkMode} stories={stories} />} />
      
      <Route path="/login" element={
        isLoggedIn ? (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}    
              onLogout={handleLogout}    
              unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages} 
            />

            {/*
            
            <ProfilePage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn}
              onLogout={handleLogout}
            />

            */}
          </>
        ) : (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}    
              onLogout={handleLogout}  
              unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}   
            />
            <LoginPage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn} 
            />
          </>
        )
      } />
      
      <Route path="/mentor" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}  
            onLogout={handleLogout}     
            unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
          />
          <MentorPage isDarkMode={isDarkMode} />
        </>
      } />
      
      <Route path="/products" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}    
            onLogout={handleLogout}     
            unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
          />
          <ProductsPage 
            isDarkMode={isDarkMode} 
          />
        </>
      } />
      
      <Route path="/faq" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}  
            onLogout={handleLogout}     
            unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
          />
          <PageTransition>
            <FaqPage isDarkMode={isDarkMode} />
          </PageTransition>
        </>
      } />
      

      <Route path="/dex" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
    />
    <DexPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />



      <Route path="/support" element={
        isLoggedIn ? (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}    
              onLogout={handleLogout}     
              unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
            />
            <SupportPage 
              isDarkMode={isDarkMode} 
            />
          </>
        ) : (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}    
              onLogout={handleLogout}     
              unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
            />
            <LoginPage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn} 
            />
          </>
        )
      } />
      
      <Route path="/profile" element={
        isLoggedIn ? (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
            />
            <ProfilePage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn}
              onLogout={handleLogout}
            />
          </>
        ) : (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
            />
            <LoginPage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn} 
            />
          </>
        )
      } />

      {/* مسیرهای جدید برای صفحات خدمات (برای لینک‌های اسلایدر) */}
      <Route path="/dex-services" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}    
      onLogout={handleLogout}     
      unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
    />
    <DexServicesPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => {
        navigate('/', { replace: true });
      }}
    />
  </>
} />

      <Route path="/0to100-services" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}    
            onLogout={handleLogout}     
            unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
          />
          <ZeroTo100ServicePage 
            isDarkMode={isDarkMode}
            isOpen={true}
            onClose={() => navigate(-1)}
          />
        </>
      } />

<Route path="/0to100" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages}
    />
    <ZeroTo100
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate('/')}
    />
  </>
} />
      

<Route path="/vip-services" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}    
      onLogout={handleLogout}    
      unreadSupportMessages={unreadSupportMessages}
setUnreadSupportMessages={setUnreadSupportMessages} 
    />
    <VIPPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => {
        // به جای navigate(-1) باید به صفحه اصلی برگردیم و تاریخچه را جایگزین کنیم
        navigate('/', { replace: true });
      }}
    />
  </>
} />

       <Route path="/signal-stream" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}    
            onLogout={handleLogout}  
            unreadSupportMessages={unreadSupportMessages}
            setUnreadSupportMessages={setUnreadSupportMessages}   
          />
          <SignalStreamServicePage 
            isDarkMode={isDarkMode}
            isOpen={true}
            onClose={() => navigate(-1)}
          />
        </>
      } />

      {/* اضافه کردن Route جدید میم کوین */}
      <Route path="/mimcoin-services" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}    
            onLogout={handleLogout}     
            unreadSupportMessages={unreadSupportMessages}
            setUnreadSupportMessages={setUnreadSupportMessages}
          />
          <MimCoinServicesPage 
            isDarkMode={isDarkMode}
            isOpen={true}
            onClose={() => navigate(-1)}
          />
        </>
      } />
    </Routes>
  );
}

const App = () => {
  // All states
  const [showDesktopWarning, setShowDesktopWarning] = useState(true);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [products, setProducts] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadSupportMessages, setUnreadSupportMessages] = useState(0);
  const [unreadNewSupportMessages, setUnreadNewSupportMessages] = useState(0);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    const [firebaseInitialized, setFirebaseInitialized] = useState(false);
    const [showIOSUpdatePrompt, setShowIOSUpdatePrompt] = useState(false);


// -------- Firebase Push Initialization --------
useEffect(() => {
  const setupFirebasePush = async () => {
    try {
      console.log('Starting Firebase Push setup...');
      
      // اول service worker رو register کن و منتظر بمان
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // مطمئن شو که service worker آماده است
        await navigator.serviceWorker.ready;
        console.log('Service Worker is ready');
      }
      
      // بعد Firebase رو initialize کن
      const initialized = await firebaseNotificationService.initialize();
      if (!initialized) {
        console.error('Firebase initialization failed');
        return;
      }
      
      console.log('Firebase initialized successfully');
      setFirebaseInitialized(true); // این خط را اضافه کنید
      
      
    } catch (err) {
      console.error('Firebase Push setup error:', err);
    }
  };
  
  setupFirebasePush();
}, []);

useEffect(() => {
  // فقط یک بار در لود اولیه چک می‌کنیم
  const checkIOSPrompt = () => {
    if (shouldShowInstallPrompt()) {
      // یک تاخیر کوتاه برای اطمینان از لود شدن صفحه قبل از نمایش راهنما
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
      }, 2000);
      
      return timer;
    }
    return null;
  };
  
  const timer = checkIOSPrompt();
  
  return () => {
    if (timer) clearTimeout(timer);
  };
}, []);


// این کد را در داخل useEffect اول فایل App.js قرار دهید
useEffect(() => {
  const checkTokenValidity = async () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    
    try {
      const response = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        // توکن نامعتبر است، تلاش برای تمدید خودکار
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        const userPassword = localStorage.getItem('userPassword');
        
        if (userInfo.user_email && userPassword) {
          // تلاش برای لاگین مجدد با اطلاعات ذخیره شده
          const loginResponse = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: userInfo.user_email,
              password: userPassword
            })
          });
          
          if (loginResponse.ok) {
            const data = await loginResponse.json();
            if (data.token) {
              // ذخیره توکن جدید
              if (localStorage.getItem('userToken')) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data));
                localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
              } else {
                sessionStorage.setItem('userToken', data.token);
                sessionStorage.setItem('userInfo', JSON.stringify(data));
                sessionStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
              }
              setIsLoggedIn(true);
              return;
            }
          }
        }
        
        // اگر تمدید توکن موفق نبود، کاربر را خارج کنیم
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userInfo');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('خطا در بررسی اعتبار توکن:', error);
    }
  };
  
  checkTokenValidity();
}, []);


useEffect(() => {
  if (isLoggedIn) {
    // راه‌اندازی سرویس نوتیفیکیشن جدید
    newSupportNotificationService.start();
    newSupportNotificationService.addListener(count => {
      setUnreadNewSupportMessages(count);
    });
    
    return () => {
      newSupportNotificationService.removeListener(setUnreadNewSupportMessages);
      newSupportNotificationService.stop();
    };
  } else {
    setUnreadNewSupportMessages(0);
  }
}, [isLoggedIn]);




useEffect(() => {
  if (isLoggedIn) {
    supportNotificationService.start();
    supportNotificationService.addListener(count => {
      setUnreadSupportMessages(count);
    });
    
    return () => {
      supportNotificationService.removeListener(setUnreadSupportMessages);
      supportNotificationService.stop();
    };
  } else {
    setUnreadSupportMessages(0); // پاک کردن تعداد پیام‌های ناخوانده در صورت خروج کاربر
  }
}, [isLoggedIn]);


  useEffect(() => {
    //console.log('Login state changed:', isLoggedIn);
  }, [isLoggedIn]);

// بررسی و بارگیری مجدد اشتراک‌های کاربر پس از ورود
useEffect(() => {
  if (isLoggedIn) {
    // اضافه کردن کد تمدید توکن
    const setupTokenRefreshOnStartup = async () => {
      const token = localStorage.getItem('userToken');
      const tokenExpiration = parseInt(localStorage.getItem('tokenExpiration') || '0');
      const now = new Date().getTime();
      const userPassword = localStorage.getItem('userPassword');
      
      // اگر توکن وجود دارد و "مرا به خاطر بسپار" فعال بوده (پسورد ذخیره شده باشد)
      if (token && userPassword) {
        // بررسی اینکه آیا توکن نزدیک به انقضا است یا منقضی شده
        if (now > tokenExpiration - 7 * 24 * 60 * 60 * 1000) { // اگر کمتر از 7 روز مانده
          try {
            // ابتدا بررسی کنیم که آیا توکن فعلی هنوز معتبر است
            const validationResponse = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token/validate', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            // اگر توکن نامعتبر است یا کمتر از 1 روز به انقضای آن مانده، تمدید کنیم
            if (!validationResponse.ok || now > tokenExpiration - 1 * 24 * 60 * 60 * 1000) {
              const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
              
              // تمدید توکن با لاگین مجدد
              if (userInfo.user_email) {
                console.log('در حال تمدید خودکار توکن در استارت اپ...');
                const response = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    username: userInfo.user_email,
                    password: userPassword
                  })
                });
                
                if (response.ok) {
                  const data = await response.json();
                  if (data.token) {
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    localStorage.setItem('lastTokenRefresh', now.toString());
                    localStorage.setItem('tokenExpiration', (now + 30 * 24 * 60 * 60 * 1000).toString());
                    console.log('توکن با موفقیت در استارت اپ تمدید شد');
                  }
                }
              }
            }
          } catch (error) {
            console.error('خطا در بررسی/تمدید توکن در استارت اپ:', error);
          }
        }
      }
    };

    // فراخوانی تابع تمدید توکن
    setupTokenRefreshOnStartup();
    
    // کد قبلی شما برای بارگیری اشتراک‌های کاربر
    const reloadUserSubscriptions = async () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) return;
        
        console.log("Reloading user subscriptions...");
        const response = await fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('خطا در دریافت اشتراک‌ها');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.purchases)) {
          console.log("Retrieved subscriptions:", data.purchases);
          localStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          localStorage.setItem('lastProductCheck', new Date().getTime().toString());
          
          // همچنین در sessionStorage ذخیره می‌کنیم
          sessionStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          sessionStorage.setItem('lastProductCheck', new Date().getTime().toString());
          
          console.log("Subscriptions saved to localStorage and sessionStorage");
        }
      } catch (error) {
        console.error('Error reloading subscriptions:', error);
      }
    };
    
    reloadUserSubscriptions();
  }
}, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userInfo');  
    setIsLoggedIn(false);
    // ارسال پیام به اپ نیتیو
  sendMessageToNative({
    type: 'USER_LOGGED_OUT'
  });
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (token) {
      setIsLoggedIn(true);
     // console.log('User is logged in:', token); 
    } else {
      setIsLoggedIn(false);
     // console.log('User is not logged in'); 
    }
  }, []);
  
  // بررسی دوره‌ای خریدهای کاربر
useEffect(() => {
  // فقط زمانی که کاربر لاگین است اجرا شود
  if (!isLoggedIn) return;
  
  // بررسی زمان آخرین چک
  const lastCheck = localStorage.getItem('lastProductCheck');
  const now = new Date().getTime();
  
  // اگر آخرین چک بیش از یک ساعت پیش بوده یا اصلاً انجام نشده، دوباره چک کنیم
  if (!lastCheck || (now - parseInt(lastCheck)) > 3600000) { // 3600000 ms = 1 hour
    const checkPurchases = async () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) return;
        
        const response = await fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('خطا در دریافت خریدها');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.purchases)) {
          localStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          localStorage.setItem('lastProductCheck', now.toString());
          //console.log('خریدها به روز شدند');
        }
      } catch (error) {
        console.error('Error checking purchases:', error);
      }
    };
    
    checkPurchases();
  }
}, [isLoggedIn]);


// نمایش کارت نوتیفیکیشن بعد از لاگین
useEffect(() => {
  if (isLoggedIn && firebaseInitialized) {
    // بررسی iOS و A2HS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isA2HS = window.navigator.standalone === true;
    
    if (isIOS && isA2HS) {
      // بررسی ورژن iOS
      let iosVersionSupported = false;
      let currentVersion = '';
      
      const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
      if (match) {
        const major = parseInt(match[1]);
        const minor = parseInt(match[2]);
        currentVersion = `${major}.${minor}`;
        iosVersionSupported = major > 16 || (major === 16 && minor >= 4);
      }
      
      const timer = setTimeout(() => {
        // اگر ورژن کمتر از 16.4 است
        if (!iosVersionSupported) {
          setShowIOSUpdatePrompt(true);
          return;
        }
        
        // اگر ورژن 16.4+ است - منطق نوتیفیکیشن عادی
        const notificationStatus = Notification.permission;
        const isDismissed = localStorage.getItem('notificationDismissed');
        const deniedCount = parseInt(localStorage.getItem('notificationDeniedCount') || '0');
        const lastDeniedTime = parseInt(localStorage.getItem('lastNotificationDenied') || '0');
        const now = Date.now();
        
        let shouldShow = false;
        
        if (notificationStatus === 'default' && !isDismissed) {
          shouldShow = true;
        } else if (notificationStatus === 'denied') {
          const oneWeek = 7 * 24 * 60 * 60 * 1000;
          const shouldRetry = deniedCount < 2 && (now - lastDeniedTime) > oneWeek;
          
          if (shouldRetry && !isDismissed) {
            shouldShow = true;
          }
        }
        
        if (shouldShow) {
          setShowNotificationPrompt(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }
}, [isLoggedIn, firebaseInitialized]);

  // دریافت قیمت‌های ارز دیجیتال
  useEffect(() => {
    const staticData = [
      { 
        id: 'bitcoin', 
        symbol: 'BTC',
        name: 'Bitcoin',
        color: 'bg-[#f7931a]',
        price: 42000,
        change: 2.5
      },
      { 
        id: 'ethereum', 
        symbol: 'ETH',
        name: 'Ethereum',
        color: 'bg-[#627eea]',
        price: 2200,
        change: 1.8
      },
      { 
        id: 'binancecoin', 
        symbol: 'BNB',
        name: 'BNB',
        color: 'bg-[#F3BA2F]',
        price: 320,
        change: -0.5
      },
      { 
        id: 'solana', 
        symbol: 'SOL',
        name: 'Solana',
        color: 'bg-[#9945ff]',
        price: 98,
        change: 3.2
      },
      { 
        id: 'ripple', 
        symbol: 'XRP',
        name: 'Ripple',
        color: 'bg-[#23292F]',
        price: 0.62,
        change: 1.1
      },
      { 
        id: 'dogecoin', 
        symbol: 'DOGE',
        name: 'Dogecoin',
        color: 'bg-[#C2A633]',
        price: 0.08,
        change: -1.2
      },
      { 
        id: 'cardano', 
        symbol: 'ADA',
        name: 'Cardano',
        color: 'bg-[#0033AD]',
        price: 0.51,
        change: 0.9
      }
    ];

    setCryptoPrices(staticData);
  
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
      
        const updatedData = staticData.map(crypto => ({
          ...crypto,
          price: data[crypto.id]?.usd || crypto.price,
          change: data[crypto.id]?.usd_24h_change || crypto.change
        }));

        setCryptoPrices(updatedData);
      } catch (error) {
        //console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 1800000);
    return () => clearInterval(interval);
  }, []);

  // دریافت اسلایدرها
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
        const response = await fetch('https://p30s.com/wp-json/wp/v2/slider?_embed', {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
      
        if (!response.ok) throw new Error('خطا در دریافت اسلایدرها');
      
        const data = await response.json();
        setSliders(data);
      } catch (error) {
        //console.error('Error fetching sliders:', error);
      }
    };

    fetchSliders();
  }, []);

  // دریافت محصولات
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
        const response = await fetch('https://p30s.com/wp-json/wc/v3/products?per_page=10', {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
      
        if (!response.ok) throw new Error('خطا در دریافت محصولات');
      
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        //console.error('Error fetching products:', err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // دریافت stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
        const response = await fetch('https://p30s.com/wp-json/wp/v2/story_highlights?_embed', {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
      
        if (!response.ok) throw new Error('خطا در دریافت استوری ها');
        const data = await response.json();
        setStories(data);
      } catch (error) {
        //console.error('خطا در دریافت استوری ها:', error);
      }
    };

    fetchStories();
  }, []);


  // مدیریت پیام‌های دریافتی از اپ نیتیو
useEffect(() => {
  const handleNativeMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('پیام دریافت شده از اپ نیتیو:', data);
      
      switch (data.type) {
        case 'THEME_UPDATE':
          setIsDarkMode(data.theme === 'dark');
          break;
        case 'INITIAL_THEME':
          setIsDarkMode(data.theme === 'dark');
          break;
        default:
          console.log('نوع پیام ناشناخته:', data);
      }
    } catch (error) {
      console.error('خطا در پردازش پیام نیتیو:', error);
    }
  };

  if (isReactNative) {
    document.addEventListener('message', handleNativeMessage);
    window.addEventListener('message', handleNativeMessage);
    
    return () => {
      document.removeEventListener('message', handleNativeMessage);
      window.removeEventListener('message', handleNativeMessage);
    };
  }
}, []);

// ارسال تغییرات navigation به اپ نیتیو
useEffect(() => {
  if (isReactNative) {
    const handleRouteChange = () => {
      sendMessageToNative({
        type: 'NAVIGATION_STATE_CHANGED',
        canGoBack: window.history.length > 1,
        currentPath: window.location.pathname
      });
    };

    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange(); // برای state اولیه
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }
}, []);


// تابع فعال‌سازی اعلان‌ها با User Gesture
// تابع فعال‌سازی اعلان‌ها با User Gesture
const handleEnableNotifications = async () => {
  try {
    // سعی در استفاده از Firebase اگر موجود باشد
    if (firebaseInitialized && firebaseNotificationService) {
      const token = await firebaseNotificationService.requestPermission();
      if (token) {
        firebaseNotificationService.setupForegroundMessaging();
        setShowNotificationPrompt(false);
        alert('اعلان‌ها با موفقیت فعال شدند!');
        return;
      }
    }
    
    // Fallback: استفاده از Basic Notification API
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setShowNotificationPrompt(false);
      alert('اعلان‌ها با موفقیت فعال شدند!');
    } else {
      setShowNotificationPrompt(false);
      alert('مجوز اعلان صادر نشد. لطفاً دوباره تلاش کنید.');
    }
  } catch (error) {
    console.error('خطا در فعال‌سازی اعلان‌ها:', error);
    setShowNotificationPrompt(false);
    alert('خطا در فعال‌سازی اعلان‌ها. لطفاً دوباره تلاش کنید.');
  }
};


const handleEnableNotificationsFromSettings = async () => {
  if (!firebaseInitialized) {
    alert('Firebase هنوز آماده نیست. لطفاً کمی صبر کنید.');
    return false;
  }
  
  try {
    localStorage.removeItem('notificationDismissed');
    const token = await firebaseNotificationService.requestPermission();
    if (token) {
      firebaseNotificationService.setupForegroundMessaging();
      alert('اعلان‌ها با موفقیت فعال شدند!');
      return true;
    } else {
      alert('مجوز اعلان صادر نشد یا مرورگر شما پشتیبانی نمی‌کند.');
      return false;
    }
  } catch (error) {
    console.error('خطا در فعال‌سازی اعلان‌ها:', error);
    alert('خطا در فعال‌سازی اعلان‌ها. لطفاً دوباره تلاش کنید.');
    return false;
  }
};

const getNotificationStatus = () => {
  return {
    permission: Notification.permission,
    isDismissed: localStorage.getItem('notificationDismissed') === 'true'
  };
};

window.handleEnableNotificationsFromSettings = handleEnableNotificationsFromSettings;
window.getNotificationStatus = getNotificationStatus;


return (
  <ErrorBoundary isDarkMode={isDarkMode}>
    <div>
      <ReactNotifications />
      <Toaster position="top-center" containerStyle={{ zIndex: 11000 }} />
      
      {showIOSPrompt && (
        <IOSInstallPrompt isDarkMode={isDarkMode} onClose={() => setShowIOSPrompt(false)} />
      )}

      {/* iOS Update Prompt */}
{showIOSUpdatePrompt && (
  <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
    <div className={`w-full max-w-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 relative`}>
      <button
        onClick={() => setShowIOSUpdatePrompt(false)}
        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          آپدیت iOS مورد نیاز
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} dir="rtl">
          برای دریافت اعلان‌ها، لطفاً iOS خود را به ورژن 16.4 یا بالاتر آپدیت کنید
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setShowIOSUpdatePrompt(false)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  </div>
)}
      
      {showDesktopWarning && (
        <DesktopWarning isDarkMode={isDarkMode} />
      )}

      <BrowserRouter>
        <OrientationLock isDarkMode={isDarkMode}>
          <Routes>
            {/* Route مستقل برای صفحه Buy */}
            <Route path="/buy" element={<BuyPage isDarkMode={isDarkMode} />} />
            
            {/* بقیه routes */}
            {loading ? (
              <Route path="*" element={<CustomLoading />} />
            ) : (
              <Route path="*" element={
                <AppRoutes 
                  isDarkMode={isDarkMode} 
                  setIsDarkMode={setIsDarkMode}
                  products={products}
                  cryptoPrices={cryptoPrices}
                  stories={stories}
                  loading={loading}
                  sliders={sliders}
                  isLoggedIn={isLoggedIn}
                  handleLogout={handleLogout}
                  setIsLoggedIn={setIsLoggedIn}
                  unreadSupportMessages={unreadSupportMessages}
                  setUnreadSupportMessages={setUnreadSupportMessages}
                />
              } />
            )}
          </Routes>
        </OrientationLock>
      </BrowserRouter>
    </div>
    {/* Notification Prompt Card */}
<NotificationPromptCard
  isDarkMode={isDarkMode}
  isOpen={showNotificationPrompt}
  onClose={() => setShowNotificationPrompt(false)}
  onEnable={handleEnableNotifications}
/>

  </ErrorBoundary>
);
  
};

export default App;