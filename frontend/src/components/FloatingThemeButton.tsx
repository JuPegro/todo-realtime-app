import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface FloatingThemeButtonProps {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
}

const FloatingThemeButton: React.FC<FloatingThemeButtonProps> = ({
  bottom = 100,
  left,
  right = 20,
  top,
}) => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.floatingButton,
        {
          backgroundColor: colors.primary,
          bottom,
          left,
          right,
          top,
          shadowColor: colors.text,
        }
      ]}
      onPress={toggleTheme}
    >
      <Ionicons 
        name={isDark ? 'sunny' : 'moon'} 
        size={24} 
        color="white" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  buttonText: {
    fontSize: 22,
    color: 'white',
  },
});

export default FloatingThemeButton;