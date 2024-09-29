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
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { fetchData, addPin } from "./server/firebase";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";

const INITIAL_REGION = {
  latitude: 43,
  longitude: -80,
  latitudeDelta: 5,
  longitudeDelta: 5,
};
import Loading from "./components/loading";
import Main from "./components/main";
import Animation from "./components/animation";

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
  const [location, setLocation] = useState(null); // coordinate storage
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([]); // store markers
  const [addMode, setAddMode] = useState(false); // for adding marker mode
  const [sliderValue, setSliderValue] = useState(1); // rating value
  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // loading data
  const [isOpening, setIsOpening] = useState(true);

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

  // fetch data from database
  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData();
      setData(result);
      console.log("data", result);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Simulate a loading process
    const timer = setTimeout(() => {
      setIsOpening(false); // Switch to main page after 3 seconds
    }, 5000);

    // Clean up the timer
    return () => clearTimeout(timer);
  });
  // to add marker
  const handleMapPress = (event) => {
    if (addMode) {
      const newMarker = {
        coordinate: event.nativeEvent.coordinate,
        title: `Marker at (${event.nativeEvent.coordinate.latitude.toFixed(
          2
        )}, ${event.nativeEvent.coordinate.longitude.toFixed(2)})`,
        sliderValue: 1,
      };
      setMarkers([...markers, newMarker]);
      setCurrentMarkerIndex(markers.length);
    }
  };

  // slider change
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

  // confirm pin submission
  const handleSubmitPin = async () => {
    if (currentMarkerIndex !== null) {
      const marker = markers[currentMarkerIndex];
      try {
        await addPin(
          marker.coordinate.latitude,
          marker.coordinate.longitude,
          marker.sliderValue
        );
        console.log(
          `Pin submitted: Latitude: ${marker.coordinate.latitude}, Longitude: ${marker.coordinate.longitude}, Rating: ${marker.sliderValue}`
        );
        setSliderValue(1);
        setAddMode(false);
        Alert.alert("Success", "Pin submitted successfully!");

        // Optionally, refresh the data after submitting
        const updatedData = await fetchData();
        setData(updatedData);
      } catch (error) {
        console.error("Error submitting pin:", error);
        Alert.alert("Error", "Failed to submit pin. Please try again.");
      }
    } else {
      Alert.alert("No pin selected", "Please add a pin before submitting.");
    }
  };

  if (isOpening) {
    // if app just opened
    return <Loading />;
  } else if (loading) {
    // if we are still retrieving items from the database
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000000" />
        <Text>Loading...</Text>
      </View>
    );
  } else {
    // all is good
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={styles.container}>
          {addMode && (
            <View style={styles.pinAddMode}>
              <Text style={styles.pinAddModeText}>ADD RED ZONE</Text>
            </View>
          )}
          {addMode && currentMarkerIndex !== null && (
            // show slider
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>RATE SAFETY: {sliderValue}</Text>
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
          {/* map view */}
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            showsUserLocation={true}
            region={location || INITIAL_REGION}
            onPress={handleMapPress}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                opacity="0.5"
                coordinate={marker.coordinate}
                title={marker.title}
              >
                <Image
                  source={require("./assets/newpin.png")}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              </Marker>
            ))}
            {data.map((item) => {
              return (
                <Marker
                  key={item.id}
                  coordinate={{
                    latitude: item.latitude,
                    longitude: item.longitude,
                  }}
                  opacity={0.2 * item.rating}
                >
                  <Image
                    source={require("./assets/pin.png")}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                </Marker>
              );
            })}
          </MapView>
          <View style={styles.bottomContainer}>
            {addMode ? (
              <View>
                {/* style cancel button */}
                <View style={styles.buttonContainerL}>
                  <TouchableOpacity style={styles.submitButton}>
                    <Ionicons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>
                {/* style submit button */}
                <View style={styles.buttonContainerR}>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitPin}
                  >
                    <Ionicons name="checkmark" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.buttonContainerR}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => setAddMode(true)}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
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

  sliderContainer: {
    position: "absolute",
    top: 130,
    width: "80%",
    height: 150,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20, // To make sure it's on top of the map
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end",
    width: "100%",
  },
  buttonContainerR: {
    position: "absolute",
    bottom: 40,
    right: 30,
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 40,
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 80,
    height: 80,
  },
  buttonContainerL: {
    position: "absolute",
    bottom: 40,
    left: 30,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 40,
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 80,
    height: 80,
  },
  pinAddMode: {
    position: "absolute",
    width: "50%",
    borderRadius: 20,
    top: 70,
    zIndex: 10,
    backgroundColor: "#1F2039",
    color: "#fff",
    padding: 15,
    alignItems: "center",
  },
  pinAddModeText: {
    color: "#fff", // Set text color to white
    fontSize: 14, // Adjust font size if needed
  },
});
