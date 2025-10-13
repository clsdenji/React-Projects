import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, ActivityIndicator, Alert, TextInput,
  FlatList, Text, TouchableOpacity, Dimensions
} from 'react-native';
import MapView, { Marker, Region, LatLng, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

type ParkingSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number; // meters from current center
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const getEstimatedMinutes = (distanceMeters: number, speedMps = 5) =>
  Math.ceil(distanceMeters / speedMps / 60);

/** ---- Overpass: pull ONLY amenity=parking within radius (meters) ---- */
async function fetchParkingsOverpass(lat: number, lon: number, radius = 1200): Promise<ParkingSpot[]> {
  // Query nodes & ways with amenity=parking
  const overpassQuery = `[out:json][timeout:25];
    (
      node(around:${radius},${lat},${lon})["amenity"="parking"];
      way (around:${radius},${lat},${lon})["amenity"="parking"];
    );
    out center 30;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'SparkParking/1.0 (contact: your-email@domain.com)' // <- change me
    },
    body: `data=${encodeURIComponent(overpassQuery)}`
  });

  if (!res.ok) throw new Error('Overpass request failed');
  const json = await res.json();

  const items: ParkingSpot[] = (json.elements || []).map((el: any, idx: number) => {
    // nodes: lat/lon ; ways: center.lat/center.lon
    const lat0 = el.lat ?? el.center?.lat;
    const lon0 = el.lon ?? el.center?.lon;
    if (typeof lat0 !== 'number' || typeof lon0 !== 'number') return null;

    const name = el.tags?.name || 'Parking';
    return {
      id: `${el.type}-${el.id}-${idx}`,
      name,
      latitude: lat0,
      longitude: lon0,
      distance: getDistance(lat, lon, lat0, lon0),
    } as ParkingSpot;
  }).filter(Boolean);

  // sort nearest, cap to 30
  items.sort((a, b) => a.distance - b.distance);
  return items.slice(0, 30);
}

/** ---- Nominatim: geocode a text place to coordinates ---- */
async function geocodePlace(query: string): Promise<{ lat: number; lon: number } | null> {
  if (!query.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SparkParking/1.0 (contact: your-email@domain.com)' } // <- change me
  });
  if (!res.ok) return null;
  const arr = await res.json();
  if (!arr?.length) return null;
  return { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) };
}

const MapScreen = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const mapRef = useRef<MapView>(null);

  const refreshNearby = useCallback(async (lat: number, lon: number) => {
    try {
      setIsFetching(true);
      const lots = await fetchParkingsOverpass(lat, lon, 1200);
      setParkingSpots(lots);
    } catch (e) {
      console.warn(e);
      Alert.alert('Network', 'Could not load parking near this area.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Start: ask location, center, load nearby parking
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      const initial: Region = {
        latitude, longitude, latitudeDelta: 0.012, longitudeDelta: 0.012
      };
      setRegion(initial);
      await refreshNearby(latitude, longitude);
      setLoading(false);

      // watch movement (debounced by distance)
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 60 },
        async (p) => {
          const { latitude: la, longitude: lo } = p.coords;
          setRegion(r => (r ? { ...r, latitude: la, longitude: lo } : r));
          // optional: refresh as user moves around
          await refreshNearby(la, lo);
        }
      );
    })();
    return () => sub?.remove();
  }, [refreshNearby]);

  const zoomToMarker = (coords: LatLng) => {
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: 0.006, longitudeDelta: 0.006 }, 600
    );
  };

  const onSubmitSearch = useCallback(async () => {
    const place = await geocodePlace(search);
    if (!place) {
      Alert.alert('Not found', 'Try a different area name (e.g., “Quezon City”).');
      return;
    }
    const next: Region = {
      latitude: place.lat, longitude: place.lon, latitudeDelta: 0.012, longitudeDelta: 0.012
    };
    setRegion(next);
    mapRef.current?.animateToRegion(next, 700);
    await refreshNearby(place.lat, place.lon);
  }, [search, refreshNearby]);

  if (loading || !region) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: '#666' }}>Loading map…</Text>
      </View>
    );
  }

  const filtered = parkingSpots.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={region}
        showsUserLocation
      >
        {/* OSM tiles */}
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* You are here */}
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="You are here" />

        {/* Parking markers */}
        {filtered.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.name || 'Parking'}
            description={`~${Math.round(spot.distance)} m • ${getEstimatedMinutes(spot.distance)} min walk`}
            pinColor="green"
            onPress={() => zoomToMarker({ latitude: spot.latitude, longitude: spot.longitude })}
          />
        ))}
      </MapView>

      {/* Search bar */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search area (e.g., Makati, Davao)…"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={onSubmitSearch}
          returnKeyType="search"
        />
        {isFetching && <Text style={styles.fetchHint}>Updating…</Text>}
      </View>

      {/* Bottom list */}
      <View style={styles.bottomSheet}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => zoomToMarker({ latitude: item.latitude, longitude: item.longitude })}
            >
              <Text style={styles.listTitle}>{item.name || 'Parking'}</Text>
              <Text style={styles.listSubtitle}>
                {Math.round(item.distance)} m • {getEstimatedMinutes(item.distance)} min walk
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#aaa', padding: 8 }}>No parking found here.</Text>}
        />
      </View>
    </View>
  );
};

export default MapScreen;

/* ----- styles ----- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBox: {
    position: 'absolute', top: 50, left: 20, right: 20,
    backgroundColor: '#1a1a1acc', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8
  },
  searchInput: { color: '#fff', fontSize: 16 },
  fetchHint: { color: '#ddd', fontSize: 12, marginTop: 4 },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: 220,
    backgroundColor: '#1a1a1a', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 12
  },
  listItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  listTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  listSubtitle: { color: '#aaa', fontSize: 13, marginTop: 2 }
});
