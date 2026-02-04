import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

export interface ExecutiveCardProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  elevated?: boolean;
  style?: ViewStyle;
}

export const ExecutiveCard: React.FC<ExecutiveCardProps> = ({
  children,
  padding = 'lg',
  elevated = true,
  style,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          padding: spacing[padding],
          ...(elevated ? shadows.md : shadows.sm),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
