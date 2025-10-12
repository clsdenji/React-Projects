import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';

interface ParkingSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000; // meters
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getEstimatedMinutes = (distanceMeters: number, speedMps = 5) => {
  return Math.ceil(distanceMeters / speedMps / 60);
};

const MOCK_PARKING_SPOTS: ParkingSpot[] = [
  { id: '1', name: 'Parking Lot A', latitude: 14.5995, longitude: 120.9842, distance: 0 },
  { id: '2', name: 'Parking Lot B', latitude: 14.6002, longitude: 120.985, distance: 0 },
  { id: '3', name: 'Parking Lot C', latitude: 14.5987, longitude: 120.983, distance: 0 },
  { id: '4', name: 'Parking Lot D', latitude: 14.601, longitude: 120.986, distance: 0 },
];

const MapScreen = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const mapRef = useRef<MapView>(null);

  const updateNearbyParking = (lat: number, lon: number, radius = 1000) => {
    const nearby = MOCK_PARKING_SPOTS.filter(
      (spot) => getDistance(lat, lon, spot.latitude, spot.longitude) <= radius
    ).map((spot) => {
      const distance = getDistance(lat, lon, spot.latitude, spot.longitude);
      return { ...spot, distance };
    });

    setParkingSpots(nearby);
  };

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      updateNearbyParking(latitude, longitude);
      setLoading(false);

      subscriber = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setRegion((prev) => (prev ? { ...prev, latitude, longitude } : prev));
          updateNearbyParking(latitude, longitude);
        }
      );
    };

    startTracking();
    return () => {
      subscriber?.remove();
    };
  }, []);

  const zoomToMarker = (coords: LatLng) => {
    mapRef.current?.animateToRegion(
      {
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000
    );
  };

  if (loading || !region) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00BFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        customMapStyle={darkMapStyle}
        showsUserLocation
        followsUserLocation
      >
        <Marker coordinate={region} title="You are here" pinColor="blue" />
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={`${spot.name} - ${getEstimatedMinutes(spot.distance)} min`}
            description={`Distance: ${Math.round(spot.distance)} m`}
            pinColor="green"
          />
        ))}
      </MapView>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search parking areas..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.bottomSheet}>
        <FlatList
          data={parkingSpots.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                zoomToMarker({ latitude: item.latitude, longitude: item.longitude })
              }
            >
              <Text style={styles.listTitle}>{item.name}</Text>
              <Text style={styles.listSubtitle}>
                {Math.round(item.distance)} m • {getEstimatedMinutes(item.distance)} min walk
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

export default MapScreen;

// 🌑 Dark map style
const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#181818' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d3d3d' }],
  },
];

// 🧾 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  searchInput: {
    color: '#fff',
    fontSize: 16,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  listTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listSubtitle: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
});
