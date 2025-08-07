import React from 'react';
import { Text } from 'react-native';

import { FloatingButton } from './styles';

interface NetworkLoggerButtonProps {
  onPress: () => void;
  visible?: boolean;
}

export function NetworkLoggerButton({
  onPress,
  visible = true,
}: NetworkLoggerButtonProps) {
  if (!visible) return null;

  return (
    <FloatingButton onPress={onPress} testID="floating-network-logger-button">
      <Text style={{ fontSize: 24, color: '#fff' }}>🌐</Text>
    </FloatingButton>
  );
}
