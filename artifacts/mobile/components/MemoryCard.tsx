import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { MemoryItem } from '@workspace/api-client-react';
import { CharacterBadge } from './CharacterBadge';

export function MemoryCard({ memory }: { memory: MemoryItem }) {
  const colors = useColors();
  
  const dateStr = new Date(memory.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {memory.title}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
        </View>
        <CharacterBadge name={memory.character} />
      </View>
      
      <Text style={[styles.summary, { color: colors.foreground }]} numberOfLines={2}>
        {memory.summary}
      </Text>

      {memory.trigger ? (
        <View style={styles.tagRow}>
          <Feather name="zap" size={14} color={colors.accent} />
          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{memory.trigger}</Text>
        </View>
      ) : null}

      {memory.reframe ? (
        <View style={[styles.reframeBox, { backgroundColor: colors.lavender + '22' }]}>
          <Feather name="refresh-cw" size={14} color={colors.primary} style={{ marginTop: 2 }} />
          <Text style={[styles.reframeText, { color: colors.foreground }]}>{memory.reframe}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  summary: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  reframeBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  reframeText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
    lineHeight: 18,
  },
});
