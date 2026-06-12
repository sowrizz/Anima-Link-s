import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { MissionCard } from '@/components/MissionCard';
import { useRouter } from 'expo-router';

export default function MissionsScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Missions</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Interactive exercises to build resilience and focus.
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.gridRow}>
          <MissionCard 
            icon="target" 
            title="Thought Challenge" 
            guide="Nova" 
            description="Battle cognitive distortions and reframe negative thoughts." 
            onPress={() => router.push('/games/thought-monster')} 
          />
          <MissionCard 
            icon="clock" 
            title="Focus Session" 
            guide="Arlo" 
            description="Break down a large task into a battle plan and execute." 
            onPress={() => router.push('/games/focus-boss')} 
          />
        </View>
        <View style={styles.gridRow}>
          <MissionCard 
            icon="camera" 
            title="Workspace Grounding" 
            guide="Arlo" 
            description="Scan your environment to find focus and organization." 
            onPress={() => router.push('/games/camera-mission')} 
          />
          <MissionCard 
            icon="sun" 
            title="Mood Reset" 
            guide="Kael" 
            description="Quick breathing and grounding to lower anxiety." 
            onPress={() => {}} 
          />
        </View>
        <View style={styles.gridRow}>
          <MissionCard 
            icon="message-square" 
            title="Response Practice" 
            guide="Zen" 
            description="Roleplay difficult conversations in a safe environment." 
            onPress={() => {}} 
          />
          <MissionCard 
            icon="award" 
            title="Tiny Wins" 
            guide="Arlo" 
            description="Log small victories to build your proof database." 
            onPress={() => router.push('/games/tiny-win')} 
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
});
