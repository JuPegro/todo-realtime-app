import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  duration?: number;
  onTransitionEnd?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isVisible,
  direction = 'fade',
  duration = 300,
  onTransitionEnd,
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const onComplete = (finished?: boolean) => {
      if (finished && onTransitionEnd) {
        runOnJS(onTransitionEnd)();
      }
    };

    if (isVisible) {
      // Entrance animation
      opacity.value = withTiming(1, { duration });
      
      switch (direction) {
        case 'up':
          translateY.value = withSpring(0, { stiffness: 100, damping: 12 }, onComplete);
          break;
        case 'down':
          translateY.value = withSpring(0, { stiffness: 100, damping: 12 }, onComplete);
          break;
        case 'left':
          translateX.value = withSpring(0, { stiffness: 100, damping: 12 }, onComplete);
          break;
        case 'right':
          translateX.value = withSpring(0, { stiffness: 100, damping: 12 }, onComplete);
          break;
        case 'scale':
          scale.value = withSpring(1, { stiffness: 150, damping: 10 }, onComplete);
          break;
        default:
          // fade - no additional transforms needed
          opacity.value = withTiming(1, { duration }, onComplete);
          break;
      }
    } else {
      // Exit animation
      const exitDuration = duration * 0.7; // Faster exit
      
      switch (direction) {
        case 'up':
          translateY.value = -SCREEN_HEIGHT;
          opacity.value = withTiming(0, { duration: exitDuration }, onComplete);
          break;
        case 'down':
          translateY.value = SCREEN_HEIGHT;
          opacity.value = withTiming(0, { duration: exitDuration }, onComplete);
          break;
        case 'left':
          translateX.value = -SCREEN_WIDTH;
          opacity.value = withTiming(0, { duration: exitDuration }, onComplete);
          break;
        case 'right':
          translateX.value = SCREEN_WIDTH;
          opacity.value = withTiming(0, { duration: exitDuration }, onComplete);
          break;
        case 'scale':
          scale.value = withTiming(0.8, { duration: exitDuration });
          opacity.value = withTiming(0, { duration: exitDuration }, onComplete);
          break;
        default:
          opacity.value = withTiming(0, { duration: exitDuration }, onComplete);
          break;
      }
    }
  }, [isVisible, direction, duration]);

  // Initialize starting positions
  useEffect(() => {
    switch (direction) {
      case 'up':
        translateY.value = SCREEN_HEIGHT;
        break;
      case 'down':
        translateY.value = -SCREEN_HEIGHT;
        break;
      case 'left':
        translateX.value = SCREEN_WIDTH;
        break;
      case 'right':
        translateX.value = -SCREEN_WIDTH;
        break;
      case 'scale':
        scale.value = 0.8;
        break;
      default:
        opacity.value = 0;
        break;
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default PageTransition;