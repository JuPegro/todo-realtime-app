import { useTheme } from '../context/ThemeContext';

export const useThemeColors = () => {
  const { colors, isDark } = useTheme();

  // Helper function to get priority colors that adapt to theme
  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      light: {
        HIGH: '#FF4444',
        MEDIUM: '#FF8C00', 
        LOW: '#4CAF50',
        URGENT: '#FF0000',
      },
      dark: {
        HIGH: '#FF6B6B',
        MEDIUM: '#FFA726',
        LOW: '#66BB6A',
        URGENT: '#FF5252',
      }
    };

    const currentPalette = isDark ? priorityColors.dark : priorityColors.light;
    return currentPalette[priority as keyof typeof currentPalette] || colors.textSecondary;
  };

  // Helper function to get task type colors that adapt to theme
  const getTypeColor = (type: string) => {
    const typeColors = {
      light: {
        FEATURE: '#007bff',
        BUG_FIX: '#dc3545',
        REFACTOR: '#6f42c1',
        TESTING: '#20c997',
        DOCUMENTATION: '#6c757d',
        CODE_REVIEW: '#fd7e14',
        DEPLOYMENT: '#e83e8c',
        RESEARCH: '#17a2b8',
        OPTIMIZATION: '#28a745',
        MAINTENANCE: '#ffc107',
      },
      dark: {
        FEATURE: '#4da6ff',
        BUG_FIX: '#ff5252',
        REFACTOR: '#9575cd',
        TESTING: '#4caf50',
        DOCUMENTATION: '#9e9e9e',
        CODE_REVIEW: '#ff9800',
        DEPLOYMENT: '#e91e63',
        RESEARCH: '#00bcd4',
        OPTIMIZATION: '#66bb6a',
        MAINTENANCE: '#ffeb3b',
      }
    };

    const currentPalette = isDark ? typeColors.dark : typeColors.light;
    return currentPalette[type as keyof typeof currentPalette] || colors.textSecondary;
  };

  return {
    ...colors,
    isDark,
    getPriorityColor,
    getTypeColor,
  };
};