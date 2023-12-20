import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useFocusEffect } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';


const ImageDetailScreen = ({ route, navigation }) => {
  const { image } = route.params;
  const [imageData, setImageData] = React.useState(image.data || { Picture: '' });

  // Use useFocusEffect to refetch the image data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onSnapshot(doc(db, 'generated', image.id), (snapshot) => {
        // Update the state with the latest image data
        setImageData(snapshot.data());
      });

      return () => unsubscribe();
    }, [image.id])
  );

  const deleteImage = async () => {
    try {
      // Delete the document from Firestore
      await deleteDoc(doc(db, 'generated', image.id));

      // Display a success message
      Alert.alert('Image Deleted', 'The image has been deleted successfully.');

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.log('Error deleting image:', error);
    }
  };

  const editImage = () => {
    navigation.navigate('ImageEdit', { image: image.data.Picture });
  };

  const saveImageToGallery = async () => {
    try {
      const { config, fs } = RNFetchBlob;
      const fileDir = fs.dirs.DownloadDir;
      const timestamp = Date.now();
      const fileName = `download_${timestamp}.jpg`;
      const filePath = `${fileDir}/${fileName}`;

      config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: 'File Download',
        },
      })
        .fetch('GET', image.data.Picture)
        .then((res) => {
          // Retrieve the downloaded file's path from the response
          const downloadedFilePath = res.path();
          console.log('The file saved to ', downloadedFilePath);
          Alert.alert('File downloaded successfully');
          navigation.goBack();
        })
        .catch((error) => {
          console.log('Error downloading file:', error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
              <Text style={styles.headerText}>Image Menu</Text>

      <Image
        source={{ uri: imageData?.Picture || 'https://example.com/default-image.jpg' }}
        style={styles.image}
        resizeMode="cover" // Use "cover" for an elegant look
      />
      <View style={styles.buttonsContainer}>

      <TouchableOpacity style={styles.button} onPress={saveImageToGallery}>
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={editImage}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={deleteImage}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
   
    color: 'yellow',
  },
  image: {
    width: '100%',
    height: '50%',
    // Add some border radius for a modern look
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    padding: 20,
    backgroundColor: 'black', // Dark background color
    borderRadius: 20, // Add border radius for a nicer look
    marginRight:20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize:15
  },
  backButton: {
    fontSize:15,
    padding: 20,
    position: 'absolute',
    bottom: -120,
    left: -10,
    backgroundColor: 'black',
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default ImageDetailScreen;