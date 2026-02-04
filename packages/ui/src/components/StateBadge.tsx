import React from 'react';
import { colors, borderRadius, spacing, typography } from '../tokens';

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
    padding: `2px ${spacing.sm}`,
    height: '20px',
  },
  md: {
    fontSize: typography.fontSize.sm,
    padding: `4px ${spacing.md}`,
    height: '28px',
  },
  lg: {
    fontSize: typography.fontSize.base,
    padding: `6px ${spacing.lg}`,
    height: '36px',
  },
} as const;

export const StateBadge: React.FC<StateBadgeProps> = ({ state, size = 'md' }) => {
  const config = stateConfig[state];
  const sizeStyle = sizeConfig[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.bg,
        color: config.color,
        fontSize: sizeStyle.fontSize,
        fontWeight: typography.fontWeight.semibold,
        padding: sizeStyle.padding,
        borderRadius: borderRadius.sm,
        letterSpacing: typography.letterSpacing.wide,
        height: sizeStyle.height,
        textTransform: 'uppercase',
      }}
    >
      {config.label}
    </span>
  );
};
