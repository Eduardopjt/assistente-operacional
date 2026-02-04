import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

export type StateType = 'ATTACK' | 'CAUTION' | 'CRITICAL';

export interface StateBadgeProps {
  state: StateType;
  size?: 'sm' | 'md' | 'lg';
}

const stateConfig = {
  ATTACK: {
    bg: colors.attackLight,
    color: colors.attack,
    label: 'ATTACK',
  },
  CAUTION: {
    bg: colors.cautionLight,
    color: colors.caution,
    label: 'CAUTION',
  },
  CRITICAL: {
    bg: colors.criticalLight,
    color: colors.critical,
    label: 'CRITICAL',
  },
} as const;

const sizeConfig = {
  sm: {
    fontSize: typography.fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    height: 20,
  },
  md: {
    fontSize: typography.fontSize.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    height: 28,
  },
  lg: {
    fontSize: typography.fontSize.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    height: 36,
  },
} as const;

export const StateBadge: React.FC<StateBadgeProps> = ({ state, size = 'md' }) => {
  const config = stateConfig[state];
  const sizeStyle = sizeConfig[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          height: sizeStyle.height,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
});
