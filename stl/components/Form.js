import React from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Button,
  Alert,
} from "react-native";
import { postData } from "../server/firebase";

export const Form = () => {
  const [text, onChangeText] = React.useState("");
  const [number, onChangeNumber] = React.useState("");

  const handleSubmit = () => {
    // Handle form submission
    if (number === "") {
      Alert.alert("Please enter some text."); // Show alert if input is empty
    } else {
      //   Alert.alert(`Submitted: ${number}`); // Show the submitted value
      postData(number);
      onChangeNumber(""); // Clear the input field after submission
    }
  };

  return (
    <SafeAreaView>
      <Text>Form</Text>
      <TextInput
        name="textinput"
        style={styles.input}
        onChangeText={onChangeNumber}
        placeholder="How safe do you feel here?"
        value={number}
        keyboardType="numeric"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
});
