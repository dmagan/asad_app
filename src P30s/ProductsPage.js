import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';
import PaymentCard from './PaymentCard';

const products = [
 
  {
    id: 2, 
    title: "پکیج VIP شش ماهه",
    duration: "دسترسی 180 روزه",
    price: "199",
    description: "دسترسی به تمام سیگنال‌های معاملاتی و تحلیل‌های تکنیکال با تخفیف ویژه"
  },
  {
    id: 3,
    title: "پکیج VIP یکساله ماهه",
    duration: "دسترسی 365 روزه", 
    price: "299",
    description: "دسترسی نامحدود به تمام خدمات با بیشترین تخفیف"
  },
  {
    id: 4,
    title: "پکیج VIP دوساله ماهه",
    duration: "دسترسی 730 روزه", 
    price: "399",
    description: "دسترسی نامحدود به تمام خدمات با بیشترین تخفیف"
  },
  {
    id: 5,
    title: "دوره دکس تریدینگ",
    duration: "نا محدود", 
    price: "149",
    description: ""
  },
  {
    id: 6,
    title: "دوره صفر تا ۱۰۰ ",
    duration: "نا محدود", 
    price: "۸۹",
    description: " "
  },
  {
    id: 7,
    title: "دوره دکس تریدین و صفر تا ۱۰۰ (پیشنهاد ویژه )",
    duration: "نا محدود", 
    price: "۱۹۹",
    description: " "
  }
];

const ProductsPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
const [productExiting, setProductExiting] = useState(false);
const cardRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);


  // انیمیشن ورود صفحه
useEffect(() => {
  setTimeout(() => {
    setShowCard(true);
  }, 100);
}, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const closeCard = () => {
    setProductExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setProductExiting(false);
      navigate(-1);
    }, 300);
  };

return (
  <div 
  className="fixed inset-0 z-[100] bg-black/40 overflow-hidden transition-opacity duration-300"
  style={{ 
    opacity: productExiting ? 0 : (showCard ? 1 : 0),
    pointerEvents: productExiting || !showCard ? 'none' : 'auto',
    transition: 'opacity 0.3s ease-out'
  }}
  >
    <div 
      ref={cardRef}
      className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg transition-transform duration-300 ease-out`}
      style={{ 
        transform: productExiting 
          ? 'translateX(100%)' 
          : `translateX(${showCard ? '0' : '100%'})`,
        transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
      }}
    >
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="relative h-16 flex items-center px-4">
          <button 
            onClick={closeCard}
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h1 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            محصولات VIP
          </h1>
        </div>
      </div>

      <div className="absolute top-16 bottom-0 left-0 right-0 overflow-y-auto">
        <div className="p-4 pb-4">
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-right">
                      {product.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.duration}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.description}
                    </p>
                    <p className="text-green-500 font-bold mt-2">
                      {product.price} دلار
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {selectedProduct && (
      <PaymentCard
        isDarkMode={isDarkMode}
        onClose={() => setSelectedProduct(null)}
        productTitle={selectedProduct.title}
        price={selectedProduct.price}
      />
    )}

    <style jsx global>{`
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(100%);
        }
      }
    `}</style>
  </div>
);
};

export default ProductsPage;