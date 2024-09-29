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
} from "react-native";
import React, { useState, useEffect } from "react";
import { fetchData } from "./server/firebase";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Slider from '@react-native-community/slider'; // Import the Slider component

const INITIAL_REGION = {
  latitude: 43,
  longitude: -80,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

export default function App() {
  const latitudes = [
    { latitude: 40, longitude: -100 },
    { latitude: 41, longitude: -101 },
    { latitude: 42, longitude: -102 },
    { latitude: 43, longitude: -103 },
    { latitude: 44, longitude: -104 },
    { latitude: 45, longitude: -105 },
    { latitude: 46, longitude: -106 },
    { latitude: 47, longitude: -107 },
    { latitude: 48, longitude: -108 },
    { latitude: 49, longitude: -109 },
    { latitude: 50, longitude: -110 },
  ];
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(null);

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

  const handleMapPress = (event) => {
    if (addMode) {
      const newMarker = {
        coordinate: event.nativeEvent.coordinate,
        title: `Marker at (${event.nativeEvent.coordinate.latitude.toFixed(2)}, ${event.nativeEvent.coordinate.longitude.toFixed(2)})`,
        sliderValue: 1, // Default value for the slider
      };
      setMarkers([...markers, newMarker]);
      setCurrentMarkerIndex(markers.length); // Set index for the current marker
      //Alert.alert("Pin Added", "Now use the slider to set a value for this pin.");
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

  const handleSubmit = () => {
    if (currentMarkerIndex !== null) {
      const marker = markers[currentMarkerIndex];
      console.log(
        `Pin Location: Latitude: ${marker.coordinate.latitude}, Longitude: ${marker.coordinate.longitude}, Slider Value: ${marker.sliderValue}`
      );
      // Reset slider value to 1
      setSliderValue(1);
    } else {
      Alert.alert("No pin selected", "Please add a pin before submitting.");
    }
  };

  const handleDoneAddingPress = () => {
    setAddMode(false);
    Alert.alert("Add Mode Deactivated", "You can no longer add pins.");
  };

  const customMapStyle = [
    {
      elementType: "geometry",
      stylers: [{ color: "#ebe3cd" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#523735" }],
    },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData();
      setData(result);
      console.log("data", result);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000000" />
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <SafeAreaView style={styles.container}>
          {/* Slider Container at the Top */}
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
              <Button title="Submit Pin" onPress={handleSubmit} />
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
            {/* {data.map((lat, index) => {
              <Marker 
                key={index}
                coordinate={{ latitude: 43, longitude: -80}}
                image={require("./assets/Red-Circle-Transparent.png")}
              />
            })} */}
            {markers.map((marker, index) => (
              <Marker
                style={styles.marker}
                key={index}
                coordinate={marker.coordinate}
                title={marker.title}
                image={require("./assets/cat.jpg")}
              />
            ))}
            {data.map((item) => {
              return(
                <Marker 
                  key={item.id}
                  coordinate={{ latitude: item.latitude, longitude: item.longitude}}
                  image={require("./assets/Red-Circle-Transparent.png")}
                />
              )
            })}
            {/* <Marker 
              key={1}
              coordinate={{ latitude: 43, longitude: -80}}
              image={require("./assets/Red-Circle-Transparent.png")}
            /> */}
          </MapView>
          <View style={styles.buttonContainer}>
            {addMode ? (
              <Button title="Done Adding Pins" onPress={handleDoneAddingPress} />
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
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: "center",
  },
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
});
