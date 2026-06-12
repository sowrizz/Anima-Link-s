import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGetMemoryGraph } from '@workspace/api-client-react';

export default function MemoryMapScreen() {
  const colors = useColors();
  const { data: graph, isLoading } = useGetMemoryGraph();

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'distortion': return colors.accent;
      case 'reframe': return colors.lavender;
      case 'tiny_win': return colors.sage;
      default: return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !graph ? (
        <View style={styles.center}>
          <Text style={{ color: colors.foreground }}>Could not load memory graph.</Text>
        </View>
      ) : (
        <ScrollView horizontal>
          <ScrollView contentContainerStyle={styles.graphContainer}>
            {/* Simple View-based graph visualization since SVG is not requested */}
            {graph.nodes.map((node, i) => {
              const x = 50 + (i * 120);
              const y = 100 + (Math.sin(i) * 60);
              const color = getNodeColor(node.type);

              return (
                <View 
                  key={node.id} 
                  style={[
                    styles.node, 
                    { 
                      left: x, top: y, 
                      backgroundColor: color + '22',
                      borderColor: color 
                    }
                  ]}
                >
                  <View style={[styles.nodeDot, { backgroundColor: color }]} />
                  <Text style={[styles.nodeLabel, { color: colors.foreground }]} numberOfLines={2}>
                    {node.label}
                  </Text>
                  <Text style={[styles.nodeDate, { color: colors.mutedForeground }]}>{node.date}</Text>
                </View>
              );
            })}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  graphContainer: { width: 1000, height: 600, position: 'relative' },
  node: {
    position: 'absolute',
    width: 100,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  nodeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  nodeLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  nodeDate: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
});
