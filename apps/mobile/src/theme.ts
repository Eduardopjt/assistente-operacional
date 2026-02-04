/**
 * Design tokens - Executive Dashboard (React Native)
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
  attack: '#22C55E',
  attackSubtle: '#16A34A',
  attackLight: 'rgba(34, 197, 94, 0.12)',
  
  caution: '#F59E0B',
  cautionSubtle: '#D97706',
  cautionLight: 'rgba(245, 158, 11, 0.12)',
  
  critical: '#EF4444',
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
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const animations = {
  duration: {
    fast: 180,
    normal: 200,
    slow: 220,
  },
  translateY: 4,
  translateYLarge: 6,
} as const;
