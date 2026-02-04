/**
 * Design tokens - Executive Dashboard
 * Business premium, serious, calm, decision-driven aesthetic
 */

export const colors = {
  // Base - Deep professional background
  background: '#0B0E14',
  backgroundElevated: '#13161D',
  surface: '#1A1E27',
  surfaceElevated: '#242933',
  
  // Text hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A8B8',
  textTertiary: '#6B7280',
  textMuted: '#4B5563',
  
  // Borders & dividers
  border: '#2A2F3A',
  borderSubtle: '#1F242E',
  divider: '#1F242E',

  // State indicators (ATTACK/CAUTION/CRITICAL)
  attack: '#22C55E',      // Green - positive state
  attackSubtle: '#16A34A',
  attackLight: 'rgba(34, 197, 94, 0.12)',
  
  caution: '#F59E0B',     // Amber - needs attention
  cautionSubtle: '#D97706',
  cautionLight: 'rgba(245, 158, 11, 0.12)',
  
  critical: '#EF4444',    // Red - urgent action
  criticalSubtle: '#DC2626',
  criticalLight: 'rgba(239, 68, 68, 0.12)',

  // Semantic colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Accent for CTAs
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  primaryLight: 'rgba(59, 130, 246, 0.12)',
} as const;

export const typography = {
  fontFamily: {
    // Executive: Inter for web, SF Pro for iOS
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
    mono: '"SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const;

export const borderRadius = {
  none: '0',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px -2px rgba(0, 0, 0, 0.4)',
  lg: '0 12px 24px -4px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 40px -8px rgba(0, 0, 0, 0.6)',
} as const;

export const transitions = {
  // Mobile: 180-220ms ease-out
  mobile: {
    fast: '180ms ease-out',
    normal: '200ms ease-out',
    slow: '220ms ease-out',
  },
  // Desktop: Subtle opacity/scale
  desktop: {
    fast: '120ms ease-out',
    normal: '150ms ease-out',
    slow: '200ms ease-out',
  },
} as const;

export const animations = {
  // Mobile microinteractions
  mobile: {
    translateY: '4px',
    translateYLarge: '6px',
  },
} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type FontSizeToken = keyof typeof typography.fontSize;
