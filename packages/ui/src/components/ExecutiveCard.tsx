import React from 'react';
import { colors, borderRadius, shadows, spacing } from '../tokens';

export interface ExecutiveCardProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  elevated?: boolean;
  onClick?: () => void;
}

export const ExecutiveCard: React.FC<ExecutiveCardProps> = ({
  children,
  padding = 'lg',
  elevated = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing[padding],
        boxShadow: elevated ? shadows.md : shadows.sm,
        border: `1px solid ${colors.borderSubtle}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 150ms ease-out',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = elevated ? shadows.md : shadows.sm;
        }
      }}
    >
      {children}
    </div>
  );
};
