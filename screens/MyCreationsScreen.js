import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { db } from '../firebase-config';
import {
  query,
  orderBy,
  collection,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import Modal from 'react-native-modal';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const MyCreationsScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {

        // Retrieve user session information from AsyncStorage
        const sessionData = await AsyncStorage.getItem('session');
        if (sessionData !== null) {
          const sessionInfo = JSON.parse(sessionData);
          const userSessionId = sessionInfo.userId;
          setSession(sessionInfo);
         
          
          console.log('AsyncStorage userSession:', sessionInfo);

          const ref = collection(db, 'generated');
          const q = query(ref, orderBy('Timestamp', 'desc')); // Order by Timestamp field in descending order

          const unsubscribe = onSnapshot(q, (generated) => {
            const userData = generated.docs
              .map((category) => ({
                id: category.id,
                data: category.data(),
              }))
              .filter((item) => item.data.Timestamp !== null); // Filter out null Timestamp values

              const filteredData = userData.filter((item) => {
                const fetchedData = item.data;

                if (fetchedData && fetchedData.userid) {
                  // console.log("F userid",fetchedData.userid)
                  return fetchedData.userid === userSessionId;
                }
                return false; // Or handle the case when userId is not present in fetchedData
              });


            // Sort based on Timestamp in descending order
            filteredData.sort((a, b) => {
              const timestampA = a.data.Timestamp ? a.data.Timestamp.toDate() : null;
              const timestampB = b.data.Timestamp ? b.data.Timestamp.toDate() : null;
      
              if (!timestampA || !timestampB) return 0; // Handle null values
      
              return timestampB - timestampA;
            });
      

            setData(filteredData);
            setLoading(false);
          });

          return () => {
            unsubscribe();
          };
        } else {
          // Handle case where user session info is not available in AsyncStorage
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }


  const openImageModal = (image) => {
    setSelectedImage(image);
  };


  const closeImageModal = () => {
    setSelectedImage(null);
  };

  
  const deleteImage = async (imageId) => {
    try {
      
      // Delete the document from Firestore
      await deleteDoc(doc(db, 'generated', imageId));
  
      // Close the image modal and update the data array
      closeImageModal();
      setData(data.filter((item) => item.id !== imageId));
  
      console.log('Image deleted from Firestore Database');
    } catch (error) {
      console.log('Error deleting image:', error);
    }
  };


  const saveImageToGallery = async (imageUri) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to storage to save images.',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
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
          .fetch('GET', imageUri)
          .then((res) => {
            // Retrieve the downloaded file's path from the response
            const downloadedFilePath = res.path();
            console.log('The file saved to ', downloadedFilePath);
            Alert.alert('File downloaded successfully');
          })
          .catch((error) => {
            console.log('Error downloading file:', error);
          });
      } else {
        console.log('Storage permission denied.');
      }
    } catch (error) {
      console.log(error);
    }
  };


  const renderGalleryItems = () => {
    return data.map((item) => {
      if (item.data && item.data.Picture) {
        return (
          <TouchableOpacity
          key={item.id}
          style={styles.galleryItem}
          onPress={() => navigation.navigate('ImageDetail', { image: item })}
        >
          <Image
            source={{ uri: item.data.Picture }}
            style={styles.galleryImage}
          />
        </TouchableOpacity>
        );
      } else {
        return null;
      }
    });
  };
  

  return (
    <LinearGradient colors={['black', 'purple']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Creations</Text>
      </View>

      <ScrollView contentContainerStyle={styles.galleryContainer}>
        {renderGalleryItems()}
      </ScrollView>

      <Modal
        isVisible={selectedImage !== null}
        onBackdropPress={closeImageModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.7}
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage.data.Picture }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => deleteImage(selectedImage.id, selectedImage.data.Picture)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() =>
                navigation.navigate('ImageEdit', { image: selectedImage.data.Picture })
              }
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={() => saveImageToGallery(selectedImage.data.Picture)}
            >
              <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>
          </View>

        </View>
        <Text style={styles.clickToCloseText}>
          Click anywhere to close
        </Text>
      </Modal>

      <LinearGradient colors={['black', 'purple']} style={styles.container1}>
        <View></View>
      </LinearGradient>

    </LinearGradient>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262626',
    marginBottom: 135,

  },

  container1: {
    flex: 2,
    backgroundColor: '#262626',
    marginBottom: 55,

  },
  header: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262626',
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  galleryContainer: {
    flexDirection: 'row',
    borderTopWidth: 4,
    borderTopColor: 'yellow',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Arrange images with space between
    padding: 5, // Add some padding around the gallery

  },
  galleryItem: {
    marginTop: 10,
    width: '48%', // Display two images in a row with slight gap
    aspectRatio: 1, // Maintain aspect ratio
    marginBottom: 10, // Add some space below each image
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  
  clickToCloseText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },

  galleryImage: {
    width: '100%',
    height: '100%',
    
  },
  deleteButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 255, 0)', // Adjust the alpha channel as needed
    borderRadius: 30,
    padding: 20,
    width: width - 40,
    alignItems: 'center',      // Center horizontally
    justifyContent: 'center',  // Center vertically
    position: 'relative',      // Ensure position relative for absolute positioning of overlay
  },
  
  modalImage: {
    width: 325,
    height: 350,
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopColor: 'yellow',
    borderTopWidth: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

  },
  button: {
    padding: 10,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15
  },
  deleteButton: {
    backgroundColor: 'black',
  },
  editButton: {
    backgroundColor: 'black',
  },
  downloadButton: {
    backgroundColor: 'black',
  },
  buttonText: {
    color: 'yellow',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MyCreationsScreen;