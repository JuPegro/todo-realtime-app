import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: any;
  showRetry?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  style,
  showRetry = true,
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Ionicons 
          name="alert-circle-outline" 
          size={24} 
          color="#FF4444" 
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
      
      <View style={styles.actions}>
        {onDismiss && (
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={handleDismiss}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
        
        {showRetry && onRetry && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFD6D6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  dismissButton: {
    padding: 4,
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ErrorMessage;