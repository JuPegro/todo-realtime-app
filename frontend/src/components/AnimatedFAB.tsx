import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useThemeColors } from '../hooks/useThemeColors';

interface AnimatedFABProps {
  onPress: () => void;
  visible?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

const AnimatedFAB: React.FC<AnimatedFABProps> = ({
  onPress,
  visible = true,
  icon = 'add',
}) => {
  const colors = useThemeColors();
  
  // Animation values
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Entrance animation
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withSpring(1.1, { stiffness: 100, damping: 8 }),
        withSpring(1, { stiffness: 150, damping: 10 })
      );
      translateY.value = withSpring(0, { stiffness: 100, damping: 12 });
    } else {
      // Exit animation
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(100, { duration: 200 });
    }
  }, [visible]);

  const handlePress = () => {
    // Press animation
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { stiffness: 300, damping: 10 })
    );
    
    // Icon rotation animation
    rotate.value = withSequence(
      withTiming(45, { duration: 150 }),
      withTiming(0, { duration: 150 })
    );
    
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      rotate.value,
      [0, 45],
      [0, 45],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      right: 20,
      bottom: 30,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={handlePress}
        activeOpacity={0.8}
      />
      <Animated.View style={iconStyle}>
        <Ionicons name={icon} size={24} color={colors.onPrimary} />
      </Animated.View>
    </Animated.View>
  );
};

export default AnimatedFAB;