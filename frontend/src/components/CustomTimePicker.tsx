import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

interface CustomTimePickerProps {
  value: Date | null;
  onTimeChange: (time: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onTimeChange,
  placeholder = 'Seleccionar hora',
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [tempTime, setTempTime] = useState(value || new Date());

  const formatTime = (time: Date | null) => {
    if (!time) return placeholder;
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to set time with today's date
  const setTimeWithToday = (date: Date) => {
    const today = new Date();
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      date.getHours(),
      date.getMinutes(),
      0,
      0
    );
  };

  const handlePress = () => {
    if (!disabled) {
      setTempTime(value || new Date());
      setIsVisible(true);
    }
  };

  const handleConfirm = () => {
    onTimeChange(setTimeWithToday(tempTime));
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTempTime(value || new Date());
    setIsVisible(false);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setIsVisible(false);
      if (event.type === 'set' && selectedTime) {
        onTimeChange(setTimeWithToday(selectedTime));
      }
    } else {
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    }
  };

  const handleClear = () => {
    const now = new Date();
    onTimeChange(setTimeWithToday(now));
  };

  if (Platform.OS === 'android') {
    return (
      <View>
        <TouchableOpacity
          style={[
            styles.timeButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
          onPress={handlePress}
          disabled={disabled}
        >
          <Ionicons name="time-outline" size={20} color={colors.placeholder} />
          <Text
            style={[
              styles.timeButtonText,
              { color: value ? colors.text : colors.placeholder },
            ]}
          >
            {formatTime(value)}
          </Text>
          {value && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {isVisible && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
    );
  }

  // iOS Implementation
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.timeButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Ionicons name="time-outline" size={20} color={colors.placeholder} />
        <Text
          style={[
            styles.timeButtonText,
            { color: value ? colors.text : colors.placeholder },
          ]}
        >
          {formatTime(value)}
        </Text>
        {value && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={16} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={[styles.headerButton, { color: colors.primary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Seleccionar Hora
                </Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.headerButton, { color: colors.primary }]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time Picker */}
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
  },
  timeButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  clearButton: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: screenHeight * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 200,
    justifyContent: 'center',
  },
  picker: {
    height: 200,
    width: '100%',
  },
});

export default CustomTimePicker;