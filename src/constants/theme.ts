/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#15161A',
    background: '#F7F7F9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECEDF1',
    textSecondary: '#6B707A',
    border: 'rgba(15,15,20,0.07)',
    primary: '#3c87f7',
    success: '#27ae60',
    danger: '#e05252',
  },
  dark: {
    text: '#F5F5F7',
    background: '#0B0C0E',
    backgroundElement: '#1C1D21',
    backgroundSelected: '#26282D',
    textSecondary: '#9CA0AA',
    border: 'rgba(255,255,255,0.08)',
    primary: '#3c87f7',
    success: '#27ae60',
    danger: '#e05252',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Subtle elevation for card-like surfaces (ThemedView type="backgroundElement").
// Shadows read clearly on light backgrounds; on dark backgrounds a shadow is
// nearly invisible, so cards rely on the `border` token there instead.
export const CardShadow = Platform.select({
  android: { elevation: 2 },
  default: {
    shadowColor: '#0F0F14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
