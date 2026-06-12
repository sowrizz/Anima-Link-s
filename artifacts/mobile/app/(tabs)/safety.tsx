import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSafetyCheck } from '@workspace/api-client-react';

export default function SafetyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  
  const safetyMutation = useSafetyCheck();
  const [result, setResult] = useState<any>(null);

  const handleCheck = async () => {
    if (!input.trim()) return;
    try {
      const res = await safetyMutation.mutateAsync({ data: { message: input.trim() } });
      setResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const renderStatus = () => {
    if (!result) return null;

    let bg, color, icon;
    if (result.risk_level === 'high') {
      bg = colors.destructive + '22';
      color = colors.destructive;
      icon = 'alert-triangle';
    } else if (result.risk_level === 'medium') {
      bg = colors.accent + '22';
      color = colors.accent;
      icon = 'alert-circle';
    } else {
      bg = colors.sage + '22';
      color = colors.sage;
      icon = 'check-circle';
    }

    return (
      <View style={[styles.resultCard, { backgroundColor: bg, borderColor: color, borderWidth: 1 }]}>
        <View style={styles.resultHeader}>
          <Feather name={icon as any} size={24} color={color} />
          <Text style={[styles.resultTitle, { color }]}>{result.risk_level.toUpperCase()} RISK</Text>
        </View>
        <Text style={[styles.resultText, { color: colors.foreground }]}>{result.message}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Safety Check</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Type what you're thinking. Anima will assess the risk and guide you.
          </Text>
        </View>

        <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="I'm feeling..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            textAlignVertical="top"
          />
          <Pressable 
            style={[styles.btn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
            onPress={handleCheck}
            disabled={!input.trim() || safetyMutation.isPending}
          >
            {safetyMutation.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.btnText, { color: input.trim() ? colors.primaryForeground : colors.mutedForeground }]}>Check</Text>
            )}
          </Pressable>
        </View>

        {renderStatus()}

        <View style={styles.resourcesSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Crisis Resources</Text>
          <Pressable style={[styles.resourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.destructive + '22' }]}>
              <Feather name="phone" size={20} color={colors.destructive} />
            </View>
            <View style={styles.resourceText}>
              <Text style={[styles.resTitle, { color: colors.foreground }]}>iCall Helpline</Text>
              <Text style={[styles.resNumber, { color: colors.destructive }]}>9152987821</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          <Pressable style={[styles.resourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.destructive + '22' }]}>
              <Feather name="phone" size={20} color={colors.destructive} />
            </View>
            <View style={styles.resourceText}>
              <Text style={[styles.resTitle, { color: colors.foreground }]}>Vandrevala Foundation</Text>
              <Text style={[styles.resNumber, { color: colors.destructive }]}>1860-2662-345</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
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
  inputBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  input: {
    height: 120,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  btn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  resultCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  resultText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  resourcesSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceText: {
    flex: 1,
  },
  resTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  resNumber: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
