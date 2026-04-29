import { Platform } from 'react-native';

export const Theme = {
  colors: {
    neutralLight: '#F5F5F5',
    neutralVeryLight: '#FFFFFF',
    neutralMedium: '#CCCCCC',
    neutralDark: '#666666',
    neutralVeryDark: '#333333',
    auxiliary05Default: '#007AFF',
    errorMedium: '#FF3B30',
    secondary: {
      pure: '#007AFF',
    },
    primary: {
      light: '#E3F2FD',
    },
  },
  spacing: {
    nano: '4px',
    quarck: '8px',
    xs: '12px',
    sm16: '16px',
    lg: '24px',
  },
  border: {
    borderWidth: {
      hairLine: '0.5px',
      thin: '1px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
    },
  },
  typography: {
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
    },
    fontFamily: {
      regular: Platform.select({ ios: 'System', android: 'sans-serif' })!,
      medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' })!,
      bold: Platform.select({ ios: 'System', android: 'sans-serif' })!,
    },
    fontWeight: {
      regular: '400' as const,
      medium: Platform.select({ ios: '500' as const, android: undefined }),
      bold: '700' as const,
    },
  },
};
