import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const INITIAL_REGION = {
  latitude: 43,
  longitude: -80,
  latitudeDelta: 2,
  longitudeDelta: 2
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Fetch the user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // Handle map press to add marker
  const handleMapPress = (event) => {
    const newMarker = {
      coordinate: event.nativeEvent.coordinate,
      title: `Marker at (${event.nativeEvent.coordinate.latitude.toFixed(2)}, ${event.nativeEvent.coordinate.longitude.toFixed(2)})`
    };
    setMarkers([...markers, newMarker]);
  };

  const handlePress = () => {
    Alert.alert('Button Pressed!', 'You clicked the button.');
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        region={location || INITIAL_REGION}
        onPress={handleMapPress} // Add onPress handler to MapView
      >
        {/* Place a marker at the user's current location if available */}
        {location && (
          <Marker 
            coordinate={location}
            title="You are here"
          />
        )}
        {/* Render the markers that the user adds */}
        {markers.map((marker, index) => (
          <Marker 
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
          />
        ))}
      </MapView>
      {/* Add a button below the map */}
      <View style={styles.buttonContainer}>
        <Button
          title="Press me"
          onPress={handlePress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '90%', // Adjust height to make space for the button
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
});
