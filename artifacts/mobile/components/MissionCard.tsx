import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface MissionCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  guide: string;
  description: string;
  aiType?: string;
  bestFor?: string;
  onPress: () => void;
}

const guideIcons: Record<string, keyof typeof Feather.glyphMap> = {
  Sera: 'heart',
  Kael: 'shield',
  Nova: 'edit-3',
  Zen: 'wind',
  Arlo: 'flag',
};

export function MissionCard({ icon, title, guide, description, aiType, bestFor, onPress }: MissionCardProps) {
  const colors = useColors();

  const getCharacterColor = (char: string) => {
    switch (char.toLowerCase()) {
      case 'sera': return colors.sera;
      case 'kael': return colors.kael;
      case 'nova': return colors.nova;
      case 'zen': return colors.zen;
      case 'arlo': return colors.arlo;
      default: return colors.primary;
    }
  };

  const cardColor = getCharacterColor(guide);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: cardColor + '12', 
          borderColor: cardColor + '40' 
        },
        pressed && { opacity: 0.82, transform: [{ scale: 0.99 }] },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: cardColor + '24' }]}>
          <Feather name={icon} size={20} color={cardColor} />
        </View>
        <View style={[styles.guidePill, { backgroundColor: cardColor + '18' }]}>
          <Feather name={guideIcons[guide] ?? 'user'} size={12} color={cardColor} />
          <Text style={[styles.guideText, { color: cardColor }]}>{guide}</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>

      {aiType ? <Text style={[styles.meta, { color: cardColor }]}>AI: {aiType}</Text> : null}
      {bestFor ? <Text style={[styles.meta, { color: colors.mutedForeground }]}>Best for: {bestFor}</Text> : null}

      <View style={styles.footer}>
        <Text style={[styles.startText, { color: cardColor }]}>Start</Text>
        <Feather name="arrow-right" size={16} color={cardColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    minHeight: 204,
    justifyContent: 'space-between',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  guidePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999 },
  guideText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  title: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 6, lineHeight: 22 },
  description: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, marginBottom: 10 },
  meta: { fontSize: 11, fontFamily: 'Inter_600SemiBold', lineHeight: 16, marginBottom: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  startText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
