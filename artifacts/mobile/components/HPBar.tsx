import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface HPBarProps {
  progress: number; // 0 to 100
  height?: number;
}

export function HPBar({ progress, height = 12 }: HPBarProps) {
  const colors = useColors();
  const widthAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [progress, widthAnim]);

  const widthPercent = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const getBarColor = () => {
    if (progress > 50) return colors.sage;
    if (progress > 20) return colors.accent;
    return colors.destructive;
  };

  return (
    <View style={[styles.container, { height, backgroundColor: colors.muted }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthPercent,
            backgroundColor: getBarColor(),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
});
