import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGetMemoryGraph } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';

const fallbackJourney = [
  { label: 'Exam stress', type: 'trigger', room: 'Elevated stress pattern' },
  { label: 'Overgeneralization', type: 'distortion', room: 'Thought pattern' },
  { label: 'Nova reframe', type: 'reframe', room: 'Support mode' },
  { label: '5-minute sprint', type: 'action', room: 'Focus session' },
  { label: 'Progress proof', type: 'tiny_win', room: 'Proof memory' },
];

export default function MemoryMapScreen() {
  const colors = useColors();
  const { data: graph, isLoading } = useGetMemoryGraph();
  const nodes = graph?.nodes?.length ? graph.nodes : fallbackJourney;

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'distortion': return colors.accent;
      case 'reframe': return colors.lavender;
      case 'tiny_win': return colors.sage;
      case 'action': return colors.dustyBlue;
      default: return colors.primary;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.foreground }]}>Memory Map</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        The journey from trigger to reframe to progress proof.
      </Text>

      <View style={[styles.timeline, { borderColor: colors.border }]}>
        {nodes.map((node: any, index: number) => {
          const color = getNodeColor(node.type);
          return (
            <View key={node.id ?? `${node.label}-${index}`} style={styles.step}>
              <View style={styles.markerColumn}>
                <View style={[styles.marker, { backgroundColor: color }]} />
                {index < nodes.length - 1 ? <View style={[styles.connector, { backgroundColor: colors.border }]} /> : null}
              </View>
              <View style={[styles.nodeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.nodeHeader}>
                  <Text style={[styles.nodeLabel, { color: colors.foreground }]}>{node.label}</Text>
                  <Feather name="arrow-right" size={16} color={color} />
                </View>
                <Text style={[styles.nodeType, { color }]}>{node.room ?? node.type}</Text>
                {node.date ? <Text style={[styles.nodeDate, { color: colors.mutedForeground }]}>{node.date}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.roomsCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
        <Text style={[styles.roomsTitle, { color: colors.foreground }]}>Memory rooms</Text>
        <Text style={[styles.roomsText, { color: colors.mutedForeground }]}>
          Elevated stress pattern · Focus forest · Proof mountain · Breakthrough gallery
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 31, fontFamily: 'Inter_700Bold', lineHeight: 38, marginBottom: 8 },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 23, marginBottom: 24 },
  timeline: { borderRadius: 8 },
  step: { flexDirection: 'row', gap: 14 },
  markerColumn: { alignItems: 'center' },
  marker: { width: 14, height: 14, borderRadius: 7, marginTop: 18 },
  connector: { width: 2, flex: 1, minHeight: 58 },
  nodeCard: { flex: 1, borderRadius: 8, borderWidth: 1, padding: 16, marginBottom: 12 },
  nodeHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  nodeLabel: { flex: 1, fontSize: 17, fontFamily: 'Inter_700Bold', lineHeight: 22 },
  nodeType: { fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', marginTop: 8 },
  nodeDate: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  roomsCard: { borderRadius: 8, borderWidth: 1, padding: 16, marginTop: 10 },
  roomsTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  roomsText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
});
