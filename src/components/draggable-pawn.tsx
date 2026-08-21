import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export const PAWN_SIZE = 44;

type DraggablePawnProps = {
  label: string;
  color: string;
  initialX: number; // 0..1, relative to stage width
  initialY: number; // 0..1, relative to stage height
  stageWidth: number;
  stageHeight: number;
  onPositionChange: (relX: number, relY: number) => void;
};

export function DraggablePawn({
  label,
  color,
  initialX,
  initialY,
  stageWidth,
  stageHeight,
  onPositionChange,
}: DraggablePawnProps) {
  const maxX = Math.max(0, stageWidth - PAWN_SIZE);
  const maxY = Math.max(0, stageHeight - PAWN_SIZE);
  const translateX = useSharedValue(initialX * stageWidth - PAWN_SIZE / 2);
  const translateY = useSharedValue(initialY * stageHeight - PAWN_SIZE / 2);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  function commitPosition(x: number, y: number) {
    const clampedX = Math.min(Math.max(x, 0), maxX);
    const clampedY = Math.min(Math.max(y, 0), maxY);
    const relX = stageWidth > 0 ? (clampedX + PAWN_SIZE / 2) / stageWidth : 0;
    const relY = stageHeight > 0 ? (clampedY + PAWN_SIZE / 2) / stageHeight : 0;
    onPositionChange(relX, relY);
  }

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = Math.min(Math.max(startX.value + event.translationX, 0), maxX);
      translateY.value = Math.min(Math.max(startY.value + event.translationY, 0), maxY);
    })
    .onEnd(() => {
      runOnJS(commitPosition)(translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.pawn, { backgroundColor: color }, animatedStyle]}>
        <ThemedText style={styles.label}>{label}</ThemedText>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pawn: {
    position: 'absolute',
    width: PAWN_SIZE,
    height: PAWN_SIZE,
    borderRadius: PAWN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  label: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
});
