import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { HPBar } from '@/components/HPBar';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useCreateFocusBoss, useStoreTinyWin } from '@workspace/api-client-react';

export default function FocusBossScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [goal, setGoal] = useState('');
  const [bossPlan, setBossPlan] = useState<any>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [reward, setReward] = useState<any>(null);

  const createMutation = useCreateFocusBoss();
  const storeWinMutation = useStoreTinyWin();

  const handleCreate = async () => {
    if (!goal.trim()) return;
    try {
      const res = await createMutation.mutateAsync({ data: { goal: goal.trim() } });
      setBossPlan(res);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStep = (stepIndex: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(stepIndex)) {
      newChecked.delete(stepIndex);
    } else {
      newChecked.add(stepIndex);
    }
    setCheckedSteps(newChecked);
  };

  const handleComplete = async () => {
    if (!bossPlan) return;
    try {
      const res = await storeWinMutation.mutateAsync({
        data: {
          proof_type: 'Focus Boss Defeated',
          completed_action: bossPlan.main_task,
          character: bossPlan.character
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
        <Feather name="award" size={64} color={colors.sage} style={{ marginBottom: 24 }} />
        <Text style={[styles.title, { color: colors.foreground, textAlign: 'center' }]}>Boss Defeated!</Text>
        <Text style={[styles.rewardText, { color: colors.sage, textAlign: 'center' }]}>{reward.reward_message}</Text>
        <Pressable 
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 32, width: '100%' }]}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Return Home</Text>
        </Pressable>
      </View>
    );
  }

  if (!bossPlan) {
    return (
      <KeyboardAwareScrollViewCompat
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Focus Boss</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.inputArea}>
          <Text style={[styles.label, { color: colors.foreground }]}>What's the big task you're avoiding?</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="e.g. Write the quarterly report"
            placeholderTextColor={colors.mutedForeground}
            value={goal}
            onChangeText={setGoal}
            multiline
          />
          <Pressable 
            style={[styles.btn, { backgroundColor: goal.trim() ? colors.primary : colors.muted, marginTop: 24 }]}
            onPress={handleCreate}
            disabled={!goal.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.btnText, { color: goal.trim() ? colors.primaryForeground : colors.mutedForeground }]}>
                Summon Boss
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    );
  }

  const progress = Math.max(0, 100 - (checkedSteps.size / bossPlan.battle_plan.length) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: 24 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Battle</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}>
        <View style={[styles.bossCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.bossName, { color: colors.foreground }]}>{bossPlan.boss_name}</Text>
          <Text style={[styles.bossTask, { color: colors.mutedForeground }]}>{bossPlan.main_task}</Text>
          
          <View style={styles.hpContainer}>
            <Text style={[styles.hpText, { color: colors.foreground }]}>HP</Text>
            <View style={{ flex: 1 }}>
              <HPBar progress={progress} />
            </View>
            <Text style={[styles.hpNum, { color: colors.foreground }]}>{Math.round(progress)}%</Text>
          </View>
        </View>

        <View style={[styles.messageCard, { backgroundColor: colors.primary + '11', borderColor: colors.primary + '33' }]}>
          <Text style={[styles.messageText, { color: colors.primary }]}>"{bossPlan.arlo_message}"</Text>
        </View>

        <Text style={[styles.listTitle, { color: colors.foreground }]}>Battle Plan</Text>
        <View style={styles.checklist}>
          {bossPlan.battle_plan.map((step: any, index: number) => {
            const isChecked = checkedSteps.has(index);
            return (
              <Pressable 
                key={index} 
                style={[styles.checkItem, { backgroundColor: colors.card, borderColor: isChecked ? colors.sage : colors.border }]}
                onPress={() => toggleStep(index)}
              >
                <View style={[styles.checkbox, { backgroundColor: isChecked ? colors.sage : 'transparent', borderColor: isChecked ? colors.sage : colors.border }]}>
                  {isChecked && <Feather name="check" size={14} color={colors.sageForeground} />}
                </View>
                <Text style={[styles.stepText, { color: isChecked ? colors.mutedForeground : colors.foreground, textDecorationLine: isChecked ? 'line-through' : 'none' }]}>
                  {step.action}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {checkedSteps.size === bossPlan.battle_plan.length && (
          <Pressable 
            style={[styles.btn, { backgroundColor: colors.sage, marginTop: 32 }]}
            onPress={handleComplete}
            disabled={storeWinMutation.isPending}
          >
            {storeWinMutation.isPending ? (
              <ActivityIndicator color={colors.sageForeground} />
            ) : (
              <Text style={[styles.btnText, { color: colors.sageForeground }]}>Claim Victory</Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  placeholder: { width: 40 },
  inputArea: { flex: 1, justifyContent: 'center', paddingBottom: 60 },
  label: { fontSize: 20, fontFamily: 'Inter_600SemiBold', marginBottom: 16, lineHeight: 28 },
  input: { minHeight: 120, borderRadius: 16, borderWidth: 1, padding: 16, fontSize: 16, fontFamily: 'Inter_400Regular', textAlignVertical: 'top' },
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  bossCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  bossName: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  bossTask: { fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 20 },
  hpContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hpText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  hpNum: { fontSize: 12, fontFamily: 'Inter_600SemiBold', width: 40, textAlign: 'right' },
  messageCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 32 },
  messageText: { fontSize: 15, fontFamily: 'Inter_500Medium', fontStyle: 'italic', lineHeight: 22 },
  listTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 16 },
  checklist: { gap: 12 },
  checkItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', lineHeight: 22 },
  rewardText: { fontSize: 18, fontFamily: 'Inter_500Medium', marginTop: 16, lineHeight: 26 },
});
