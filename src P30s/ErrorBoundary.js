// ErrorBoundary.js
import React from 'react';
import { X } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error('خطا در اپلیکیشن:', error);
    console.error('جزئیات خطا:', errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleClose = () => {
    // Reset error state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Optionally reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { isDarkMode = true } = this.props;
      
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div 
            className={`relative max-w-md w-full mx-4 p-6 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
            dir="rtl"
          >
            {/* Close Button */}
            <button
              onClick={this.handleClose}
              className={`absolute top-4 left-4 p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                isDarkMode ? 'hover:bg-white' : 'hover:bg-gray-600'
              }`}
            >
              <X size={20} />
            </button>

            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">خطایی رخ داد</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                متأسفانه مشکلی در اپلیکیشن پیش آمده است. لطفاً دوباره تلاش کنید.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                تلاش مجدد
              </button>
              <button
                onClick={() => window.location.reload()}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                بارگذاری مجدد
              </button>
            </div>

            {/* Technical Details (collapsed by default) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary 
                  className={`cursor-pointer text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  جزئیات فنی (فقط در حالت توسعه)
                </summary>
                <div 
                  className={`mt-2 p-3 rounded text-xs font-mono overflow-auto max-h-32 ${
                    isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="mb-2">
                    <strong>خطا:</strong> {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;