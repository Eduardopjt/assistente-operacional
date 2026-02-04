import React from 'react';
import { colors, spacing, typography } from '../tokens';

export interface TopBarProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, leftAction, rightAction }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${spacing.lg} ${spacing.xl}`,
        backgroundColor: colors.surfaceElevated,
        borderBottom: `1px solid ${colors.border}`,
        minHeight: '72px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        {leftAction}
        <div>
          <h1
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              margin: 0,
              letterSpacing: typography.letterSpacing.tight,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
                margin: `${spacing.xs} 0 0 0`,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
};
