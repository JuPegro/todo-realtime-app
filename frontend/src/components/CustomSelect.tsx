import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
  containerStyle?: any;
}


const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onValueChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  style,
  containerStyle,
}) => {
  const { colors, isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsVisible(false);
  };

  const handlePress = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectText,
            {
              color: selectedOption ? colors.text : colors.placeholder,
            },
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.placeholder}
          style={[
            styles.chevron,
            isVisible && styles.chevronRotated,
          ]}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
        presentationStyle="overFullScreen"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Seleccionar opción
                </Text>
                <TouchableOpacity
                  onPress={() => setIsVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.optionsContainer}
                showsVerticalScrollIndicator={false}
              >
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor:
                          value === option.value
                            ? colors.primary + '20'
                            : 'transparent',
                        borderBottomColor: colors.border,
                        borderBottomWidth: index < options.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color:
                            value === option.value ? colors.primary : colors.text,
                          fontWeight: value === option.value ? '600' : '400',
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 50,
    overflow: 'hidden',
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 350,
    maxHeight: screenHeight * 0.6,
  },
  modalContent: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    maxHeight: screenHeight * 0.4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    minHeight: Platform.OS === 'ios' ? 48 : 44,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});

export default CustomSelect;