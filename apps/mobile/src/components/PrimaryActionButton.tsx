import React from 'react';
import { Text, StyleSheet, ViewStyle, Animated, Pressable } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows, animations } from '../theme';

export interface PrimaryActionButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const sizeConfig = {
  sm: {
    fontSize: typography.fontSize.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    height: 36,
  },
  md: {
    fontSize: typography.fontSize.base,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    height: 44,
  },
  lg: {
    fontSize: typography.fontSize.lg,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    height: 52,
  },
} as const;

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  children,
  onPress,
  disabled = false,
  fullWidth = false,
  size = 'md',
  style,
}) => {
  const translateY = React.useRef(new Animated.Value(0)).current;
  const sizeStyle = sizeConfig[size];

  const handlePressIn = () => {
    Animated.spring(translateY, {
      toValue: animations.translateY,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? colors.textMuted : colors.primary,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          height: sizeStyle.height,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        !disabled && shadows.sm,
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyle.fontSize,
            },
          ]}
        >
          {children}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
});
