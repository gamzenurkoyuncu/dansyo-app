import * as Device from 'expo-device';
import { Href, Link } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

type QuickLinkCardProps = {
  href: Href;
  emoji: string;
  title: string;
  subtitle: string;
};

function QuickLinkCard({ href, emoji, title, subtitle }: QuickLinkCardProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.quickLinkPressable, pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.quickLink}>
          <View style={styles.quickLinkIcon}>
            <ThemedText style={styles.quickLinkEmoji}>{emoji}</ThemedText>
          </View>
          <View style={styles.quickLinkText}>
            <ThemedText type="default" style={styles.quickLinkTitle}>
              {title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          </View>
          <ThemedText themeColor="textSecondary">›</ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Expo
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>

        <QuickLinkCard
          href="/teams"
          emoji="💃"
          title="Ekip Listesi"
          subtitle="Ekipleri görüntüle, düzenle"
        />

        <QuickLinkCard
          href="/dancers"
          emoji="🧑‍🤝‍🧑"
          title="Dansçılar"
          subtitle="Dansçıları görüntüle, ekle"
        />

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  quickLinkPressable: {
    alignSelf: 'stretch',
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,135,247,0.16)',
  },
  quickLinkEmoji: {
    fontSize: 20,
  },
  quickLinkText: {
    flex: 1,
    gap: Spacing.half,
  },
  quickLinkTitle: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
