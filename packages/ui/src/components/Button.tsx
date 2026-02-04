import React, { ReactNode, CSSProperties } from 'react';
import { colors, spacing, borderRadius, typography } from '../tokens';

export interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) => {
  const baseStyle: CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity 0.2s',
    fontFamily: typography.fontFamily.sans,
  };

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: colors.attack,
      color: colors.background,
    },
    secondary: {
      backgroundColor: colors.backgroundElevated,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.textPrimary,
    },
  };

  const buttonStyle: CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button style={buttonStyle} onClick={onPress} disabled={disabled}>
      {children}
    </button>
  );
};
