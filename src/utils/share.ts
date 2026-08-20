import { Platform, Share } from 'react-native';

export async function shareText(message: string): Promise<void> {
  if (Platform.OS === 'web') {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;
    if (nav?.share) {
      try {
        await nav.share({ text: message });
      } catch {
        // Kullanıcı paylaşımı iptal etti.
      }
      return;
    }
    if (nav?.clipboard) {
      try {
        await nav.clipboard.writeText(message);
        if (typeof window !== 'undefined') {
          window.alert('Panoya kopyalandı');
        }
      } catch {
        // Tarayıcı panoya yazma izni vermedi.
      }
    }
    return;
  }

  try {
    await Share.share({ message });
  } catch {
    // Kullanıcı paylaşımı iptal etti.
  }
}
