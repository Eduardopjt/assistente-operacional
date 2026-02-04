import React, { ReactNode, CSSProperties } from 'react';
import { colors, spacing, borderRadius, shadows } from '../tokens';

export interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = false }) => {
  const cardStyle: CSSProperties = {
    backgroundColor: elevated ? colors.backgroundElevated : colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    border: `1px solid ${colors.border}`,
    boxShadow: elevated ? shadows.md : 'none',
    ...style,
  };

  return <div style={cardStyle}>{children}</div>;
};
