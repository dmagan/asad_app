export const PRODUCT_PRICES = {
  // قیمت‌های دوره‌ها
  DEX: '249',
  ZERO_TO_100: '199',
  DEX_ZERO_TO_100_PACKAGE: '349',
  TRADE_PRO: '750',
  MEM_COIN: '15',
  
  // قیمت‌های VIP با دوره‌های مختلف
  VIP: {
    SIX_MONTHS: '199', // 6 ماهه
    YEARLY: '299',     // یک ساله
    TWO_YEARS: '399'  // دو ساله
  }

};


// تنظیمات دسترسی ادمین
export const ADMIN_CONFIG = {
  // ایمیل‌های مجاز برای دسترسی ادمین
  allowedEmails: [
    'alimagani@gmail.com',    // gmail با g کوچک
    'shahan@gmail.com',       // gmail با g کوچک
    'tradingwitherfan@gmail.com', 
    'mindsetasad@gmail.com', 
    'eyarrabi@gmail.com', 

  ],
  // نقش‌های مجاز
  adminRoles: ['administrator', 'admin', 'super_admin']
};