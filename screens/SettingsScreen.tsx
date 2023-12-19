import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, TextInput,ScrollView,
  RefreshControl, } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase-config'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import '@react-native-firebase/app';
import LinearGradient from 'react-native-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';


type UserData = {
  name: string;
  email: string;
  // Add other properties if needed
};

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<any, any>;
  route: any; // Added route prop
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentpasswordErrorMessage, setcurrentPasswordErrorMessage] = useState('');
  const [newpasswordErrorMessage, setnewPasswordErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);

    // Reset state values to their initial state
    setShowPasswordInput(false);
    setCurrentPassword(""); // Clear the input after saving
    setNewPassword(""); // Clear the input after saving
    setcurrentPasswordErrorMessage("");
    setnewPasswordErrorMessage("");

    // Fetch any necessary data or perform other refresh logic here

    setRefreshing(false);
  };

  useEffect(() => {
    retrieveUserInfo();
    checkSession();

  }, []);

  const retrieveUserInfo = async () => {
    try {
      const user = auth.currentUser;

      if (user) {
        const uid = user.uid;
        const userDocRef = doc(db, 'users', uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data() as UserData; // Cast to UserData type
          setName(userData.name);
          setEmail(userData.email);
          setUserData(userData); // Update the userData state
          console.log('User Data:', userData); // Log the userData to the console

          await AsyncStorage.setItem('userData', JSON.stringify(userData));


        }
      }
    } catch (error) {
      console.log('Error retrieving user info:', error);
    }
  };

  const checkSession = async () => {
    try {
      // Check if user data is stored in AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setName(userData.name);
        setEmail(userData.email);
        console.log('User Data from AsyncStorage:', userData); // Log the user data to the console
      }
    } catch (error) {
      console.log('Error checking session:', error);
    }
  };

  //   const checkAuthentication = () => {
  //     const user = auth.currentUser;

  //     if (user) {
  //         console.log('User is authenticated:', user.uid);
  //     } else {
  //         console.log('User is not authenticated');
  //     }
  // };

  // // Call the function to check authentication status
  // checkAuthentication();


  const reauthenticate = async (currentPassword: string) => {
    const user = auth.currentUser;

    if (!user) {
      console.log("User is not authenticated");
      throw new Error("User is not authenticated");
    }

    const email = user.email;

    if (!email) {
      console.log("User's email is null");
      throw new Error("User's email is null");
    }

    const cred = EmailAuthProvider.credential(email, currentPassword);
    try {
      await reauthenticateWithCredential(user, cred);
      console.log("Reauthentication successful");
      return true;
    } catch (error: any) {
      console.log("Reauthentication failed:", error.message);
      throw new Error("Reauthentication failed");
    }
  };

  const OnChangePassword = async () => {

    setcurrentPasswordErrorMessage('');
    setnewPasswordErrorMessage('');

    if (
      currentPassword.trim() === '' ||
      newPassword.trim() === ''

    ) {

      if (currentPassword.trim() === '') {
        setcurrentPasswordErrorMessage('Current Password is required');
      }

      if (newPassword.trim() === '') {
        setnewPasswordErrorMessage('New Password is required');
      }

      return;
    }

    if (!currentPassword || !newPassword) {
      Alert.alert("Please enter both current and new passwords.");
      return;
    }
    
    try {
      await reauthenticate(currentPassword);

      const user = auth.currentUser;

      if (user) {
        await updatePassword(user, newPassword);
        Alert.alert("Password changed successfully. Please sign in again.");
        navigation.replace('Sign in');
      } else {
        throw new Error("User is not authenticated");
      }
    } catch (error: any) {

      console.log('Error signing in:', error);
      Alert.alert("Failed to change password. " + "Please Enter the Correct Current Password.");
    }

    setShowPasswordInput(false);
    setCurrentPassword(""); // Clear the input after saving
    setNewPassword(""); // Clear the input after saving


  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('session')
      .then(() => {
        navigation.replace('Sign in');
        Alert.alert('Sign out Successfully');
      })
      .catch((error) => {
        console.log('Error removing session:', error);
        Alert.alert('Failed to sign out');
      });
  };

  return (

    <ScrollView
     refreshControl={
       <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0000ff']} />
     }
   >
    <LinearGradient colors={['black', 'purple']} style={styles.container}>

      <View>
        <Text style={styles.headerText}>My Account</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Name</Text>
        <Text style={styles.infoValue}>{name}</Text>

        <Text style={styles.infoText}>Email</Text>
        <Text style={styles.infoValue}>{email}</Text>

        <TouchableOpacity onPress={() => setShowPasswordInput(!showPasswordInput)} style={styles.button}>
          <Text style={[styles.buttonText, { color: 'yellow' }]}>Change Password ▼</Text>
        </TouchableOpacity>

        {showPasswordInput && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Type current password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            {currentpasswordErrorMessage ? <Text style={{ color: 'red', marginBottom: 10, marginLeft:15 }}>{currentpasswordErrorMessage}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Type new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {newpasswordErrorMessage ? <Text style={{ color: 'red', marginBottom: 10, marginLeft:15 }}>{newpasswordErrorMessage}</Text> : null}

            <TouchableOpacity onPress={OnChangePassword} style={[styles.saveButton, { backgroundColor: 'yellow' }]}>
              <Text style={[styles.buttonText, { color: 'black' }]}>Save</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={{ marginTop: 350, backgroundColor: 'red', borderRadius: 30, paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center', }} onPress={handleSignOut}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: "black" }}>Log out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
     </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 80,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerText: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  infoContainer: {
    borderTopWidth: 4,
    borderTopColor: 'yellow',
    marginTop: 9,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 20,
  },
  infoText: {
    color: 'white',
    marginTop: 9,
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoValue: {
    color: 'black',
    backgroundColor: 'grey',
    borderRadius: 30,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  button: {
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'grey',
    borderRadius: 30,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: 'yellow',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 10,
    alignItems: 'center',
  },
});

export default SettingsScreen;