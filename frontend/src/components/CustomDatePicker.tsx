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

interface CustomDatePickerProps {
  value: Date | null;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onDateChange,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  minimumDate,
  maximumDate,
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handlePress = () => {
    if (!disabled) {
      setTempDate(value || new Date());
      setIsVisible(true);
    }
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setIsVisible(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsVisible(false);
      if (event.type === 'set' && selectedDate) {
        onDateChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleClear = () => {
    onDateChange(new Date());
  };

  if (Platform.OS === 'android') {
    return (
      <View>
        <TouchableOpacity
          style={[
            styles.dateButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
          onPress={handlePress}
          disabled={disabled}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.placeholder} />
          <Text
            style={[
              styles.dateButtonText,
              { color: value ? colors.text : colors.placeholder },
            ]}
          >
            {formatDate(value)}
          </Text>
          {value && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {isVisible && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
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
          styles.dateButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.placeholder} />
        <Text
          style={[
            styles.dateButtonText,
            { color: value ? colors.text : colors.placeholder },
          ]}
        >
          {formatDate(value)}
        </Text>
        {value && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.placeholder} />
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
                  Seleccionar Fecha
                </Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.headerButton, { color: colors.primary }]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date Picker */}
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
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

export default CustomDatePicker;