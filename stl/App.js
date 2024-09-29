import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from 'react';
import Loading from './components/loading';
import Main from './components/main';
import Animation from './components/animation';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process
    const timer = setTimeout(() => {
      setIsLoading(false); // Switch to main page after 3 seconds
    }, 5000);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, []);

  // Conditionally render the Loading or Main page based on the loading state
  return isLoading ? <Loading /> : <Main />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
