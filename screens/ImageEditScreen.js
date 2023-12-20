import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import ImageCropPicker from 'react-native-image-crop-picker';
import { addDoc, collection, serverTimestamp} from 'firebase/firestore';
import { db, storage} from '../firebase-config';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';


const ImageEditScreen = ({ route }) => {
  const { image } = route.params;
  const [editedImage, setEditedImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [session, setSession] = useState(null);
  const navigation = useNavigation(); // Initialize navigation hook

  useEffect(() => {
    retrieveSession();
  }, []);

  const retrieveSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('session');
      if (sessionData !== null) {
        const sessionInfo = JSON.parse(sessionData);
        setSession(sessionInfo);
      }
    } catch (error) {
      console.log('Error retrieving session:', error);
    }
  };


  const openImagePicker = async () => {
    try {
      const croppedImage = await ImageCropPicker.openCropper({
        path: image,
        width: 500, // Increase width and height for a larger image
        height: 500,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.7,
      });

      setEditedImage(croppedImage.path);
      uploadImageTostorage(croppedImage.path);

      setShowOriginal(false);

      // Set the editedImage in route.params
      navigation.setParams({ ...route.params, editedImage: croppedImage.path });

    } catch (error) {
      console.log('Error cropping image:', error);
    }
  };


  const uploadImageTostorage = async (imageurl) => {

    const storageRefPath = storageRef(storage, `Generated_images/${imageurl}`);
    const imageBlob = await fetch(imageurl).then((response) => response.blob());

    try {
      await uploadBytes(storageRefPath, imageBlob);
      const imageUrl = await getDownloadURL(storageRefPath);
      console.log('Firebase Storage Image URL:', imageUrl);
      setEditedImage(imageUrl);


    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
    } finally {
    }
  };



  const saveImageToDatabase = async () => {
    try {

      const userId = session.userId;

      if (editedImage || image) {
        // Replace this with your actual database saving logic
        // For example, if you're using Firebase Firestore:
        const docRef = await addDoc(collection(db, 'generated'), {
          Picture: editedImage || image,
          Timestamp: serverTimestamp() ,
          userid: userId,
        });

        console.log('edited image saved');

        // Clear the editedImage state
        setEditedImage('');

        // Navigate back to "MyCreation" screen
        navigation.navigate('My Creations');
      } else {
        console.log('No edited image save.');
      }
    } catch (error) {
      console.error('Error uploading edited image data:', error);
    }
  };


  const navigateToFilterScreen = () => {
    // Pass the editedImage as a parameter when navigating to the "Filters" screen
    navigation.navigate('Filters', { image , editedImage });
  };

  return (
    <View style={styles.container}>
                    <Text style={styles.headerText}>Edit Options</Text>

      <View style={styles.content}>
        {showOriginal && (
          <Image source={{ uri: image }} style={styles.image} />
        )}

        {editedImage && !showOriginal && (
          <Image source={{ uri: editedImage || image }} style={styles.image} />
        )}

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={navigateToFilterScreen}>
            <Text style={styles.buttonText}>Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={openImagePicker}>
            <Text style={styles.buttonText}>Crop Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={saveImageToDatabase}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e', // Dark background color
    
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    
    marginTop:30,
    color: 'yellow',
    textAlign:'center'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20, // Add top padding for better spacing
  },
  image: {
    width: '100%',
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    bottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 10,
  },
  button: {
    padding: 20,
    backgroundColor: 'black', // Dark background color
    borderRadius: 30, // Add border radius for a nicer look
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImageEditScreen;