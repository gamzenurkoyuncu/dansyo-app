/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1D1E24',
    background: '#F6F5FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF0F8',
    textSecondary: '#71758A',
    border: 'rgba(29,30,36,0.06)',
    primary: '#5B8DEF',
    primarySoft: 'rgba(91,141,239,0.14)',
    success: '#3FB37F',
    successSoft: 'rgba(63,179,127,0.14)',
    danger: '#F0685F',
    dangerSoft: 'rgba(240,104,95,0.14)',
  },
  dark: {
    text: '#F1F1F5',
    background: '#101114',
    backgroundElement: '#1C1E24',
    backgroundSelected: '#282A32',
    textSecondary: '#9A9EAE',
    border: 'rgba(255,255,255,0.08)',
    primary: '#7AA6F5',
    primarySoft: 'rgba(122,166,245,0.16)',
    success: '#4FC694',
    successSoft: 'rgba(79,198,148,0.16)',
    danger: '#F27B73',
    dangerSoft: 'rgba(242,123,115,0.16)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// A consistent, larger corner-radius scale for the soft/modern card+button style.
export const Radius = {
  small: 14,
  medium: 20,
  large: 28,
  pill: 999,
} as const;

// Soft, diffused elevation for card-like surfaces (ThemedView type="backgroundElement").
// Shadows read clearly on light backgrounds; on dark backgrounds a shadow is
// nearly invisible, so cards rely on the `border` token there instead.
export const CardShadow = Platform.select({
  android: { elevation: 3 },
  default: {
    shadowColor: '#15162A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
});

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
