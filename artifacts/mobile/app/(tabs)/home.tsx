import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/app/context/AppContext';
import { useHealthCheck, useGetAllMemories } from '@workspace/api-client-react';
import { useRouter as useExpoRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useExpoRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userName } = useAppContext();
  
  const { data: health, isLoading: healthLoading } = useHealthCheck();
  const { data: memories } = useGetAllMemories();

  const latestMemory = memories?.memories?.[0];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.foreground }]}>Good evening, {userName}</Text>
      </View>

      <View style={styles.section}>
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusTitle, { color: colors.foreground }]}>Anima State</Text>
            {healthLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: health?.status === 'ok' ? colors.sage + '22' : colors.destructive + '22' }]}>
                <View style={[styles.statusDot, { backgroundColor: health?.status === 'ok' ? colors.sage : colors.destructive }]} />
                <Text style={[styles.statusText, { color: health?.status === 'ok' ? colors.sage : colors.destructive }]}>
                  {health?.status === 'ok' ? 'Online' : 'Offline'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.grid}>
          <Pressable style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/chat')}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '22' }]}>
              <Feather name="message-circle" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.gridText, { color: colors.foreground }]}>Chat</Text>
          </Pressable>
          <Pressable style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/voice-room')}>
            <View style={[styles.iconBox, { backgroundColor: colors.accent + '22' }]}>
              <Feather name="mic" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.gridText, { color: colors.foreground }]}>Voice Room</Text>
          </Pressable>
          <Pressable style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/missions')}>
            <View style={[styles.iconBox, { backgroundColor: colors.sage + '22' }]}>
              <Feather name="target" size={24} color={colors.sage} />
            </View>
            <Text style={[styles.gridText, { color: colors.foreground }]}>Missions</Text>
          </Pressable>
          <Pressable style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/memory')}>
            <View style={[styles.iconBox, { backgroundColor: colors.lavender + '22' }]}>
              <Feather name="database" size={24} color={colors.lavender} />
            </View>
            <Text style={[styles.gridText, { color: colors.foreground }]}>Memory</Text>
          </Pressable>
        </View>
      </View>

      {latestMemory && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Last Strategy</Text>
          <Pressable style={[styles.memoryCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/memory')}>
            <Text style={[styles.memoryTitle, { color: colors.foreground }]}>{latestMemory.title}</Text>
            <Text style={[styles.memorySummary, { color: colors.mutedForeground }]} numberOfLines={2}>
              {latestMemory.summary}
            </Text>
            {latestMemory.reframe && (
              <View style={[styles.reframeBox, { backgroundColor: colors.lavender + '22' }]}>
                <Feather name="refresh-cw" size={14} color={colors.primary} />
                <Text style={[styles.reframeText, { color: colors.primary }]} numberOfLines={1}>{latestMemory.reframe}</Text>
              </View>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  statusCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  memoryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  memoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  memorySummary: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  reframeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  reframeText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
});
