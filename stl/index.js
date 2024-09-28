import { AppRegistry } from 'react-native';
import App from './App'; // Make sure this path is correct
import { name as appName } from './app.json'; // Make sure you have an app.json file

AppRegistry.registerComponent(appName, () => App);