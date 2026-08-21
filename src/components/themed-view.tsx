import { View, type ViewProps } from 'react-native';

import { CardShadow, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  const isCard = type === 'backgroundElement';

  return (
    <View
      style={[
        { backgroundColor: theme[type ?? 'background'] },
        isCard && CardShadow,
        isCard && { borderWidth: 1, borderColor: theme.border },
        style,
      ]}
      {...otherProps}
    />
  );
}
