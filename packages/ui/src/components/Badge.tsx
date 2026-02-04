import React, { CSSProperties } from 'react';
import { colors, spacing, borderRadius, typography } from '../tokens';

export type BadgeVariant = 'attack' | 'caution' | 'critical' | 'neutral';

export interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  style?: CSSProperties;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  attack: { bg: colors.attack, text: colors.background },
  caution: { bg: colors.caution, text: colors.background },
  critical: { bg: colors.critical, text: colors.textPrimary },
  neutral: { bg: colors.backgroundElevated, text: colors.textPrimary },
};

export const Badge: React.FC<BadgeProps> = ({ variant, label, style }) => {
  const { bg, text } = variantColors[variant];

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bg,
    color: text,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    ...style,
  };

  return <span style={badgeStyle}>{label}</span>;
};
