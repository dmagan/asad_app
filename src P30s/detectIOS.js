// src/detectIOS.js
export const isIOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };
  
  export const isInStandaloneMode = () => {
    return ('standalone' in window.navigator) && (window.navigator.standalone);
  };
  
  export const hasSeenInstallPrompt = () => {
    return localStorage.getItem('ios-install-prompt-seen') === 'true';
  };
  
  export const setPromptAsSeen = () => {
   // localStorage.setItem('ios-install-prompt-seen', 'true');
  };
  
  export const shouldShowInstallPrompt = () => {
    // چک می‌کنیم که آیا در iOS هستیم، برنامه به صفحه اصلی اضافه نشده، و کاربر قبلاً راهنما را ندیده است
    return isIOS() && !isInStandaloneMode() && !hasSeenInstallPrompt();
  };