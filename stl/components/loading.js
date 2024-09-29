import React, { useEffect } from "react";
import { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Animation from "./animation";

export default function Loading({ onLoadingComplete }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAllLoading, setIsAllLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process
    const timer = setTimeout(() => {
      setIsAllLoading(false); // Switch to main page after 3 seconds
    }, 2000);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, []);

  return isAllLoading ? (
    <View style={styles.container}>
      {/* <Text>test</Text> */}
      <Image
        source={require("../assets/streetLight.png")}
        style={styles.image}
        resizeMode="contain"
        onLoad={() => setIsImageLoaded(true)}
      />
      {isImageLoaded && (
        <>
          <Text style={styles.text}>
            <Text style={styles.streetText}>STREET</Text>
            <Text style={styles.lightText}>LIGHT</Text>
          </Text>
        </>
      )}
    </View>
  ) : (
    <Animation />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1d1e39",
  },
  text: {
    fontSize: 35,
    marginTop: 20,
  },
  streetText: {
    color: "#dcdcdc",
  },
  lightText: {
    color: "#fff9be",
  },
  image: {
    width: 250,
    height: 250,
  },
});
