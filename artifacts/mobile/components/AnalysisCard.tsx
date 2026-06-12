import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { MessageAnalysis } from '@workspace/api-client-react';

export function AnalysisCard({ analysis }: { analysis: MessageAnalysis }) {
  const colors = useColors();
  const words = analysis.absolutist_words?.length ? analysis.absolutist_words.join(', ') : 'none detected';
  const path = analysis.recommended_path?.length ? analysis.recommended_path.join(' -> ') : 'Reflect -> Act';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Insight</Text>
        <View style={[styles.scorePill, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.scoreText, { color: colors.primary }]}>MSI {analysis.msi_score}</Text>
        </View>
      </View>

      <View style={styles.rows}>
        <InsightRow icon="activity" label="Mood" value={analysis.emotion || analysis.msi_label} color={colors.primary} />
        <InsightRow icon="type" label="Language pattern" value={words} color={colors.accent} />
        <InsightRow icon="refresh-cw" label="Thought pattern" value={analysis.distortion || 'no distortion flagged'} color={colors.sage} />
        <InsightRow icon="map-pin" label="Trigger" value={analysis.trigger || 'current context'} color={colors.dustyBlue} />
        <InsightRow icon="git-branch" label="Suggested path" value={path} color={colors.primary} />
      </View>
    </View>
  );
}

function InsightRow({ icon, label, value, color }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; color: string }) {
  const colors = useColors();

  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: color + '18' }]}>
        <Feather name={icon} size={13} color={color} />
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, padding: 16, borderWidth: 1, marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  scorePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  scoreText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  rows: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  rowIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  label: { width: 116, fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', lineHeight: 18 },
  value: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 18 },
});
