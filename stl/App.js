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
import React, { useState, useEffect, useRef} from "react";
import { fetchData, addPin } from "./server/firebase";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Blink from "./components/blink";
import * as Font from "expo-font";

const INITIAL_REGION = {
  latitude: 43,
  longitude: -80,
  latitudeDelta: 5,
  longitudeDelta: 5,
};
import Loading from "./components/loading";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export default function App() {
  const [location, setLocation] = useState(null); // coordinate storage
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([]); // store markers
  const [addMode, setAddMode] = useState(false); // for adding marker mode
  const [sliderValue, setSliderValue] = useState(1); // rating value
  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // loading data
  const [isOpening, setIsOpening] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const flashingMarkerRef = useRef(null);
  const [sos, setsos] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false); // check if font loaded

  // get user location
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

  // load fonts
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "Karla-Regular": require("./assets/fonts/Karla-Regular.ttf"), // Adjust path as necessary
        "Karla-Bold": require("./assets/fonts/Karla-Bold.ttf"), // Load other styles if needed
      });
      setFontLoaded(true);
    };

    loadFonts();
  }, []);

  // opening screen
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
  useEffect(() => {
    console.log("Registering notification");
    registerForPushNotificationsAsync().then(token => {
      console.log("token: ", token)
      setExpoPushToken(token)
    }).catch(error => console.log("error: ", error))
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId: "43003c01-1e10-40a6-a7ef-dfeb151ec979"})).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  //send notification
  const sendPushNotification = async () => {
    console.log("sending notification");
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "SOS Notification!",
      body: "Someone send a SOS notification",
  
    }
    await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
    console.log(message.title);
  };

  //handle cancel pin creation
  const handleCancelPin = async () => {
    // Reset all states related to pin addition
    console.log("cancel pin was reached");
    setAddMode(false);
    setSliderValue(1);
    setCurrentMarkerIndex(null);

    // Remove the last added marker (if any)
    if (markers.length > 0) {
      setMarkers(markers.slice(0, -1));
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
  } else if (loading || !fontLoaded) {
    // if we are still retrieving items from the database or loading font
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
        <View style={styles.container}>
          {addMode && (
            <View style={styles.pinAddMode}>
              <Text
                style={{
                  fontFamily: "Karla-Bold",
                  fontSize: 14,
                  color: "white",
                  textAlign: "center",
                }}
              >
                PRESS ON MAP BELOW TO ADD RED ZONE
              </Text>
            </View>
          )}
          {addMode && currentMarkerIndex !== null && (
            // show slider
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>HOW UNSAFE DID YOU FEEL?</Text>
              <Text style={{ fontFamily: "Karla-Regular", fontSize: 14 }}>
                {" "}
                (1: Barely unsafe, 5: Very unsafe){" "}
              </Text>
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
              <Text style={{ fontFamily: "Karla-Bold", fontSize: 14 }}>
                Current selection: {sliderValue}
              </Text>
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
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleCancelPin}
                  >
                    <Ionicons name="close" size={24} color="#1F2039" />
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
          {!addMode && (
            <View style={styles.sosContainer}>
            <TouchableOpacity onPress={() => sendPushNotification()} style={styles.sosButton}>
            <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
)}


        </View>
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
    top: 150,
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
    fontFamily: "Karla-Bold",
    fontSize: 18,
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
    backgroundColor: "#1F2039",
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
    shadowColor: "#1F2039",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 80,
    height: 80,
  }, 
  sosContainer: {
    position: "absolute",
    bottom: 40,
    left: 30,
    alignItems: "center",
    backgroundColor: "#db162f",
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
  sosButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  sosText: {
    color: "white", // This sets the text color to white
    fontSize: 16,
    fontWeight: "bold",
  },
  
  pinAddMode: {
    position: "absolute",
    width: "60%",
    borderRadius: 20,
    top: 70,
    zIndex: 10,
    backgroundColor: "#1F2039",
    color: "#fff",
    padding: 15,
    alignItems: "center",
  },
  helpButtonContainer: {
    position: "absolute",
    top: 80,
    left: 80,
    // alignItems: "center",
    // borderRadius: 40,
    justifyContent: "center",
    // elevation: 5,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // width: 40,
    // height: 40,
  },
});
