import { Pressable, PressableProps, Platform } from 'react-native';
import { ReactNode } from 'react';

interface TouchableProps extends PressableProps {
  children: ReactNode;
}

export function Touchable({ children, style, ...props }: TouchableProps) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        typeof style === 'function' ? style({ pressed }) : style,
        Platform.OS === 'web' && {
          cursor: 'pointer',
          userSelect: 'none',
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
