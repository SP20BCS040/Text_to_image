import React, { useState, useRef } from 'react'; import {
    Text,
    View,
    StyleSheet,
    Image,
    Dimensions,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    Brightness,
    ColorMatrix,
    concatColorMatrices,
    contrast,
    saturate,
    brightness,
} from 'react-native-color-matrix-image-filters';
import ViewShot from 'react-native-view-shot';
import { storage } from '../firebase-config';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const FilterScreen = ({ route }) => {
    const { image, editedImage} = route.params;
    const navigation = useNavigation();

    const [effect, setEffect] = useState('original');
    const [filteredImageURI, setFilteredImageURI] = useState(null); // To store the filtered image URI
    const viewShotRef = useRef(); // Reference to the ViewShot component


    const effectOnPress = (selectedEffect) => {

        setEffect(selectedEffect);
    };


    const applyEffectAndNavigateBack = async (selectedEffect) => {
        // Capture the filtered image using ViewShot
        viewShotRef.current.capture()
            .then(async (uri) => {
                // Log the URI to the console
                console.log('Captured Image URI:', uri);

                // Set the filtered image URI
                setFilteredImageURI(uri);
                uploadImageToFirebase(uri);
                
            })
            .catch((error) => {
                // Handle any errors that occur during the capture process
                console.error('Error capturing image:', error);
            });
    };

    const uploadImageToFirebase = async (imageurl) => {

        const storageRefPath = storageRef(storage, `Generated_images/${imageurl}`);
        const imageBlob = await fetch(imageurl).then((response) => response.blob());
    
        try {
          await uploadBytes(storageRefPath, imageBlob);
          const imageUrl = await getDownloadURL(storageRefPath);
          console.log('Firebase Storage Image URL:', imageUrl);

            // Now you can navigate back or perform any other action with the URI
          navigation.navigate('ImageEdit', { image : imageUrl });
    
    
        } catch (error) {
          console.error('Error uploading image to Firebase Storage:', error);
        } finally {
        }
      };



      return (
        <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity
                onPress={() => navigation.goBack()} // Navigate back to the previous screen
                style={styles.backButton}>
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <View style={{flex:1}}>
            <View style={styles.mainImageWrapper}>

                {/* Use ViewShot to capture the filtered image */}
                <ViewShot ref={viewShotRef} options={{  quality: 1.0 }}>
                    {effect === 'original' ? (
                        <Image
                            style={styles.mainImage}
                            source={{ uri:  editedImage || image }}
                        />
                    ) : null}

                    {effect === 'brightness' ? (
                        <ColorMatrix matrix={concatColorMatrices(brightness(1.5))}>
                            <Image
                                style={styles.mainImage}
                                source={{ uri:  editedImage || image }}
                            />
                        </ColorMatrix>
                    ) : null}

                    {effect === 'saturate' ? (
                        <ColorMatrix matrix={concatColorMatrices(saturate(2.5))}>
                            <Image
                                style={styles.mainImage}
                                source={{ uri:  editedImage || image }}
                            />
                        </ColorMatrix>
                    ) : null}

                    {effect === 'contrast' ? (
                        <ColorMatrix matrix={concatColorMatrices(contrast(2.5))}>
                            <Image
                                style={styles.mainImage}
                                source={{ uri:  editedImage || image }}
                            />
                        </ColorMatrix>
                    ) : null}

                </ViewShot>

            </View>



            <View style={styles.effectPreviewWrapper}>
                <ScrollView horizontal={true}>

                    <TouchableOpacity
                        onPress={() => effectOnPress('original')}
                        style={styles.previewImageWrapper}>
                        <Text style={styles.previewTitle}>Original</Text>
                        <Brightness>
                            <Image
                                style={styles.previewImage}
                                source={{ uri:  editedImage || image }}
                            />
                        </Brightness>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => effectOnPress('brightness')}
                        style={styles.previewImageWrapper}>
                        <Text style={styles.previewTitle}>Brightness</Text>
                        <ColorMatrix matrix={concatColorMatrices(brightness(1.5))}>
                            <Image
                                style={styles.previewImage}
                                source={{ uri:  editedImage || image }}
                            />
                        </ColorMatrix>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => effectOnPress('saturate')}
                        style={styles.previewImageWrapper}>
                        <Text style={styles.previewTitle}>Saturate</Text>
                        <ColorMatrix matrix={concatColorMatrices(saturate(2.5))}>
                            <Image
                                style={styles.previewImage}
                                source={{ uri:  editedImage || image }}
                            />
                        </ColorMatrix>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => effectOnPress('contrast')}
                        style={styles.previewImageWrapper}>
                        <Text style={styles.previewTitle}>Contrast</Text>
                        <ColorMatrix matrix={concatColorMatrices(contrast(2.5))}>
                            <Image
                                style={styles.previewImage}
                                source={{ uri:  editedImage || image }}
                            />
                        </ColorMatrix>
                    </TouchableOpacity>
                </ScrollView>

                <TouchableOpacity
                    onPress={() => applyEffectAndNavigateBack(effect)}
                    style={styles.confirmButton}>
                    <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>

            </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'purple',
    },
   
    mainImageWrapper: {
        
        marginTop:50,
        alignItems:'center',
        
    },
    effectPreviewWrapper: {
        marginTop: '5%',
        marginLeft: '5%',
        marginRight: '5%',
    },
    
    mainImage: {
        width: 325,
        height: 350,
        marginBottom:30,
        
        
    },
    previewImage: {
        width: width / 4,
        height: width / 4,
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
    },
    previewImageWrapper: {
        alignItems: 'center',
        marginRight: 10,
    },
    confirmButton: {
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
    },
    buttonText: {
        color:'white'
    },

    backButton: {
        position: 'absolute',
        
        bottom: 20,
        left: 20,
        padding: 20,
        backgroundColor: 'black',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
});

export default FilterScreen;
