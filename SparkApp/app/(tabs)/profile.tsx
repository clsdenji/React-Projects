import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface ParkingRecord {
  id: string;
  name: string;
  location: string;
  date?: string; // For history
}

// Mock data
const previousParking: ParkingRecord[] = [
  { id: '1', name: 'Parking Lot A', location: 'Makati', date: '2025-09-28 14:30' },
  { id: '2', name: 'Parking Lot B', location: 'Quezon City', date: '2025-09-27 09:15' },
];

const savedParking: ParkingRecord[] = [
  { id: '3', name: 'Parking Lot C', location: 'Pasig' },
  { id: '4', name: 'Parking Lot D', location: 'Taguig' },
];

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');

  const data = activeTab === 'history' ? previousParking : savedParking;

  const renderItem = ({ item }: { item: ParkingRecord }) => {
    const scaleAnim = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPress={() => console.log('Clicked', item.name)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <BlurView intensity={50} tint="dark" style={styles.blurCard}>
            <Text style={styles.parkingName}>{item.name}</Text>
            <Text style={styles.parkingLocation}>{item.location}</Text>
            {item.date && <Text style={styles.parkingDate}>{item.date}</Text>}
          </BlurView>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <LinearGradient colors={['#1c1c1c', '#2e2e2e']} style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'history' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('history')}
        >
          <LinearGradient
            colors={activeTab === 'history' ? ['#32CD32', '#228B22'] : ['transparent', 'transparent']}
            style={styles.tabGradient}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            activeTab === 'saved' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('saved')}
        >
          <LinearGradient
            colors={activeTab === 'saved' ? ['#32CD32', '#228B22'] : ['transparent', 'transparent']}
            style={styles.tabGradient}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </LinearGradient>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 25,
    color: '#FFD700',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabGradient: {
    paddingVertical: 14,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  activeTab: {},
  tabText: {
    color: '#ccc',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#1c1c1c',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: 'hidden',
  },
  blurCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  parkingName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
  },
  parkingLocation: {
    fontSize: 15,
    color: '#fff',
    marginTop: 4,
  },
  parkingDate: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 6,
  },
});
