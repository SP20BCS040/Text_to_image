import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StyleSheet, Alert } from 'react-native';
import SplashScreen from './SplashScreen'; // Import your SplashScreen component
import CameraScreen from './screens/Camera';
import SignInScreen from './screens/SignInScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import Tabs from './screens/BottomTab';
import ImageEditScreen from './screens/ImageEditScreen';
import FilterScreen from './screens/Filters';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';
import ImageDetailScreen from './screens/ImageDetailScreen'; // Import the ImageDetailScreen component

const Stack = createNativeStackNavigator();

const App = () => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [execute,setExecute] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem('session');
        console.log('Session value:', session);

        if (session) {
          const { email, password } = JSON.parse(session);
          console.log('email and password', email, password);

          signInWithEmailAndPassword(auth, email, password)
            .then(() => {
              console.log('Signin Successfully');
              setIsAuthenticated(true);
              setExecute(true);
            })
            .catch((error) => {
              setIsAuthenticated(false);
              setExecute(true);
              const errorMessage = error.message;
              Alert.alert(errorMessage);
            });
        } else {
          setIsAuthenticated(false);
          setExecute(true);
          // Handle the case when there's no session data available
          console.log('No session data available');
        }

        setIsLoading(false);
      } catch (error) {
        console.log('Error checking session:', error);
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);


  if (isLoading) {
    return (
      <SplashScreen /> // Display SplashScreen while loading
    );
  }

  return (
  
    <NavigationContainer>
        {execute ?  (
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Main home' : 'Sign in'}
        screenOptions={{ headerStyle: { backgroundColor: 'yellow' } }}>
        <Stack.Screen name="Sign in" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Sign up" component={RegistrationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main home" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ImageDetail" component={ImageDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ImageEdit" component={ImageEditScreen} options={{ headerShown: false }}  />
        <Stack.Screen name="Filters" component={FilterScreen} options={{ headerShown: false }}  />

      </Stack.Navigator>):(<SplashScreen />)
      }
    </NavigationContainer>
    
  
    
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
