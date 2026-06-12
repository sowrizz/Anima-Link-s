import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGetWeeklyReport } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';

export default function ReportScreen() {
  const colors = useColors();
  const { data: report, isLoading } = useGetWeeklyReport();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>No report available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      
      <View style={[styles.summaryCard, { backgroundColor: colors.primary + '11', borderColor: colors.primary + '33' }]}>
        <Text style={[styles.periodText, { color: colors.primary }]}>{report.period}</Text>
        <Text style={[styles.summaryText, { color: colors.foreground }]}>{report.progress_summary}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{report.total_sessions}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Sessions</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.sage }]}>{report.tiny_wins_count}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tiny Wins</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.accent }]}>{report.thought_battles_won}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Battles Won</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{report.msi_average}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Avg MSI</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Insights</Text>
      <View style={styles.insightsList}>
        <View style={[styles.insightItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>Dominant Emotion</Text>
          <Text style={[styles.insightValue, { color: colors.foreground }]}>{report.dominant_emotion}</Text>
        </View>
        <View style={[styles.insightItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>Common Distortion</Text>
          <Text style={[styles.insightValue, { color: colors.accent }]}>{report.most_common_distortion}</Text>
        </View>
        <View style={[styles.insightItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>Effective Character</Text>
          <Text style={[styles.insightValue, { color: colors.primary }]}>{report.most_effective_character}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Recommendations</Text>
      <View style={styles.recsList}>
        {report.recommendations.map((rec, idx) => (
          <View key={idx} style={styles.recItem}>
            <View style={[styles.recDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.recText, { color: colors.foreground }]}>{rec}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  summaryCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  periodText: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 8, letterSpacing: 1 },
  summaryText: { fontSize: 16, fontFamily: 'Inter_500Medium', lineHeight: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  statBox: { width: '48%', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 32, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  statLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 16 },
  insightsList: { gap: 12 },
  insightItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1 },
  insightLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  insightValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  recsList: { gap: 12 },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  recDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  recText: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
});
