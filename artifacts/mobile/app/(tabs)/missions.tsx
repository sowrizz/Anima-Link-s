import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { MissionCard } from '@/components/MissionCard';
import { useRouter } from 'expo-router';

const missions = [
  {
    icon: 'edit-3',
    title: 'Thought Challenge',
    guide: 'Nova',
    description: 'Separate a stressful thought from the facts and build a safer reframe.',
    aiType: 'CBT pattern + memory recall',
    bestFor: '"never" or "always" thoughts',
    href: '/games/thought-monster',
  },
  {
    icon: 'clock',
    title: 'Focus Session',
    guide: 'Arlo',
    description: 'Turn avoidance into a tiny checklist with a timer and proof capture.',
    aiType: 'goal breakdown',
    bestFor: 'stuck or distracted',
    href: '/games/focus-boss',
  },
  {
    icon: 'camera',
    title: 'Camera Grounding',
    guide: 'Kael',
    description: 'Use your room or desk to identify one concrete stabilizing action.',
    aiType: 'workspace object labels',
    bestFor: 'returning to the room',
    href: '/games/camera-mission',
  },
  {
    icon: 'wind',
    title: 'Mood Reset',
    guide: 'Zen',
    description: 'A short breathing and grounding sequence for the current state.',
    aiType: 'state routing',
    bestFor: 'quick reset',
    href: '/voice-room',
  },
  {
    icon: 'message-square',
    title: 'Response Practice',
    guide: 'Nova',
    description: 'Practice a hard message or conversation before sending it.',
    aiType: 'roleplay response',
    bestFor: 'meetings and conflict',
    href: '/games/response-practice',
  },
  {
    icon: 'check-square',
    title: 'Progress Proof',
    guide: 'Arlo',
    description: 'Store a small win so the memory graph has evidence for next time.',
    aiType: 'memory write',
    bestFor: 'building proof',
    href: '/games/tiny-win',
  },
  {
    icon: 'git-merge',
    title: 'Memory Map',
    guide: 'Sera',
    description: 'Review the path from trigger to reframe to progress proof.',
    aiType: 'graph recall',
    bestFor: 'seeing patterns',
    href: '/memory-map',
  },
  {
    icon: 'mic',
    title: 'Voice Shortcuts',
    guide: 'Kael',
    description: 'Speak a need and route it to chat, reset, challenge, or focus.',
    aiType: 'transcript routing',
    bestFor: 'hands-free support',
    href: '/voice-room',
  },
] as const;

export default function MissionsScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Guided Missions</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Small guided actions for stress, focus, voice, memory, and reflection.
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 108 }]} showsVerticalScrollIndicator={false}>
        {missions.map((mission) => (
          <MissionCard
            key={mission.title}
            icon={mission.icon}
            title={mission.title}
            guide={mission.guide}
            description={mission.description}
            aiType={mission.aiType}
            bestFor={mission.bestFor}
            onPress={() => router.push(mission.href)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 14 },
  title: { fontSize: 31, fontFamily: 'Inter_700Bold', marginBottom: 8, lineHeight: 37 },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 23 },
  content: { paddingHorizontal: 24, gap: 14 },
});
