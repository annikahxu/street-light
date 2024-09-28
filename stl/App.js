import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Button,
  Alert,
  Text,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { fetchData } from "./server/firebase";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

// import { database } from './firebaseConfig';
// import { ref, push } from 'firebase/database';

const INITIAL_REGION = {
  latitude: 43,
  longitude: -80,
  latitudeDelta: 2,
  longitudeDelta: 2,
};

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
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

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData();
      setData(result);
      console.log("data", result);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleMapPress = (event) => {
    if (addMode) {
      const newMarker = {
        coordinate: event.nativeEvent.coordinate,
        title: `Marker at (${event.nativeEvent.coordinate.latitude.toFixed(2)}, ${event.nativeEvent.coordinate.longitude.toFixed(2)})`,
        sliderValue: 1,
      };
      setMarkers([...markers, newMarker]);
      setCurrentMarkerIndex(markers.length);
    }
  };

  const handleSliderChange = (value) => {
    setSliderValue(value);
    if (currentMarkerIndex !== null) {
      const updatedMarkers = markers.map((marker, index) => {
        if (index === currentMarkerIndex) {
          return { ...marker, sliderValue: value };
        }
        return marker;
      });
      setMarkers(updatedMarkers);
    }
  };

  const handleSubmitPin = () => {
    if (currentMarkerIndex !== null) {
      const marker = markers[currentMarkerIndex];
      console.log(
        `Pin Location: Latitude: ${marker.coordinate.latitude}, Longitude: ${marker.coordinate.longitude}, Slider Value: ${marker.sliderValue}`
      );
      setSliderValue(1);
      setAddMode(false);
      Alert.alert("Pin Submitted");
    } else {
      Alert.alert("No pin selected", "Please add a pin before submitting.");
    }
  };

  const customMapStyle = [
    {
      elementType: "geometry",
      stylers: [{ color: "black" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "grey" }],
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000000" />
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={styles.container}>
          {addMode && currentMarkerIndex !== null && (
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Set Value for Pin: {sliderValue}</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={sliderValue}
                onValueChange={handleSliderChange}
                minimumTrackTintColor="red"
                maximumTrackTintColor="darkred"
              />
            </View>
          )}

          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            showsUserLocation={true}
            customMapStyle={customMapStyle}
            region={location || INITIAL_REGION}
            onPress={handleMapPress}
          >
            {location && <Marker coordinate={location} title="You are here" />}
            {markers.map((marker, index) => (
              <Marker
                style={styles.marker}
                key={index}
                coordinate={marker.coordinate}
                title={marker.title}
                image={require("./assets/cat.jpg")}
              />
            ))}
          </MapView>
          <View style={styles.buttonContainer}>
            {addMode ? (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitPin}
              >
                <Ionicons name="checkmark" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <Button title="Add Pin" onPress={() => setAddMode(true)} />
            )}
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  // buttonContainer: {
  //   marginTop: 10,
  //   alignItems: "center",
  // },
  marker: {
    width: "5%",
  },
  sliderContainer: {
    position: 'absolute',
    top: 40,
    width: '90%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    alignItems: 'center',
    zIndex: 10, // To make sure it's on top of the map
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 120,
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  


});

