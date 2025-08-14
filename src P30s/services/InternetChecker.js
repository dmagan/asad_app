import React, { useState, useEffect } from 'react';
import { Alert, Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

class InternetChecker {
  constructor() {
    this.isOnline = true;
    this.listeners = new Set();
    this.hasShownInitialAlert = false;
    this.initialize();
  }

  initialize() {
    // تنظیم listener برای تغییرات اتصال
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected;
      
      // اطلاع‌رسانی به listeners
      this.listeners.forEach(listener => listener(this.isOnline));
      
      // نمایش پیام تغییر وضعیت
      if (wasOnline !== this.isOnline && this.hasShownInitialAlert) {
        this.showConnectionChangeAlert();
      }
    });
    
    // بررسی اتصال اولیه
    this.checkInitialConnection();
  }

  async checkInitialConnection() {
    try {
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected;
      
      // اگر اتصال وجود ندارد، پیام نمایش داده شود
      if (!this.isOnline) {
        this.showInitialNoInternetAlert();
      }
      
      this.hasShownInitialAlert = true;
    } catch (error) {
      console.error('خطا در بررسی اتصال اولیه:', error);
      this.isOnline = false;
      this.showInitialNoInternetAlert();
    }
  }

  // نمایش پیام اولیه عدم اتصال
  showInitialNoInternetAlert() {
    Alert.alert(
      'اتصال اینترنت موجود نیست',
      'برنامه در حالت آفلاین اجرا می‌شود. برای استفاده از ویژگی‌های کامل، اتصال اینترنت لازم است.',
      [
        {
          text: 'متوجه شدم',
          onPress: () => {
            // اجازه ادامه کار به برنامه
            console.log('کاربر پیام آفلاین را تأیید کرد');
          }
        }
      ],
      { cancelable: false }
    );
  }

  // نمایش پیام تغییر وضعیت اتصال
  showConnectionChangeAlert() {
    if (this.isOnline) {
      // اتصال برقرار شد
      Alert.alert(
        'اتصال اینترنت برقرار شد',
        'تمام ویژگی‌های برنامه در دسترس است.',
        [{ text: 'عالی', style: 'default' }],
        { cancelable: true }
      );
    } else {
      // اتصال قطع شد
      Alert.alert(
        'اتصال اینترنت قطع شد',
        'برنامه در حالت آفلاین ادامه می‌دهد. برخی ویژگی‌ها ممکن است محدود باشند.',
        [{ text: 'متوجه شدم', style: 'default' }],
        { cancelable: true }
      );
    }
  }

  // بررسی اتصال برای عملیات خاص
  checkForAction(actionName, callback) {
    if (this.isOnline) {
      // اتصال موجود است، عملیات را انجام بده
      callback();
    } else {
      // اتصال موجود نیست، پیام نمایش بده
      Alert.alert(
        'اتصال اینترنت لازم است',
        `برای ${actionName} اتصال اینترنت موجود نیست. لطفاً اتصال خود را بررسی کنید.`,
        [
          {
            text: 'لغو',
            style: 'cancel'
          },
          {
            text: 'تلاش مجدد',
            onPress: () => {
              // بررسی مجدد اتصال
              this.recheckConnection(() => {
                if (this.isOnline) {
                  callback();
                } else {
                  Alert.alert('خطا', 'همچنان اتصال اینترنت موجود نیست');
                }
              });
            }
          }
        ]
      );
    }
  }

  // بررسی مجدد اتصال
  async recheckConnection(callback) {
    try {
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected;
      
      // اطلاع‌رسانی به listeners
      this.listeners.forEach(listener => listener(this.isOnline));
      
      if (callback) callback();
    } catch (error) {
      console.error('خطا در بررسی مجدد اتصال:', error);
      if (callback) callback();
    }
  }

  // اضافه کردن listener
  addListener(listener) {
    this.listeners.add(listener);
  }

  // حذف listener
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  // دریافت وضعیت اتصال
  getConnectionStatus() {
    return this.isOnline;
  }

  // نمایش پیام سفارشی برای عملیات‌های خاص
  showCustomMessage(title, message, actions = []) {
    Alert.alert(title, message, actions);
  }
}

// کامپوننت UI برای نمایش وضعیت اتصال
export const ConnectionStatusBar = ({ isDarkMode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const updateConnectionStatus = (online) => {
      setIsOnline(online);
      
      if (!online) {
        setShowStatus(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowStatus(false);
        });
      }
    };

    internetChecker.addListener(updateConnectionStatus);
    
    return () => {
      internetChecker.removeListener(updateConnectionStatus);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <Animated.View 
      style={[
        styles.statusBar,
        {
          backgroundColor: isDarkMode ? '#7f1d1d' : '#fca5a5',
          opacity: fadeAnim
        }
      ]}
    >
      <View style={styles.statusContent}>
        <Ionicons 
          name="wifi-outline" 
          size={16} 
          color={isDarkMode ? '#ffffff' : '#7f1d1d'} 
        />
        <Text style={[
          styles.statusText,
          { color: isDarkMode ? '#ffffff' : '#7f1d1d' }
        ]}>
          اتصال اینترنت موجود نیست
        </Text>
      </View>
    </Animated.View>
  );
};

// کامپوننت Modal برای نمایش پیام‌های سفارشی
export const InternetAlertModal = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  isDarkMode,
  onRetry 
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }
        ]}>
          <View style={styles.modalHeader}>
            <Ionicons 
              name="wifi-outline" 
              size={48} 
              color={isDarkMode ? '#ef4444' : '#dc2626'} 
            />
            <Text style={[
              styles.modalTitle,
              { color: isDarkMode ? '#ffffff' : '#111827' }
            ]}>
              {title}
            </Text>
          </View>
          
          <Text style={[
            styles.modalMessage,
            { color: isDarkMode ? '#d1d5db' : '#6b7280' }
          ]}>
            {message}
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[
                styles.modalButton,
                styles.cancelButton,
                { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }
              ]}
              onPress={onClose}
            >
              <Text style={[
                styles.modalButtonText,
                { color: isDarkMode ? '#ffffff' : '#374151' }
              ]}>
                لغو
              </Text>
            </TouchableOpacity>
            
            {onRetry && (
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  styles.retryButton,
                  { backgroundColor: isDarkMode ? '#f59e0b' : '#d97706' }
                ]}
                onPress={onRetry}
              >
                <Text style={[
                  styles.modalButtonText,
                  { color: '#ffffff' }
                ]}>
                  تلاش مجدد
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 6,
  },
  retryButton: {
    marginLeft: 6,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

// ساخت instance واحد
const internetChecker = new InternetChecker();

export default internetChecker;