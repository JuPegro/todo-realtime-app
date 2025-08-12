import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { useThemeColors } from '../hooks/useThemeColors';

interface PullToRefreshAnimationProps {
  refreshing: boolean;
  pullDistance: number;
  onRefresh?: () => void;
}

const PullToRefreshAnimation: React.FC<PullToRefreshAnimationProps> = ({
  refreshing,
  pullDistance,
  onRefresh,
}) => {
  const colors = useThemeColors();
  
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      // Rotation animation while refreshing
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // Stop rotation and hide
      rotation.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [refreshing]);

  // Pull distance animation
  useEffect(() => {
    if (!refreshing && pullDistance > 0) {
      const progress = Math.min(pullDistance / 100, 1); // Max pull of 100px
      scale.value = withTiming(progress, { duration: 100 });
      opacity.value = withTiming(progress * 0.8, { duration: 100 });
      
      // Rotate based on pull distance
      if (progress < 1) {
        rotation.value = withTiming(progress * 180, { duration: 100 });
      }
    }
  }, [pullDistance, refreshing]);

  const containerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      pullDistance,
      [0, 100],
      [-20, 0],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [
        { translateY },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const ringStyle = useAnimatedStyle(() => {
    const ringScale = interpolate(
      pullDistance,
      [0, 100],
      [0.8, 1.2],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [{ scale: ringScale }],
      opacity: opacity.value * 0.3,
    };
  });

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      position: 'absolute',
      top: -60,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    ring: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: colors.primary,
    },
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <View style={styles.iconContainer}>
        <Animated.View style={iconStyle}>
          <Ionicons 
            name={refreshing ? "refresh" : "arrow-down"} 
            size={20} 
            color={colors.onPrimary} 
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default PullToRefreshAnimation;