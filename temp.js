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
import { Form } from "./components/Form";

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

  // Fetch the user's current location
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

  // Handle map press to add marker
  const handleMapPress = (event) => {
    const newMarker = {
      coordinate: event.nativeEvent.coordinate,
      title: `Marker at (${event.nativeEvent.coordinate.latitude.toFixed(
        2
      )}, ${event.nativeEvent.coordinate.longitude.toFixed(2)})`,
    };
    setMarkers([...markers, newMarker]);
  };

  const handlePress = () => {
    Alert.alert("Button Pressed!", "You clicked the button.");
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
    // Add more style elements here...
  ];

  // vars for grabbing data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // get rating data from database
  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData(); // Call fetchData when the component mounts
      setData(result); // Set the fetched data to state
      console.log("data", result);
      setLoading(false);
    };

    loadData();
  }, []);

  // show loading screen if still fetching from database
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
          Keyboard.dismiss(); // so you can dismiss keyboard without submitting form
        }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.container}>
            <Text>Data: {data[0].rating}</Text>
            <Form />
            <StatusBar style="auto" />
          </View>
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            showsUserLocation={true}
            customMapStyle={customMapStyle}
            region={location || INITIAL_REGION}
            onPress={handleMapPress} // Add onPress handler to MapView
          >
            {/* Place a marker at the user's current location if available */}
            {data.map((lat, index) => {
                <Marker 
                    key={lat}
                    coordinate={{ latitude: 40 + lat.rating, longitude: -80}}
                    image={require("./assets/Red-Circle-Transparent.png")}
                />
            })}
            {location && <Marker coordinate={location} title="You are here" />}
            {/* Render the markers that the user adds */}
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
          {/* Add a button below the map */}
          <View style={styles.buttonContainer}>
            <Button title="Press me" onPress={handlePress} />
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
    height: "75%", // Adjust height to make space for the button
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  marker: {
    width: "5%",
  },
});

// scrap
// useEffect(() => {
//   const loadData = async () => {
//     const result = await fetchData(); // Call fetchData when the component mounts
//     setData(result); // Set the fetched data to state
//     console.log("data", result);
//     setLoading(false);
//   };

//   loadData();
// }, []);

// if (loading) {
//   return (
//     <View style={styles.container}>
//       <ActivityIndicator size="large" color="#0000000" />
//       <Text>Loading...</Text>
//     </View>
//   );
// } else {
//   return (
//     <View style={styles.container}>
//       <Text>Data: {data[0].rating}</Text>
//       <Form />
//       <StatusBar style="auto" />
//     </View>
//   );
// }
