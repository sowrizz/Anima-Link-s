import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useStoreTinyWin } from '@workspace/api-client-react';

const PRESETS = [
  'Drank water',
  'Took 5 deep breaths',
  'Went for a walk',
  'Replied to an email',
  'Ate a healthy meal',
  'Stretched'
];

export default function TinyWinScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState('');
  const [reward, setReward] = useState<any>(null);

  const storeMutation = useStoreTinyWin();

  const handleComplete = async () => {
    const action = custom.trim() || selected;
    if (!action) return;

    try {
      const res = await storeMutation.mutateAsync({
        data: {
          proof_type: 'Action Taken',
          completed_action: action,
          character: 'Arlo'
        }
      });
      setReward(res);
    } catch (e) {
      console.error(e);
    }
  };

  if (reward) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Feather name="star" size={64} color={colors.sage} style={{ marginBottom: 24 }} />
        <Text style={[styles.title, { color: colors.foreground, textAlign: 'center' }]}>Progress Proof Stored</Text>
        <Text style={[styles.rewardText, { color: colors.sage, textAlign: 'center' }]}>{reward.reward_message}</Text>
        <Pressable 
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 32, width: '100%' }]}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>View home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: 24 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Progress Proof</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 40 }}>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, marginBottom: 24 }]}>
          Every small action becomes evidence your future self can recall.
        </Text>

        <View style={styles.grid}>
          {PRESETS.map((preset, idx) => (
            <Pressable
              key={idx}
              style={[
                styles.presetCard,
                { backgroundColor: selected === preset ? colors.primary : colors.card, borderColor: selected === preset ? colors.primary : colors.border }
              ]}
              onPress={() => { setSelected(preset); setCustom(''); }}
            >
              <Text style={[styles.presetText, { color: selected === preset ? colors.primaryForeground : colors.foreground }]}>
                {preset}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.orText, { color: colors.mutedForeground }]}>OR TYPE YOUR OWN</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
          placeholder="What did you do?"
          placeholderTextColor={colors.mutedForeground}
          value={custom}
          onChangeText={(text) => { setCustom(text); setSelected(''); }}
        />

        <Pressable 
          style={[styles.btn, { backgroundColor: (selected || custom.trim()) ? colors.sage : colors.muted, marginTop: 32 }]}
          onPress={handleComplete}
          disabled={!(selected || custom.trim()) || storeMutation.isPending}
        >
          {storeMutation.isPending ? (
            <ActivityIndicator color={colors.sageForeground} />
          ) : (
            <Text style={[styles.btnText, { color: (selected || custom.trim()) ? colors.sageForeground : colors.mutedForeground }]}>
              Store proof
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  placeholder: { width: 40 },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  presetCard: { width: '48%', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', minHeight: 64 },
  presetText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  orText: { fontSize: 12, fontFamily: 'Inter_700Bold', textAlign: 'center', letterSpacing: 1, marginVertical: 24 },
  input: { height: 56, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter_400Regular' },
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  rewardText: { fontSize: 18, fontFamily: 'Inter_500Medium', marginTop: 16, lineHeight: 26 },
});
