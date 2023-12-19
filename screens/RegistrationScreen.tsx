import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert, TouchableOpacity, Text, Image, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, db } from '../firebase-config';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

type RegistrationScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Sign up'>;
};

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const [name, setName] = useState(''); // Added state for name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [NameErrorMessage ,setNameErrorMessage]= useState('')
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [cpasswordErrorMessage, setcPasswordErrorMessage] = useState('');

  const backgroundColor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const colors = ['#FAD02E', '#F76B1C', '#FF4E50'];

    const duration = 8000;

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
  }, []);



  const handleSignUp = async () => {

    setNameErrorMessage('');
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setcPasswordErrorMessage('');

    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(name)) {
      setNameErrorMessage('Name should only contain alphabets');
      return;
    }

    if (confirmPassword != password) {
      setcPasswordErrorMessage('confirm password does not match');
      return;
    }

    if (
      name.trim() === '' ||
      email.trim() === '' ||
      password.trim() === ''||
      confirmPassword.trim() === ''

    ) {
      if (name.trim() === '') {
        setNameErrorMessage('Name is required');
      }
      if (email.trim() === '') {
        setEmailErrorMessage('Email is required');
      }
      if (password.trim() === '') {
        setPasswordErrorMessage('Password is required');
      }
      if (confirmPassword.trim() === '') {
        setcPasswordErrorMessage('Password is required');
      }
    
      return;
    }

    try {
      // Create the user in Firebase Authentication
      const authUserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = authUserCredential.user;
    
      // Create a user data object
      const userData = {
        name, // Assuming 'name' is the user's name
        email, // Assuming 'email' is the user's email
      };
    
      if (auth.currentUser) {
        sendEmailVerification(auth.currentUser)
          .then(() => {
            console.log('Verification email sent');
            Alert.alert('Please check your email inbox and click the verification link to verify your email.');
            // Optionally, you can add a message to the user indicating that the verification email has been sent.
          })
          .catch((error) => {
            // Handle email verification error
            console.error('Error sending verification email:', error);
          });
      } else {
        // Handle the case when there's no signed-in user
        console.error('No signed-in user');
      }
    
      // Store user data in Firestore
      await setDoc(doc(db, 'users', authUser.uid), userData); // Use setDoc to add data
    
      Alert.alert('User created successfully');
      navigation.navigate('Sign in');
    
    } catch (error:any) {
      const errorCode = error.code;
        console.log(errorCode);
        if (errorCode === 'auth/email-already-in-use') {
          setEmailErrorMessage('Email is already in use. Please try another one');
        }

        if (errorCode === 'auth/weak-password') {
          setPasswordErrorMessage('Password must be at least 6 characters long');
        }

        if (errorCode === 'auth/invalid-email') {
          setEmailErrorMessage('Invalid Email');
        }

        if (errorCode === 'auth/missing-email') {
          setEmailErrorMessage('Missing email');
        }
        if (errorCode === 'auth/internal-error') {
          setPasswordErrorMessage('Password missing');
        }
      console.log('Error signing up:', error);
      Alert.alert('Failed to sign up');
    }
  };


  const colors = ['#FAD02E', '#F76B1C', '#FF4E50'];
  const interpolatedBackgroundColor = backgroundColor.interpolate({
    inputRange: colors.map((_, index) => index),
    outputRange: colors,
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedBackgroundColor }]}>
      <View style={styles.contentContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅</Text>
        </TouchableOpacity>
        <Image source={require('./Images/2.png')} style={styles.logo} />
        <Text style={styles.title}>Sign up</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="white"
          value={name}
          onChangeText={setName}
        />
        {NameErrorMessage ? <Text style={{ color: 'red', marginBottom:10 }}>{NameErrorMessage}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="white"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        {emailErrorMessage ? <Text style={{ color: 'red', marginBottom:10 }}>{emailErrorMessage}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="white"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {passwordErrorMessage ? <Text style={{ color: 'red', marginBottom:10 }}>{passwordErrorMessage}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="white"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {cpasswordErrorMessage ? <Text style={{ color: 'red', marginBottom:10 }}>{cpasswordErrorMessage}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    backgroundColor: 'rgba(0, 0,0 , 5)', // Updated background color for better contrast
    borderRadius: 30,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 50,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    marginTop: -35,
    marginLeft: -5,
    left: 20,
  },
  backButtonText: {
    fontSize: 70,
    fontWeight: 'bold',
    color: 'yellow',
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
    borderRadius:30,
    color:'white'

  },
  button: {
    backgroundColor: 'yellow',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius:30,
    width: '48%',
    marginTop: 5,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign:'center'
  },
});

export default RegistrationScreen;