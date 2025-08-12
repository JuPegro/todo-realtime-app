import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useThemeColors } from '../hooks/useThemeColors';

interface OfflineIndicatorProps {
  offlineActionsCount?: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  offlineActionsCount = 0 
}) => {
  const networkStatus = useNetworkStatus();
  const colors = useThemeColors();
  
  const isOffline = networkStatus.isConnected === false || 
                   networkStatus.isInternetReachable === false;

  if (!isOffline && offlineActionsCount === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isOffline ? colors.error : colors.warning,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: colors.onError,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    badge: {
      backgroundColor: colors.onError,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 8,
      minWidth: 20,
      alignItems: 'center',
    },
    badgeText: {
      color: isOffline ? colors.error : colors.warning,
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

  const getMessage = () => {
    if (isOffline) {
      return offlineActionsCount > 0 
        ? `Sin conexión - ${offlineActionsCount} acción${offlineActionsCount > 1 ? 'es' : ''} pendiente${offlineActionsCount > 1 ? 's' : ''}`
        : 'Sin conexión a internet';
    }
    
    return `${offlineActionsCount} acción${offlineActionsCount > 1 ? 'es' : ''} pendiente${offlineActionsCount > 1 ? 's' : ''} de sincronización`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {getMessage()}
      </Text>
      {offlineActionsCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {offlineActionsCount}
          </Text>
        </View>
      )}
    </View>
  );
};