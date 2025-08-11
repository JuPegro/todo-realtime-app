import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';

interface LoadingSpinnerProps {
  visible: boolean;
  message?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  message = 'Cargando...',
  overlay = false,
}) => {
  if (overlay) {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        <View style={styles.overlayContainer}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="small" color="#007AFF" />
      <Text style={styles.inlineMessage}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  inlineMessage: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default LoadingSpinner;