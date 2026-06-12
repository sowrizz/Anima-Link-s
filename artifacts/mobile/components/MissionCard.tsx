import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { CharacterBadge } from './CharacterBadge';

interface MissionCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  guide: string;
  description: string;
  onPress: () => void;
}

export function MissionCard({ icon, title, guide, description, onPress }: MissionCardProps) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '22' }]}>
          <Feather name={icon} size={20} color={colors.primary} />
        </View>
        <CharacterBadge name={guide} />
      </View>
      
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
        {description}
      </Text>
      
      <View style={[styles.startButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.startText, { color: colors.primaryForeground }]}>Start</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    marginBottom: 16,
  },
  startButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
