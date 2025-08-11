import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, isDark, setTheme, toggleTheme, colors } = useTheme();

  const showThemeOptions = () => {
    Alert.alert(
      'Seleccionar Tema',
      'Elige el tema de la aplicación',
      [
        {
          text: 'Claro',
          onPress: () => setTheme('light'),
          style: theme === 'light' ? 'default' : 'default',
        },
        {
          text: 'Oscuro',
          onPress: () => setTheme('dark'),
          style: theme === 'dark' ? 'default' : 'default',
        },
        {
          text: 'Sistema',
          onPress: () => setTheme('system'),
          style: theme === 'system' ? 'default' : 'default',
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const getThemeDisplayName = () => {
    switch (theme) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Oscuro';
      case 'system':
        return `Sistema (${isDark ? 'Oscuro' : 'Claro'})`;
      default:
        return 'Sistema';
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>
        Tema
      </Text>
      
      <TouchableOpacity
        style={[styles.themeSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={showThemeOptions}
      >
        <Text style={[styles.themeText, { color: colors.text }]}>
          {getThemeDisplayName()}
        </Text>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.quickToggle, { backgroundColor: colors.primary }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.toggleText, { color: '#ffffff' }]}>
          {isDark ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  themeText: {
    fontSize: 14,
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 16,
  },
});

export default ThemeToggle;