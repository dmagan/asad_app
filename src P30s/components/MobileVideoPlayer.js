import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../components/CustomText'; // برای نمایش متن فارسی

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MobileVideoPlayer = ({ 
  videoUrl,
  isDarkMode,
  onClose,
  title = '',
}) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // تابع فرمت کردن زمان به دقیقه:ثانیه
  const formatTime = (millis) => {
    if (!millis) return '00:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // مدیریت پلی/پاز
  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  // جلو/عقب بردن 10 ثانیه
  const handleSeek = async (direction) => {
    if (!videoRef.current || !status.positionMillis) return;
    
    const seekAmount = 10000; // 10 seconds in milliseconds
    const newPosition = direction === 'forward' 
      ? Math.min(status.positionMillis + seekAmount, status.durationMillis || 0)
      : Math.max(status.positionMillis - seekAmount, 0);
    
    await videoRef.current.setPositionAsync(newPosition);
  };

  // تغییر حالت تمام صفحه
  const toggleFullscreen = async () => {
    if (!videoRef.current) return;
    
    if (isFullscreen) {
      await videoRef.current.dismissFullscreenPlayer();
    } else {
      await videoRef.current.presentFullscreenPlayer();
    }
    setIsFullscreen(!isFullscreen);
  };

  // مدیریت نمایش/مخفی کردن کنترل‌ها
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#000' : '#fff' }
    ]}>
      <StatusBar hidden={isFullscreen} />
      
      <View style={styles.videoContainer}>
        <TouchableOpacity 
          activeOpacity={1}
          onPress={toggleControls}
          style={styles.videoWrapper}
        >
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode="contain"
            isLooping={false}
            onPlaybackStatusUpdate={setStatus}
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            useNativeControls={false}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator 
                size="large"
                color={isDarkMode ? '#F7D55D' : '#666'}
              />
            </View>
          )}

          {showControls && (
            <View style={styles.controls}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Ionicons 
                    name="close" 
                    size={24} 
                    color="#fff"
                  />
                </TouchableOpacity>
                
                <CustomText style={styles.title}>
                  {title}
                </CustomText>
              </View>

              {/* Play/Pause & Seek Controls */}
              <View style={styles.centerControls}>
                <TouchableOpacity onPress={() => handleSeek('backward')}>
                  <Ionicons name="play-back" size={32} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handlePlayPause}
                  style={styles.playButton}
                >
                  <Ionicons 
                    name={status.isPlaying ? "pause" : "play"} 
                    size={40} 
                    color="#fff" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => handleSeek('forward')}>
                  <Ionicons name="play-forward" size={32} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <CustomText style={styles.time}>
                  {formatTime(status.positionMillis)}
                </CustomText>
                
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={status.durationMillis || 0}
                  value={status.positionMillis || 0}
                  onSlidingComplete={async (value) => {
                    await videoRef.current?.setPositionAsync(value);
                  }}
                  minimumTrackTintColor="#F7D55D"
                  maximumTrackTintColor="#fff"
                  thumbTintColor="#F7D55D"
                />
                
                <CustomText style={styles.time}>
                  {formatTime(status.durationMillis)}
                </CustomText>
                
                <TouchableOpacity 
                  onPress={toggleFullscreen}
                  style={styles.fullscreenButton}
                >
                  <Ionicons 
                    name={isFullscreen ? "contract" : "expand"} 
                    size={24} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  video: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  time: {
    color: '#fff',
    fontSize: 12,
    minWidth: 40,
  },
  fullscreenButton: {
    padding: 8,
  },
});

export default MobileVideoPlayer;