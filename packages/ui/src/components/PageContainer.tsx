import React from 'react';
import { colors, spacing } from '../tokens';

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  padding?: keyof typeof spacing;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '1200px',
  padding = 'xl',
}) => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: spacing[padding],
        backgroundColor: colors.background,
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
};
