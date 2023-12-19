import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Alert, TouchableOpacity, Text, Image, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, db } from '../firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';

type SignInScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Sign in'>;
};

const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const backgroundColor = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const duration = 19999;

    const animateColors = () => {
      backgroundColor.setValue(0);
      Animated.timing(backgroundColor, {
        toValue: colors.length - 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(animateColors);
    };

    animateColors();

    return () => backgroundColor.stopAnimation();
  }, []);

  const handleSignIn = async () => {

    setEmailErrorMessage('');
    setPasswordErrorMessage('');

    if (
      email.trim() === '' ||
      password.trim() === ''

    ) {

      if (email.trim() === '') {
        setEmailErrorMessage('Email is required');
      }
      if (password.trim() === '') {
        setPasswordErrorMessage('Password is required');
      }

      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.emailVerified) {

        // Retrieve user data based on UID
        const userData = await getUserData(user.uid);

        // Store user session data
        const session = {
          userId: user.uid,
          email: user.email,
          password: password
        };

        await AsyncStorage.setItem('session', JSON.stringify(session));
        navigation.replace('Main home');
        Alert.alert('Sign in Successfully');

        // Log the retrieved user data
        console.log('User Data:', userData);


      } else {
        Alert.alert('Email is not verified. Please Verify Your Email');
      }



    } catch (error: any) {
      const errorCode = error.code;
      console.log(errorCode);


      if (errorCode === 'auth/invalid-email') {
        setEmailErrorMessage('Invalid Email');
      }

      if (errorCode === 'auth/wrong-password') {
        setPasswordErrorMessage('Incorrect Password. Please enter the right password');
      }

      console.log('Error signing in:', error);
      Alert.alert('Failed to sign in. Please enter the valid email and correct password');
    }
  };

  const getUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        return userDocSnapshot.data();
      } else {
        // User document not found
        return null;
      }
    } catch (error) {
      // Handle error
      console.error('Error retrieving user data:', error);
      throw error;
    }
  };

  const handleSignUp = () => {
    navigation.navigate('Sign up');
  };

  const colors = ['#000000', '#b30000', '#0000cc', '#b30000', '#000000'];
  const interpolatedBackgroundColor = backgroundColor.interpolate({
    inputRange: colors.map((_, index) => index),
    outputRange: colors,
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedBackgroundColor }]}>
      <View style={styles.contentContainer}>
        <Image source={require('./Images/2.png')} style={styles.logo} />
        <Text style={styles.title}>Sign in</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="white"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {emailErrorMessage ? <Text style={{ color: 'red', marginBottom: 10 }}>{emailErrorMessage}</Text> : null}


        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="white"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {passwordErrorMessage ? <Text style={{ color: 'red', marginBottom: 10 }}>{passwordErrorMessage}</Text> : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: 'rgba(0, 0,0 , 5)', // Updated background color for better contrast
    borderRadius: 30,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 50,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: -15,
    borderRadius: 50,
    marginTop: -30,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: 'yellow',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: 'black',
    borderRadius: 30,
    color: 'white'

  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderRadius: 30,

  },
  button: {
    backgroundColor: 'yellow',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default SignInScreen;
