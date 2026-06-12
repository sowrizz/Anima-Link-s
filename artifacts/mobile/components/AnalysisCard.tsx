import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { MessageAnalysis } from '@workspace/api-client-react';

export function AnalysisCard({ analysis }: { analysis: MessageAnalysis }) {
  const colors = useColors();

  const getScoreColor = (score: number) => {
    if (score < 40) return colors.destructive;
    if (score < 70) return colors.accent;
    return colors.sage;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Feather name="activity" size={14} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.foreground }]}>{analysis.emotion}</Text>
          </View>
          {analysis.distortion ? (
            <View style={[styles.badge, { backgroundColor: colors.accent + '22' }]}>
              <Feather name="alert-circle" size={14} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.accent }]}>{analysis.distortion}</Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor(analysis.msi_score) }]}>
          <Text style={[styles.scoreText, { color: getScoreColor(analysis.msi_score) }]}>
            {analysis.msi_score}
          </Text>
        </View>
      </View>

      <Text style={[styles.msiLabel, { color: colors.mutedForeground }]}>{analysis.msi_label}</Text>

      {analysis.recommended_path && analysis.recommended_path.length > 0 && (
        <View style={styles.pathContainer}>
          <Text style={[styles.pathTitle, { color: colors.foreground }]}>Recommended Path</Text>
          <View style={styles.pathList}>
            {analysis.recommended_path.map((step, index) => (
              <View key={index} style={styles.pathStep}>
                <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.stepText, { color: colors.mutedForeground }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  scoreCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  msiLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  pathContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  pathTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  pathList: {
    gap: 6,
  },
  pathStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
