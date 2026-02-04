import React from 'react';
import { colors, borderRadius, spacing, typography, shadows } from '../tokens';

export interface PrimaryActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    fontSize: typography.fontSize.sm,
    padding: `${spacing.sm} ${spacing.lg}`,
    height: '36px',
  },
  md: {
    fontSize: typography.fontSize.base,
    padding: `${spacing.md} ${spacing.xl}`,
    height: '44px',
  },
  lg: {
    fontSize: typography.fontSize.lg,
    padding: `${spacing.lg} ${spacing['2xl']}`,
    height: '52px',
  },
} as const;

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  size = 'md',
}) => {
  const sizeStyle = sizeConfig[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? colors.textMuted : colors.primary,
        color: colors.textPrimary,
        fontSize: sizeStyle.fontSize,
        fontWeight: typography.fontWeight.semibold,
        padding: sizeStyle.padding,
        height: sizeStyle.height,
        borderRadius: borderRadius.md,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: disabled ? 'none' : shadows.sm,
        transition: 'all 150ms ease-out',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = colors.primaryHover;
          e.currentTarget.style.boxShadow = shadows.md;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = colors.primary;
          e.currentTarget.style.boxShadow = shadows.sm;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </button>
  );
};
