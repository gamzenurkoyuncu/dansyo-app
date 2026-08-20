import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export default function AppTabs() {
  const scheme = useResolvedColorScheme();
  const colors = Colors[scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="teams">
        <NativeTabs.Trigger.Label>Ekipler</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.3.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="dancers">
        <NativeTabs.Trigger.Label>Dansçılar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="attendance">
        <NativeTabs.Trigger.Label>Yoklama</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checkmark.circle.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="payments">
        <NativeTabs.Trigger.Label>Aidat</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="turkishlirasign.circle.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Ayarlar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
