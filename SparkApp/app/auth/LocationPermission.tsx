import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";

type Props = {
  onPermissionGranted: (location: Location.LocationObject) => void;
};

const LocationPermission: React.FC<Props> = ({ onPermissionGranted }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const askLocationPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        Alert.alert("Permission denied", "Location permission is required to proceed.");
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      onPermissionGranted(location);
    } catch (error) {
      setErrorMsg("An error occurred while fetching location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    askLocationPermission();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text>Requesting location permission...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", marginBottom: 20 }}>{errorMsg}</Text>
        <Button title="Try Again" onPress={askLocationPermission} />
      </View>
    );
  }

  return null;
};

export default LocationPermission;
