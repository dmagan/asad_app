import React, { useState, useRef, useEffect } from 'react';
import { Store } from 'react-notifications-component';
import { X, Upload, Copy, Check, Clipboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PRODUCT_PRICES } from './config';

const correctSolanaWalletAddress = "H8Ms4Ls4FxFiSpDsNwALxsDQtoboH4TvYJ5NPLDkWvyN";
const usdtSolanaMint = "Es9vMFrzaCER8r9iWHVfJSy3WBYGhy7V7hDUNH9Nj9K";
const allowedPriceDifference = 7; // دلاری


const notify = (title, message, type = 'danger', duration = 7000) => {
  Store.addNotification({
    title,
    message,
    type,
    insert: "top",
    container: "center",
    animationIn: ["animate__animated", "animate__flipInX"],
    animationOut: ["animate__animated", "animate__flipOutX"],
    dismiss: {
      duration,
      showIcon: true,
      pauseOnHover: true,
    },
    style: { direction: 'rtl', textAlign: 'right' },
  });
};


const checkTransactionExists = async (hash) => {
  try {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    const response = await fetch('https://p30s.com/wp-json/transaction/v1/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ hash })
    });
    
    const result = await response.json();
    return result.exists; // true اگر وجود داشته باشد
  } catch (error) {
    console.error('خطا در بررسی وجود تراکنش:', error);
    return false;
  }
};

const verifyTransaction = async (hash, expectedPrice) => {
  try {
    const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${hash}`, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_TRONSCAN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data) {
      const isUSDTContract = data.toAddress === 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      const receiverAddress = isUSDTContract 
        ? data.trc20TransferInfo?.[0]?.to_address
        : data.toAddress;
      
      // بررسی آدرس کیف پول
      const correctWalletAddress = "TRJ8KcHydFr3UDytiYmXiBPc1d4df5zGf6";
      if (receiverAddress !== correctWalletAddress) {
        return { 
          success: false, 
          message: 'تراکنش به آدرس کیف پول صحیح ارسال نشده است' 
        };
      }
      
// بررسی مبلغ پرداختی
let paidAmount;
if (data.trc20TransferInfo && data.trc20TransferInfo.length > 0) {
  // تراکنش‌های USDT معمولاً مقدار را با 6 رقم اعشار ذخیره می‌کنند
  const rawAmount = data.trc20TransferInfo[0].amount_str;
  // تقسیم بر 10^6 برای تبدیل به دلار
  paidAmount = parseFloat(rawAmount) / 1000000;
  
  console.log('USDT amount raw:', rawAmount);
  console.log('USDT amount converted:', paidAmount);
} else {
  // برای TRX
  paidAmount = parseFloat(data.amount);
}

// بررسی دقیق مبلغ پرداختی با مقدار مورد انتظار
if (expectedPrice) {
  // مقدار اختلافی که قابل قبول است (5 دلار)
  const allowedDifference = 7;
  
  if (Math.abs(paidAmount - expectedPrice) > allowedDifference) {
    return {
      success: false,
      message: `مبلغ پرداختی (${paidAmount.toFixed(2)} $) با مبلغ محصول (${expectedPrice.toFixed(2)} $) مطابقت ندارد`
    };
  }
}
      
      console.log('اطلاعات تراکنش:', {
        هش: data.hash,
        وضعیت: data.confirmed ? 'تایید شده' : 'در انتظار تایید',
        'آدرس گیرنده': receiverAddress,
        'مقدار تراکنش': paidAmount,
        'نوع تراکنش': isUSDTContract ? 'USDT' : 'TRX'
      });

      return { success: data.confirmed, data };
    }
    return { success: false, message: 'تراکنش یافت نشد' };
    
  } catch (error) {
    console.error('خطای API:', error);
    return { success: false, message: 'خطا در بررسی تراکنش' };
  }
};

const verifySolanaTransaction = async (hash, expectedPrice) => {
  try {
    console.log('بررسی تراکنش Solana با hash:', hash);

    const apiUrl = 'http://87.248.130.125:3001';

    const response = await fetch(`${apiUrl}/verify-solana-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signature: hash,
        expectedAmount: expectedPrice
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'خطا در بررسی تراکنش' 
      };
    }

    if (data.success) {
      console.log('تراکنش با موفقیت تایید شد:', data.data);
      return {
        success: true,
        data: {
          hash,
          paidAmount: data.data.amount,
          transactionData: data.data
        }
      };
    } else {
      return {
        success: false,
        message: data.message || 'تراکنش معتبر نیست'
      };
    }

  } catch (error) {
    console.error('خطای بررسی تراکنش Solana:', error);
    return { 
      success: false, 
      message: 'خطا در ارتباط با سرور تایید تراکنش' 
    };
  }
};


const analyzeImage = async (base64Image, expectedPrice, selectedPaymentMethod) => {
    try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract transaction hash from this image. Return ONLY the hash with no additional characters, spaces, or text. If no valid hash is found, return INVALID_IMAGE"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 100
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0].message.content) {
      const hash = data.choices[0].message.content.trim();
      
      console.log('هش استخراج شده:', hash);
      
      if (hash === 'INVALID_IMAGE') {
        notify("خطا", "لطفا تصویر معتبر رسید تراکنش را آپلود کنید", "danger");
        return null;
      }

      if (hash.length < 64) {
        notify("خطا", "هش تراکنش معتبر در تصویر یافت نشد", "danger");
        return null;
      }

      const verificationResult = selectedPaymentMethod === 'tron' 
        ? await verifyTransaction(hash, expectedPrice)
        : await verifySolanaTransaction(hash, expectedPrice);

      if (!verificationResult.success) {
        notify("خطا", verificationResult.message, "danger");
        return null;
      }

      // بررسی می‌کنیم که آیا تراکنش قبلاً ثبت شده است یا خیر
      const exists = await checkTransactionExists(hash);
      if (exists) {
        notify("خطا", "این تراکنش قبلاً ثبت شده است", "danger");
        return null;
      }

      notify("موفق", "تراکنش با موفقیت تایید شد", "success");
      return hash;
    }
    
    notify("خطا", "خطا در پردازش تصویر", "danger");
    return null;

  } catch (error) {
    console.error('خطای آنالیز:', error);
    notify("خطا", "خطا در پردازش تصویر", "danger");
    return null;
  }
};



const PaymentCard = ({ isDarkMode, onClose, productTitle, price, months, isRenewal = false }) => {
  const navigate = useNavigate();
  const [transactionHash, setTransactionHash] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: انتخاب روش پرداخت، 2: جزئیات پرداخت
  // افزودن state های جدید:
const [copied, setCopied] = useState(false);
const [paymentMethod, setPaymentMethod] = useState('tron'); // 'tron' یا 'solana'
const tronWalletAddress = "TRJ8KcHydFr3UDytiYmXiBPc1d4df5zGf6";
const solanaWalletAddress = "H8Ms4Ls4FxFiSpDsNwALxsDQtoboH4TvYJ5NPLDkWvyN";

  // انیمیشن کشویی از پایین به بالا
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);

  // تابع کپی کردن آدرس ولت
const copyToClipboard = () => {
  const walletAddress = paymentMethod === 'tron' ? tronWalletAddress : solanaWalletAddress;
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(walletAddress)
      .then(() => {
        setCopied(true);
        notify("موفق", "آدرس ولت کپی شد", "success", 2000);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('خطا در کپی کردن: ', err);
        fallbackCopyTextToClipboard(walletAddress);
      });
  } else {
    fallbackCopyTextToClipboard(walletAddress);
  }
};
  
  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // موقعیت textarea را خارج از دید کاربر قرار می‌دهیم
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        notify("موفق", "آدرس ولت کپی شد", "success", 2000);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error('خطا در استفاده از execCommand');
        notify("خطا", "کپی آدرس با مشکل مواجه شد", "danger");
      }
    } catch (err) {
      console.error('خطای execCommand:', err);
      notify("خطا", "کپی آدرس با مشکل مواجه شد", "danger");
    }
    document.body.removeChild(textArea);
  };

  const handleFallbackPaste = () => {
  // ایجاد textarea مخفی برای paste
  const textArea = document.createElement("textarea");
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.left = "-9999px";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  
  textArea.focus();
  textArea.select();
  
  // راهنمایی به کاربر
  notify("راهنمایی", "لطفا Ctrl+V (یا Cmd+V در Mac) را فشار دهید", "info", 4000);
  
  // گوش دادن به paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    if (pastedText) {
      setTransactionHash(pastedText);
      notify("موفق", "متن از کلیپ‌بورد چسبانده شد", "success", 2000);
    }
    document.body.removeChild(textArea);
    document.removeEventListener('paste', handlePaste);
  };
  
  document.addEventListener('paste', handlePaste);
  
  // اگر 10 ثانیه کاری نکرد، textarea رو پاک کن
  setTimeout(() => {
    if (document.body.contains(textArea)) {
      document.body.removeChild(textArea);
      document.removeEventListener('paste', handlePaste);
    }
  }, 10000);
};
  

  // انیمیشن ورود کارت
  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  // مدیریت تعامل کاربر با کارت (امکان کشیدن به پایین)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchStart = (e) => {
      if (e.target.closest('.scrollable-content') && 
          e.target.closest('.scrollable-content').scrollTop !== 0) {
        return;
      }
      isDragging.current = true;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff < 0) return;
      e.preventDefault();
      card.style.transform = `translateY(${diff}px)`;
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const currentTransform = card.style.transform;
      const match = currentTransform.match(/translateY\(([0-9.]+)px\)/);
      if (match) {
        const currentValue = parseFloat(match[1]);
        if (currentValue > 150) {
          closeCard();
        } else {
          card.style.transform = 'translateY(0)';
        }
      }
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

const closeCard = () => {
  setShowCard(false);
  setTimeout(() => {
    setCurrentStep(1); // ریست به مرحله اول
    onClose();
  }, 300);
};

const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notify("خطا", "حجم فایل نباید بیشتر از 5 مگابایت باشد", "danger");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      setUploadProgress(50);
const hash = await analyzeImage(base64, parseFloat(price), paymentMethod);


      if (hash) {
        setTransactionHash(hash);
      }
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      notify("خطا", "خطا در آپلود فایل", "danger");
      setSelectedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };


// تابع بررسی و به‌روزرسانی اشتراک قبلی
// تابع بررسی و به‌روزرسانی اشتراک قبلی
const updateSubscription = async (productTitle, months, transactionHash, price) => {
  try {
    console.log('شروع فرآیند به‌روزرسانی اشتراک:', { productTitle, months, transactionHash });
    
    // ابتدا اشتراک‌های موجود را دریافت می‌کنیم
    let current = [];
    try {
      const storedProducts = localStorage.getItem('purchasedProducts');
      if (storedProducts) {
        current = JSON.parse(storedProducts);
        console.log('اشتراک‌های موجود در localStorage:', current);
      }
    } catch (parseError) {
      console.error('خطا در خواندن اشتراک‌های موجود:', parseError);
      // در صورت خطا، با آرایه خالی ادامه می‌دهیم
      current = [];
    }
    
    const today = new Date();
    
    // تعیین نوع محصول براساس عنوان
    const isVIP = productTitle.toLowerCase().includes('vip');
    const isDex = productTitle.toLowerCase().includes('دکس');
    const isZeroTo100 = productTitle.toLowerCase().includes('صفر تا صد') || 
                          productTitle.toLowerCase().includes('0 تا 100');
    const isSignalStream = productTitle.toLowerCase().includes('سیگنال') || 
                          productTitle.toLowerCase().includes('signal');
    
    console.log('نوع محصول:', { isVIP, isDex, isZeroTo100, isSignalStream });
    
    // پیدا کردن اشتراک فعلی با همان نوع (بدون توجه به وضعیت فعال یا منقضی)
    const existingSubscriptionIndex = current.findIndex(item => {
      if (isVIP && item.isVIP) return true;
      if (isDex && item.title && item.title.toLowerCase().includes('دکس')) return true;
      if (isZeroTo100 && item.title && (
          item.title.toLowerCase().includes('صفر تا صد') || 
          item.title.toLowerCase().includes('0 تا 100')
        )) return true;
      if (isSignalStream && item.title && (
          item.title.toLowerCase().includes('سیگنال') || 
          item.title.toLowerCase().includes('signal')
        )) return true;
      return false;
    });
    
    console.log('ایندکس اشتراک موجود:', existingSubscriptionIndex);
    
    const days = months * 30;
    let result = {};
    
    // اگر اشتراک مشابه وجود دارد
    if (existingSubscriptionIndex !== -1) {
      const existingSubscription = current[existingSubscriptionIndex];
      console.log('اشتراک موجود یافت شد:', existingSubscription);
      
      let updatedDays;
      // اگر اشتراک کنونی منقضی شده یا دارای روزهای باقیمانده کمتر از 0 است
      if (existingSubscription.status === 'expired' || 
          (existingSubscription.remainingDays !== 'unlimited' && parseInt(existingSubscription.remainingDays || 0) <= 0)) {
        // اشتراک منقضی شده - شروع جدید
        updatedDays = days;
      } else {
        // افزودن به زمان باقیمانده فعلی
        if (existingSubscription.remainingDays === 'unlimited' || isDex || isZeroTo100) {
          updatedDays = 'unlimited';
        } else {
          updatedDays = parseInt(existingSubscription.remainingDays || 0) + days;
        }
      }
      
      console.log('روزهای به‌روز شده:', updatedDays);
      
      // به‌روزرسانی اشتراک موجود
      const updatedSubscription = {
        ...existingSubscription,
        status: 'active',
        remainingDays: updatedDays,
        lastUpdated: today.toISOString(),
        lastRenewed: today.toISOString(),
        transactionHash: transactionHash
      };
      
      // اگر تغییراتی در عنوان نیاز است، اعمال شود
      if (isVIP) {
        // اصلاح عنوان VIP برای یکپارچگی
        let baseTitle = existingSubscription.title || '';
        baseTitle = baseTitle.replace(/^اشتراک\s*/, '')
                            .replace(/VIP\s*/g, '')
                            .trim();
        updatedSubscription.title = `اشتراک VIP ${baseTitle}`;
      }
      
      // جایگزینی اشتراک قدیمی با نسخه به‌روز شده
      current[existingSubscriptionIndex] = updatedSubscription;
      
      result = { updated: true, subscription: updatedSubscription };
    } else {
      // اگر اشتراک قبلی وجود ندارد، ایجاد اشتراک جدید
      console.log('اشتراک موجود یافت نشد، ایجاد اشتراک جدید');
      
      const newSubscription = {
        id: `sub_${Date.now()}`, // ایجاد ID یکتا
        transactionId: transactionHash,
        title: productTitle,
        date: today.toISOString(),
        status: 'active',
        remainingDays: isDex || isZeroTo100 ? 'unlimited' : days,
        isVIP: isVIP,
        isDex: isDex,
        isZeroTo100: isZeroTo100,
        isSignalStream: isSignalStream,
        transactionHash: transactionHash,
        createdAt: today.toISOString(),
        lastUpdated: today.toISOString()
      };
      
      // افزودن به لیست اشتراک‌ها
      current.push(newSubscription);
      
      result = { updated: false, subscription: newSubscription };
    }
    
    // ذخیره‌سازی تغییرات در localStorage
    try {
      localStorage.setItem('purchasedProducts', JSON.stringify(current));
      localStorage.setItem('lastProductCheck', new Date().getTime().toString());
      console.log('اشتراک با موفقیت در localStorage ذخیره شد');
      
      // همچنین در sessionStorage هم ذخیره می‌کنیم به عنوان پشتیبان
      sessionStorage.setItem('purchasedProducts', JSON.stringify(current));
      sessionStorage.setItem('lastProductCheck', new Date().getTime().toString());
    } catch (storageError) {
      console.error('خطا در ذخیره‌سازی در localStorage:', storageError);
      // سعی می‌کنیم در sessionStorage ذخیره کنیم
      try {
        sessionStorage.setItem('purchasedProducts', JSON.stringify(current));
        sessionStorage.setItem('lastProductCheck', new Date().getTime().toString());
        console.log('اشتراک با موفقیت در sessionStorage ذخیره شد');
      } catch (sessionStorageError) {
        console.error('خطا در ذخیره‌سازی در sessionStorage:', sessionStorageError);
        // هر دو با شکست مواجه شدند
        return { updated: false, error: true, subscription: null };
      }
    }
    
    return result;
  } catch (error) {
    console.error('خطا در به‌روزرسانی اشتراک:', error);
    return { updated: false, error: true };
  }
};

// این کد را در فایل PaymentCard.js و در تابع handleSubmit قرار دهید
// تابع اصلاح شده handleSubmit
const handleSubmit = async () => {
  if (!transactionHash) {
    notify("خطا", "لطفا هش تراکنش را وارد کنید", "danger");
    return;
  }

  setIsUploading(true);
  setUploadProgress(10);

  try {
    // بررسی تراکنش
    setUploadProgress(30);
const result = paymentMethod === 'tron' 
  ? await verifyTransaction(transactionHash, parseFloat(price))
  : await verifySolanaTransaction(transactionHash, parseFloat(price));

    if (!result.success) {
      notify("خطا", result.message || "تراکنش معتبر نیست", "danger");
      setIsUploading(false);
      setUploadProgress(0);
      return;
    }
    
    setUploadProgress(50);

    // بررسی تکراری بودن تراکنش
const exists = await checkTransactionExists(transactionHash);
if (exists) {
  notify("خطا", "این تراکنش قبلاً ثبت شده است", "danger");
  setIsUploading(false);
  setUploadProgress(0);
  return;
}

setUploadProgress(60);
    // محاسبه مقادیر لازم براساس نوع شبکه
let amount, receiverAddress;

if (paymentMethod === 'tron') {
  const isUSDTContract = result.data.toAddress === 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  receiverAddress = isUSDTContract 
    ? result.data.trc20TransferInfo?.[0]?.to_address
    : result.data.toAddress;
  
  if (isUSDTContract && result.data.trc20TransferInfo && result.data.trc20TransferInfo.length > 0) {
    const rawAmount = result.data.trc20TransferInfo[0].amount_str;
    amount = (parseFloat(rawAmount) / 1000000).toFixed(2);
  } else {
    amount = result.data.amount;
  }
} else {
  // برای Solana
  receiverAddress = "H8Ms4Ls4FxFiSpDsNwALxsDQtoboH4TvYJ5NPLDkWvyN";
  amount = parseFloat(price).toFixed(2); // در صورت موفقیت تراکنش، مبلغ درست پرداخت شده
}
    
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) {
      notify("خطا", "لطفا دوباره وارد حساب کاربری خود شوید", "danger");
      setIsUploading(false);
      setUploadProgress(0);
      return;
    }
    
    setUploadProgress(80);
    
    // مرحله 1: ابتدا خرید را ثبت کن
    const endpoint = isRenewal ? 
      'https://p30s.com/wp-json/pcs/v1/renew-subscription' : 
      'https://p30s.com/wp-json/pcs/v1/save-purchase';

    const requestData = isRenewal ? {
      transaction_hash: transactionHash,
      product_title: productTitle,
      price: price,
      paid_amount: amount.toString(),
      is_renewal: true,
      additional_months: months || 1
    } : {
      transaction_hash: transactionHash,
      product_title: productTitle,
      price: price,
      paid_amount: amount.toString(),
      duration_months: months || 1
    };

    const purchaseResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    const purchaseData = await purchaseResponse.json();
    
    setUploadProgress(90);
    
    if (purchaseData.success) {
      // مرحله 2: فقط اگر خرید موفق بود، هش را ذخیره کن
      try {
        const transactionResponse = await fetch('https://p30s.com/wp-json/transaction/v1/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
body: JSON.stringify({ 
  hash: transactionHash, 
  amount: amount, 
  wallet_address: receiverAddress, 
  type: paymentMethod === 'tron' ? 
    (result.data.toAddress === 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' ? 'USDT' : 'TRX') : 
    'SOLANA'
})
        });
        
        const transactionData = await transactionResponse.json();
        
        if (!transactionData.success) {
          console.warn('خرید موفق بود اما هش ذخیره نشد:', transactionData.message);
          // خرید موفق بوده، فقط هش ذخیره نشده (مشکل فنی، اما نه مشکل اصلی)
        }
      } catch (hashError) {
        console.error('خطا در ذخیره هش (خرید موفق بود):', hashError);
        // خرید موفق بوده، فقط هش ذخیره نشده
      }
      
      setUploadProgress(100);
      
      // ادامه فرآیند موفقیت...
      const successMessage = isRenewal ? "تمدید اشتراک شما با موفقیت انجام شد" : "خرید شما با موفقیت ثبت شد";
      notify("موفق", successMessage, "success");
      
      // بقیه کد موفقیت باقی می‌ماند...
      const subscriptionResult = await updateSubscription(productTitle, months || 1, transactionHash, price);
      
      if (subscriptionResult.error) {
        notify("هشدار", "خرید با موفقیت انجام شد اما در ثبت آن در سیستم مشکلی به وجود آمد. لطفا با پشتیبانی تماس بگیرید.", "warning");
      } else {
        const actionType = isRenewal ? "تمدید" : (subscriptionResult.updated ? "تمدید" : "فعال‌سازی");
        notify("موفق", `اشتراک شما با موفقیت ${actionType} شد`, "success", 3000);
      }
      
      // ادامه کد navigation...
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        closeCard();
        
        // بقیه کد هدایت...
      }, 2000);
      
    } else {
      // خطا در ثبت خرید - هش ذخیره نشده
      notify("خطا", purchaseData.message || "در ثبت خرید مشکلی پیش آمد", "danger");
      setIsUploading(false);
      setUploadProgress(0);
    }
    
  } catch (error) {
    console.error('خطا در تأیید تراکنش:', error);
    notify("خطا", "در فرآیند تأیید تراکنش مشکلی پیش آمد", "danger");
    setIsUploading(false);
    setUploadProgress(0);
  }
};


  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 overflow-hidden transition-opacity duration-300"
      onClick={(e) => {
        // اگر کلیک روی خود overlay بود (نه روی کارت)، کارت رو ببند
        if (e.target === e.currentTarget) {
          closeCard();
        }
      }}
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}>
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${isDarkMode ? 'bg-[#0d1822]' : 'bg-white'} rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: 'none',
        }}
      >
        <div className="pt-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

   {currentStep === 2 && (
          <button 
            onClick={() => setCurrentStep(1)}
            className="absolute top-4 left-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <button 
          onClick={closeCard}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="scrollable-content overflow-y-auto h-full pb-safe">
          <div className="pt-2 p-6 pb-8">
{currentStep === 1 && (
              <div className="mb-3 text-center">
                <h1 className={`text font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isRenewal ? 'تمدید اشتراک' : 'پرداخت'} {productTitle}
                </h1>
                {productTitle.includes('پکیج') || productTitle.includes('دکس') && productTitle.includes('صفر تا صد') ? (
                  <div className="mt-1">
                    <p className="text-gray-400">
                      {PRODUCT_PRICES.DEX}$ + {PRODUCT_PRICES.ZERO_TO_100}$ = <span className="line-through">{parseInt(PRODUCT_PRICES.DEX) + parseInt(PRODUCT_PRICES.ZERO_TO_100)}$</span>
                    </p>
                    <p className="text-[#f7d55d] font-bold mt-1 text-3xl">
                      {price} $
                    </p>
                  </div>
                ) : (
                  <p className="text-[#f7d55d] font-bold mt-1 text-3xl">
                    {price} $
                  </p>
                )}
              </div>
            )}

            {currentStep === 1 ? (
              // مرحله 1: انتخاب روش پرداخت
              <div className="space-y-4">
                <div className="mb-4">
                  <p className={`text-2xl mb-6 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} dir='rtl'>
                    روش پرداخت را انتخاب کنید:
                  </p>
                  <div className="flex flex-col gap-3 mb-6">
                    <button
                      onClick={() => setPaymentMethod('tron')}
                      className={`w-full py-4 px-4 rounded-xl transition-all duration-200 ${
                        paymentMethod === 'tron'
                          ? 'bg-[#f7d55d] text-gray-900 font-medium'
                          : isDarkMode 
                            ? 'bg-gray-800 text-gray-300 border border-gray-700'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <img 
                          src="/tron-trx-logo.png" 
                          alt="Tron Logo" 
                          className="w-8 h-8"
                        />
                        <div className="text-center">
                          <div className="font-bold text-lg">TRON (TRC20)</div>
                          <div className="text-sm opacity-80">USDT</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('solana')}
                      className={`w-full py-4 px-4 rounded-xl transition-all duration-200 ${
                        paymentMethod === 'solana'
                          ? 'bg-[#f7d55d] text-gray-900 font-medium'
                          : isDarkMode 
                            ? 'bg-gray-800 text-gray-300 border border-gray-700'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <img 
                          src="/solana-sol-logo.png" 
                          alt="Solana Logo" 
                          className="w-8 h-8"
                        />
                        <div className="text-center">
                          <div className="font-bold text-lg">SOLANA</div>
                          <div className="text-sm opacity-80">USDT / SOL</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium hover:bg-[#e5c44c] transition-colors mt-4"
                >
                  ادامه
                </button>
              </div>
) : (
              // مرحله 2: جزئیات پرداخت
              <div className="space-y-4 pt-10">
                {/* راهنمای پرداخت */}
                <div className="mt-2 mb-4 p-4 rounded-xl border border-yellow-500/90">
                  <div className="text-center mb-4">
  <p className="text-[#f7d55d] text-2xl font-bold mb-2">{price}$</p>
  <p className="text-gray-100 text-lg font-bold" dir="rtl">
    {paymentMethod === 'tron' ? (
      <>USDT بر روی <span className="text-white bg-red-500 px-1 rounded">شبکه TRC20</span> ارسال کنید</>
    ) : (
      <>USDT یا SOL بر روی <span className="text-white bg-blue-400 px-1 rounded">شبکه سولانا</span> ارسال کنید</>
    )}
  </p>
</div>
                  
                  <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg mb-2">
                    <button
                      onClick={copyToClipboard}
                      className="text-white p-2 rounded-full transition-colors"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                    <div className="font-mono text-[14px] text-yellow-500 select-all font-bold break-all" onClick={copyToClipboard}>
                      {paymentMethod === 'tron' ? tronWalletAddress : solanaWalletAddress}
                    </div>
                  </div>
                  
                  <div className="text-center">
  <button 
    onClick={() => {
      notify("اطلاع", "آموزش پرداخت به زودی در دسترس خواهد بود", "info", 3000);
    }}
    className="w-full mt-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
  >
    آموزش پرداخت آسان
  </button>
</div>
                </div>
                  
                <div className="space-y-2">
                  <div className="relative">
                    <div className="flex items-center relative">
                      <input
                        type="text"
                        value={transactionHash}
                        onChange={(e) => setTransactionHash(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] ${
                          isDarkMode 
                            ? 'bg-gray-800 text-white placeholder-gray-500'
                            : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="هش تراکنش را وارد کنید"
                        dir="rtl"
                      />
<button
  onClick={async () => {
    try {
      // برای موبایل باید user interaction داشته باشیم
      if (navigator.clipboard && navigator.clipboard.readText) {
        // درخواست permission برای موبایل
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({name: 'clipboard-read'});
          if (permission.state === 'denied') {
            notify("خطا", "دسترسی به کلیپ‌بورد رد شده است", "danger", 2000);
            return;
          }
        }
        
        const text = await navigator.clipboard.readText();
        setTransactionHash(text);
        notify("موفق", "متن از کلیپ‌بورد چسبانده شد", "success", 2000);
      } else {
        // Fallback برای موبایل‌های قدیمی
        notify("راهنمایی", "لطفاً متن را در فیلد paste کنید", "info", 3000);
      }
    } catch (error) {
      console.log('خطای clipboard:', error);
      // برای موبایل، راهنمایی بهتری بده
      notify("راهنمایی", "روی فیلد tap کنید و paste انتخاب کنید", "info", 3000);
    }
  }}
  className={`absolute left-2 p-2 rounded-full ${
    isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
  }`}
  style={{ zIndex: 10 }}
>
  <Clipboard size={20} />
</button>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center justify-center my-4">
                    <div className={`px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      یا
                    </div>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-4 rounded-xl border-2 border-dashed text-center cursor-pointer ${
                      isDarkMode 
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*"
                    />
                    <Upload className={`w-6 h-6 mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedFile ? selectedFile.name : 'آپلود تصویر رسید'}
                    </p>
                  </div>

                  {isUploading && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded">
                        <div 
                          className="h-full bg-[#f7d55d] rounded transition-all duration-200" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-center mt-1">
                        {uploadProgress}%
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium hover:bg-[#e5c44c] transition-colors mt-4"
                  >
                    ارسال
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
