import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSearchMemory, useGetAllMemories } from '@workspace/api-client-react';
import { MemoryCard } from '@/components/MemoryCard';
import { useRouter } from 'expo-router';

const CATEGORIES = ['All', 'Exam Stress', 'Meetings', 'Focus Wins', 'Reframes', 'Tiny Wins'];

export default function MemoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  
  const { data: allMemories, isLoading: allLoading } = useGetAllMemories();
  const searchMutation = useSearchMemory();

  const handleSearch = () => {
    if (!query.trim()) return;
    searchMutation.mutate({ data: { query: query.trim(), category: category !== 'All' ? category : undefined } });
  };

  const isSearching = searchMutation.isPending;
  const searchResults = searchMutation.data?.results;
  
  // Decide what to show
  const displayData = query && searchResults ? searchResults : (allMemories?.memories || []);
  const isLoading = allLoading || isSearching;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.foreground }]}>Memory Core</Text>
          <Pressable 
            style={[styles.mapBtn, { backgroundColor: colors.primary + '22' }]}
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
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); searchMutation.reset(); }}>
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
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.chip,
                  { 
                    backgroundColor: category === item ? colors.primary : colors.card,
                    borderColor: category === item ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setCategory(item)}
              >
                <Text style={[
                  styles.chipText,
                  { color: category === item ? colors.primaryForeground : colors.foreground }
                ]}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </View>
        <Pressable
          style={[styles.graphPreview, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}
          onPress={() => router.push('/memory-map')}
        >
          <View style={styles.graphLine}>
            {['Trigger', 'Pattern', 'Reframe', 'Proof'].map((node, index) => (
              <View key={node} style={styles.graphNodeWrap}>
                <View style={[styles.graphDot, { backgroundColor: index === 3 ? colors.sage : colors.primary }]} />
                <Text style={[styles.graphNodeText, { color: colors.foreground }]}>{node}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.graphHint, { color: colors.mutedForeground }]}>Exam stress {'->'} overgeneralization {'->'} Nova reframe {'->'} progress proof</Text>
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
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  graphLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  graphNodeWrap: {
    alignItems: 'center',
    flex: 1,
  },
  graphDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  graphNodeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  graphHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
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
