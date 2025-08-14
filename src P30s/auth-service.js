// src/auth-service.js
class AuthService {
    constructor() {
      this.baseUrl = 'https://p30s.com';
    }
  
    // تابع لاگین
    async login(email, password) {
      try {
        const auth = btoa(`${email}:${password}`);
        const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
  
        if (!response.ok) {
          throw new Error('نام کاربری یا رمز عبور اشتباه است');
        }
  
        const userData = await response.json();
        
        // ذخیره اطلاعات در localStorage
        localStorage.setItem('auth_token', auth);
        localStorage.setItem('user_data', JSON.stringify(userData));
  
        return userData;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    }
  
    // گرفتن هدرهای مورد نیاز برای احراز هویت
    getAuthHeaders() {
      const token = localStorage.getItem('auth_token');
      return token ? {
        'Authorization': `Basic ${token}`
      } : {};
    }
  
    // خروج از حساب
    logout() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_email');
    }
  
    // بررسی وضعیت لاگین
    isLoggedIn() {
      return !!localStorage.getItem('auth_token');
    }
  }
  
  export default new AuthService();