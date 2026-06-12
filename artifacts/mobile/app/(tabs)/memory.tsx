import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useGetAllMemories } from '@workspace/api-client-react';
import { MemoryCard } from '@/components/MemoryCard';
import { useRouter } from 'expo-router';
import Svg, { Circle, Line } from 'react-native-svg';

const CATEGORIES = ['All', 'Exam Stress', 'Meetings', 'Focus Wins', 'Reframes', 'Tiny Wins'];

export default function MemoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  
  const { data: allMemories, isLoading } = useGetAllMemories();

  const displayData = useMemo(() => {
    let list = allMemories?.memories || [];
    
    // Filter by Category Chip
    if (category !== 'All') {
      const catLower = category.toLowerCase();
      list = list.filter((m) => {
        const trigger = (m.trigger || '').toLowerCase();
        const summary = (m.summary || '').toLowerCase();
        const title = (m.title || '').toLowerCase();
        
        if (catLower === 'exam stress') {
          return trigger.includes('exam') || trigger.includes('test') || summary.includes('exam') || summary.includes('test');
        }
        if (catLower === 'meetings') {
          return trigger.includes('meeting') || summary.includes('meeting');
        }
        if (catLower === 'focus wins') {
          return trigger.includes('focus') || summary.includes('focus') || title.includes('win') || summary.includes('win');
        }
        if (catLower === 'reframes') {
          return (m.reframe && m.reframe.trim().length > 0) || title.includes('reframe');
        }
        if (catLower === 'tiny wins') {
          return title.includes('win') || summary.includes('win');
        }
        return false;
      });
    }

    // Filter by Search Query
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) => {
        return (
          (m.title || '').toLowerCase().includes(q) ||
          (m.summary || '').toLowerCase().includes(q) ||
          (m.reframe || '').toLowerCase().includes(q) ||
          (m.trigger || '').toLowerCase().includes(q) ||
          (m.character || '').toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [allMemories, category, query]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.foreground }]}>Memory Core</Text>
          <Pressable 
            style={[styles.mapBtn, { backgroundColor: colors.primary + '1a' }]}
            onPress={() => router.push('/memory-map')}
          >
            <Feather name="git-merge" size={16} color={colors.primary} />
            <Text style={[styles.mapBtnText, { color: colors.primary }]}>Map</Text>
          </Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search your proof database..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <View style={styles.chipsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={item => item}
            renderItem={({ item }) => {
              const isActive = category === item;
              return (
                <Pressable
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: isActive ? colors.primary : colors.card,
                      borderColor: isActive ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => setCategory(item)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: isActive ? colors.primaryForeground : colors.foreground }
                  ]}>
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        <Pressable
          style={[styles.graphPreview, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/memory-map')}
        >
          <Text style={[styles.graphPreviewTitle, { color: colors.foreground }]}>Interactive Memory Map</Text>
          <Text style={[styles.graphPreviewSubtitle, { color: colors.mutedForeground }]}>Tap to open Obsidian-style thought connections</Text>
          
          <View style={[styles.miniCanvas, { backgroundColor: colors.background }]}>
            <Svg height="64" width="100%">
              {/* Connected Dotted Lines */}
              <Line x1="10%" y1="32" x2="30%" y2="16" stroke={colors.primary} strokeWidth="1.5" strokeDasharray="3,3" />
              <Line x1="30%" y1="16" x2="50%" y2="48" stroke={colors.primary} strokeWidth="1.5" strokeDasharray="3,3" />
              <Line x1="50%" y1="48" x2="70%" y2="20" stroke={colors.primary} strokeWidth="1.5" strokeDasharray="3,3" />
              <Line x1="70%" y1="20" x2="90%" y2="38" stroke={colors.sage} strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Node Circles */}
              <Circle cx="10%" cy="32" r="6" fill={colors.accent} />
              <Circle cx="30%" cy="16" r="6" fill={colors.kael} />
              <Circle cx="50%" cy="48" r="6" fill={colors.nova} />
              <Circle cx="70%" cy="20" r="6" fill={colors.arlo} />
              <Circle cx="90%" cy="38" r="6" fill={colors.sage} />
            </Svg>
          </View>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : displayData.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={48} color={colors.border} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No memories found.</Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MemoryCard memory={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  mapBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  chipsContainer: {
    marginHorizontal: -24,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 16,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  graphPreview: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  graphPreviewTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  graphPreviewSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  miniCanvas: {
    height: 64,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3ddd4',
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});
