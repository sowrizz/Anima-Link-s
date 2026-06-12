import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGetMemoryGraph, useGetAllMemories } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Line, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const fallbackJourney = [
  { id: 'fb_1', label: 'Exam stress', type: 'trigger', room: 'Elevated stress pattern', emotion: 'high_stress', date: '2026-06-12T09:00:00Z' },
  { id: 'fb_2', label: 'Overgeneralization', type: 'distortion', room: 'Thought pattern', emotion: 'stress', date: '2026-06-12T09:05:00Z' },
  { id: 'fb_3', label: 'Nova reframe', type: 'reframe', room: 'Support mode', emotion: 'recovery', date: '2026-06-12T09:10:00Z' },
  { id: 'fb_4', label: '5-minute sprint', type: 'action', room: 'Focus session', emotion: 'focus', date: '2026-06-12T09:15:00Z' },
  { id: 'fb_5', label: 'Progress proof', type: 'tiny_win', room: 'Proof memory', emotion: 'recovery', date: '2026-06-12T09:20:00Z' },
];

export default function MemoryMapScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const { data: graph, isLoading } = useGetMemoryGraph();
  const { data: allMemories } = useGetAllMemories();
  
  const nodes = graph?.nodes?.length ? graph.nodes : fallbackJourney;

  // Selected node state - default to first node ID
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || null);

  const getNodeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'distortion': return colors.destructive;
      case 'reframe': return colors.lavender;
      case 'tiny_win': return colors.sage;
      case 'action': return colors.dustyBlue;
      default: return colors.primary;
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'distortion': return 'alert-triangle';
      case 'reframe': return 'refresh-cw';
      case 'tiny_win': return 'check-circle';
      case 'action': return 'play-circle';
      default: return 'zap';
    }
  };

  const graphWidth = screenWidth - 48; // Clearance for padding

  // Calculate staggered node coordinates
  const nodeCoords = useMemo(() => {
    return nodes.map((_, i) => {
      const isLeft = i % 2 === 0;
      const x = isLeft ? graphWidth * 0.28 : graphWidth * 0.72;
      const y = i * 130 + 60;
      return { x, y };
    });
  }, [nodes, graphWidth]);

  const handleNodePress = (node: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedNodeId(node.id);
  };

  // Resolve details of the selected node
  const selectedNode = useMemo(() => {
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return nodes[0];
    return node;
  }, [selectedNodeId, nodes]);

  const associatedMemory = useMemo(() => {
    if (!selectedNode?.id) return null;
    return allMemories?.memories?.find(m => m.id === selectedNode.id || m.title === selectedNode.label);
  }, [selectedNode, allMemories]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dateStr = selectedNode?.date 
    ? new Date(selectedNode.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Recent';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Memory Map</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Obsidian network of triggers, reframes & proofs
          </Text>
        </View>
      </View>

      {/* Main Canvas Scroll Area */}
      <ScrollView 
        style={styles.canvasContainer} 
        contentContainerStyle={{ height: nodes.length * 130 + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.canvasFrame, { width: graphWidth }]}>
          <Svg height={nodes.length * 130 + 100} width={graphWidth} style={StyleSheet.absoluteFill}>
            {/* Background Grid Pattern mock */}
            
            {/* Draw Dotted Lines */}
            {nodes.map((_, i) => {
              if (i === nodes.length - 1) return null;
              const from = nodeCoords[i];
              const to = nodeCoords[i + 1];
              return (
                <Line
                  key={`line-${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={colors.border}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Junction dots */}
            {nodeCoords.map((coord, i) => (
              <Circle
                key={`circle-${i}`}
                cx={coord.x}
                cy={coord.y}
                r="4"
                fill={colors.border}
              />
            ))}
          </Svg>

          {/* Staggered Node Cards */}
          {nodes.map((node: any, i: number) => {
            const coords = nodeCoords[i];
            const isSelected = selectedNodeId === node.id || (selectedNodeId === null && i === 0);
            const color = getNodeColor(node.type);

            return (
              <Pressable
                key={node.id ?? `${node.label}-${i}`}
                style={[
                  styles.nodeCard,
                  {
                    top: coords.y - 35,
                    left: coords.x - 70,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '0a' : colors.card,
                    borderWidth: isSelected ? 2 : 1,
                  }
                ]}
                onPress={() => handleNodePress(node)}
              >
                <Text style={[styles.nodeCardLabel, { color: colors.foreground }]} numberOfLines={2}>
                  {node.label}
                </Text>
                <View style={styles.nodeCardFooter}>
                  <View style={[styles.nodeIndicatorDot, { backgroundColor: color }]} />
                  <Text style={[styles.nodeCardType, { color: colors.mutedForeground }]}>
                    {node.type.replace('_', ' ')}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Selected Node Details Drawer */}
      <View 
        style={[
          styles.drawer, 
          { 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom + 16, 24)
          }
        ]}
      >
        <View style={styles.drawerHeader}>
          <View style={[styles.drawerIconBox, { backgroundColor: getNodeColor(selectedNode?.type) + '1a' }]}>
            <Feather name={getNodeIcon(selectedNode?.type)} size={18} color={getNodeColor(selectedNode?.type)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.drawerTitle, { color: colors.foreground }]}>{selectedNode?.label}</Text>
            <Text style={[styles.drawerMeta, { color: colors.mutedForeground }]}>
              {selectedNode?.type.toUpperCase()} · {dateStr}
            </Text>
          </View>
        </View>

        <View style={[styles.drawerContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {associatedMemory ? (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 110 }}>
              {associatedMemory.trigger ? (
                <Text style={[styles.drawerText, { color: colors.foreground, marginBottom: 8 }]}>
                  <Text style={{ fontFamily: 'Inter_700Bold' }}>Trigger Context: </Text>
                  {associatedMemory.trigger}
                </Text>
              ) : null}
              {associatedMemory.reframe ? (
                <Text style={[styles.drawerText, { color: colors.foreground, marginBottom: 8 }]}>
                  <Text style={{ fontFamily: 'Inter_700Bold', color: colors.primary }}>Reframe: </Text>
                  {associatedMemory.reframe}
                </Text>
              ) : null}
              <Text style={[styles.drawerText, { color: colors.mutedForeground }]}>
                {associatedMemory.summary || 'Context stored in local vector index.'}
              </Text>
            </ScrollView>
          ) : (
            <Text style={[styles.drawerText, { color: colors.mutedForeground }]}>
              This node represents an active checkpoint in your study coping journey. It anchors your strategy history against overgeneralization behaviors.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, gap: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', lineHeight: 30 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 2 },
  canvasContainer: { flex: 1 },
  canvasFrame: { alignSelf: 'center', position: 'relative' },
  nodeCard: {
    position: 'absolute',
    width: 140,
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  nodeCardLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    lineHeight: 16,
  },
  nodeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nodeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nodeCardType: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
  },
  drawer: {
    borderTopWidth: 1,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  drawerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    lineHeight: 22,
  },
  drawerMeta: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  drawerContent: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  drawerText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
  },
});
