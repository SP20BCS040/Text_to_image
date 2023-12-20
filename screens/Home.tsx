import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import 'react-native-url-polyfill/auto';
import { db, storage } from '../firebase-config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";


type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Home'>;
};

interface HomeScreenRouteParams {
  recognizedText: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const route = useRoute();
  console.log('Route Params:', route.params);

  const recognizedText =
    (route.params as HomeScreenRouteParams)?.recognizedText || '';

  const [prompt, onChangePrompt] = useState('');
  const [imageData, setImageData] = useState('');
  const [inputErrorMessage, setinputErrorMessage] = useState('');
  const [picture, setPicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePlaceholder, setImagePlaceholder] = useState(
    'https://furntech.org.za/wp-content/uploads/2017/05/placeholder-image-300x225.png'
  );
  const [refreshing, setRefreshing] = useState(false);
  const [negativeCommand, onChangeNegativeCommand] = useState('');
  const [mysteps, onChangemysteps] = useState('');


  const preWrittenDescriptions = [
    "A cute cat",
    "A dog inside the water",
    "A horse inside a spaceship",
    "A monkey on Mars",
    "A superman",
    "A portrait of a man with beard",
    "Barak Obama with Beard",
    "Imran Khan in space",
    "A beautiful horse floating above water",
    // Add more descriptions as needed
  ];

  const handleRefresh = async () => {
    setRefreshing(true);

    // Reset state values to their initial state
    onChangePrompt('');
    setinputErrorMessage('');
    setImageData('');
    setPicture('');
    setLoading(false);
    setImagePlaceholder(
      'https://furntech.org.za/wp-content/uploads/2017/05/placeholder-image-300x225.png'
    );

    // Fetch any necessary data or perform other refresh logic here

    setRefreshing(false);
  };


  const clearText = () => {
    onChangePrompt('');
  };


  const insertRandomDescription = () => {
    const randomIndex = Math.floor(Math.random() * preWrittenDescriptions.length);
    const randomDescription = preWrittenDescriptions[randomIndex];
    onChangePrompt(randomDescription);
  };


  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    onChangePrompt(recognizedText);
  }, [recognizedText]);

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


  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };

  const GenerateImageRequest = async (prompt: string, nprompt: string,steps:string) => {

    const data = {
      inputs: prompt,
      negative_prompt:nprompt,
      num_inference_steps: steps
    };

    try {
      setLoading(true);
      const response = await fetch('http://192.168.137.145:8080/generate_image', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        console.log('Network response was not ok');
      }

      const mimeType = response.headers.get("content-type");

      const Data = await response.json();
      const imageData = Data.image; // This will contain the base64 encoded image string
      console.log('result',imageData);
      const img = `data:${mimeType};base64,${imageData}`;
      console.log('Image Data', img);

//    Set the result state
          
       setLoading(false);
       setImageData(img);


    } catch (error) {
        console.error("Error making the request:", error);
        setLoading(false);
        return null;
      }

  };


  const generateImage = () => {

    setinputErrorMessage('');

    if (

      prompt.trim() === ''

    ) {

      if (prompt.trim() === '') {
        setinputErrorMessage('Please enter text description.');
      }

      return;
    } {
      setImageData('');
      setPicture('');
      GenerateImageRequest(prompt.trim(),negativeCommand.trim(),mysteps.trim());
    }
  };


  const viewShotRef = useRef<ViewShot>(null);

const captureImage = async () => {
  try {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const captureMethod = viewShotRef.current?.capture; // Optional chaining
    if (captureMethod) {
      const uri = await captureMethod(); // Capture the image
      // Log the URI to the console
      console.log('Captured Image URI:', uri);
      uploadImageToFirebase(uri);
      setPicture(uri); // Set the captured image URI to the 'picture' state
    } else {
      console.error("viewShotRef.current.capture is not available.");
    }
    setLoading(false);
  } catch (error) {
    console.error("Error capturing image:", error);
    setLoading(false);
  }
};



useEffect(() => {
  if (imageData !== '' ) {
    captureImage();
  }
}, [imageData]);


// console.log(userId);

const uploadImageToFirebase = async (imageUri: RequestInfo) => {

    const storageRefPath = storageRef(storage, `Generated_images/${prompt}`);
    const imageBlob = await fetch(imageUri).then((response) => response.blob());

    try {
      await uploadBytes(storageRefPath, imageBlob);
      const imageUrl = await getDownloadURL(storageRefPath);
      console.log('Firebase Storage Image URL:', imageUrl);
      uploadGenerated(imageUrl);


    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
    } finally {
    }
  };

  const uploadGenerated = async (imageUrl: string | undefined) => {
    console.log('databast',imageUrl);

    const userId = session.userId;
      try {
        // Add a new document to the 'generated' collection with Title, Picture, and Timestamp fields
        const docRef = await addDoc(collection(db, "generated"), {
          Title: prompt,
          Picture: imageUrl,
          userid: userId,
          Timestamp: serverTimestamp() // Use serverTimestamp to get the current server time
        });
        console.log("Generated uploaded successfully");
      } catch (error) {
        console.error("Error uploading generated data:", error);
      } finally {
        // Reset the 'picture' state to an empty string after uploading
        setPicture("");
      }
  }

  const [showNegativeCommandInput, setShowNegativeCommandInput] = useState(false);
  const [showsteps, setShowsteps] = useState(false);

  // useEffect(() => {
  //   if (imageData !== ''){
  //   uploadGenerated();
  //   }
  // }, [picture]);





  return (
    
    <ScrollView
     refreshControl={
       <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0000ff']} />
     }
   >
 <LinearGradient colors={['black', 'purple']} style={styles.container}>
 <View>
 <ScrollView> 
     <View style={styles.header}>
       <Image source={require('./Images/2.png')} style={styles.logo} />
       <Text style={styles.heading}>Word Vision</Text>
     </View>

     <Text style={styles.subtitle}>Bring Your Words to Life!</Text>
    
     <View style={styles.inputContainer}>
       <TextInput
         style={styles.input}
         placeholder="Enter your text..."
         onChangeText={(text) => onChangePrompt(text)}
         value={prompt}
         multiline
         numberOfLines={4}
         placeholderTextColor="#777"
       />
       <TouchableOpacity style={styles.cameraButton} onPress={navigateToCamera}>
         <Icon name="photo-camera" size={30} color="white" />
       </TouchableOpacity>
     </View>

     {inputErrorMessage ? <Text style={{ color: 'red', marginLeft:100, }}>{inputErrorMessage}</Text> : null}

     {/* Add TextInput for Negative Command */}
     

     <View style={styles.buttonContainer}>
       <TouchableOpacity onPress={insertRandomDescription}>
         <Text style={styles.buttonText}>Try an Example</Text>
       </TouchableOpacity>
       <TouchableOpacity onPress={clearText}>
         <Text style={[styles.buttonText, styles.clearButton]}>Clear</Text>
       </TouchableOpacity>
     </View>

     <TouchableOpacity
       onPress={() => setShowNegativeCommandInput(!showNegativeCommandInput)}
       style={[styles.button, { marginLeft: -15,marginBottom:15 }]}
     >
       <Text style={[styles.buttonText1 ]}>
         {showNegativeCommandInput ? 'Hide ▲' : 'Enter Negative command ▼'}  
       </Text>
     </TouchableOpacity>

     {showNegativeCommandInput && (
       <View style={styles.inputContainer}>
         <TextInput
           style={styles.input}
           placeholder="Enter negative command..."
           onChangeText={(text) => onChangeNegativeCommand(text)}
           value={negativeCommand}
           multiline
           numberOfLines={4}
           placeholderTextColor="#777"
         />
       </View>
     )}

     <TouchableOpacity
       onPress={() => setShowsteps(!showsteps)}
       style={[styles.button, { marginLeft: -15,marginBottom:15 }]}
     >
       <Text style={[styles.buttonText2 ]}>
         {showsteps ? 'Hide ▲' : 'Enter steps ▼'}  
       </Text>
     </TouchableOpacity>

     {showsteps && (
       <View style={styles.inputContainer}>
         <TextInput
           style={styles.input}
           placeholder="Enter steps..."
           onChangeText={(text) => onChangemysteps(text)}
           value={mysteps}
           multiline
           numberOfLines={4}
           placeholderTextColor="#777"
         />
       </View>
     )}

     {/* Conditionally render the "Generate" button */}
     {!showNegativeCommandInput && !showsteps && (
       <TouchableOpacity style={styles.generateButton} onPress={generateImage}>
         <Text style={styles.generateButtonText}>Generate</Text>
       </TouchableOpacity>
     )}

     {loading && (
       <View style={styles.loadingContainer}>
         <View style={{ width: 300 }}>
           <ProgressBar styleAttr="Horizontal" color="white" progress={0.5} />
         </View>
         <Text style={styles.loadingText}>Generating...</Text>
       </View>
     )}



       <View style={styles.imageContainer}>
         <ViewShot ref={viewShotRef} >
           <Image
           style={imageData ? styles.generatedImage : styles.placeholderImage}
             source={{ uri: imageData || imagePlaceholder }}
           />
         </ViewShot>
       </View>
      
       </ScrollView> 
  </View>
 </LinearGradient>
 </ScrollView>

);
};





const styles = StyleSheet.create({
container: {
 flex: 1,
 backgroundColor: '#111',
 paddingHorizontal: 20,
 paddingTop: 40,


},

buttonContainer: {
 flexDirection: 'row',
 marginBottom: 15,
},

buttonText: {
 color: 'white',
 fontSize: 15,
}, 
buttonText1: {
 color: 'yellow',
 fontSize: 15,
},
buttonText2: {
 color: 'yellow',
 fontSize: 15,
 marginTop:-8,
},
clearButton: {
 marginLeft: 190, // Adjust this value as needed to move the Clear button left
},

header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 borderBottomWidth: 4,
 borderBottomColor: 'white',
 marginBottom: 20,
 paddingBottom: 10,
 borderBottomLeftRadius: 50,
 borderBottomRightRadius: 50,
},
logo: {
 width: 100,
 height: 70,
 borderRadius: 40,
 marginLeft: -80,
},
heading: {
 color: 'white',
 fontSize: 30,
 fontWeight: 'bold',
 marginLeft: 10,
},
subtitle: {
 color: '#bbb',
 fontSize: 18,
 fontWeight: 'bold',
 marginVertical: 10,
 textAlign: 'center',
},
inputContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: 'white',
 borderRadius: 25,
 paddingHorizontal: 15,
 marginBottom: 15,
},
input: {
 flex: 1,
 fontSize: 16,
 color: 'black'
},
cameraButton: {
 backgroundColor: 'blue',
 borderRadius: 25,
 padding: 10,
 marginLeft: 10,
},
generateButton: {
 backgroundColor: 'yellow',
 borderRadius: 30,
 padding: 15,
 alignItems: 'center',
 marginBottom: 20,
 marginHorizontal: 70
},
generateButtonText: {
 color: 'black',
 fontSize: 18,
 fontWeight: 'bold',
},
loadingContainer: {
 alignItems: 'center',
 marginTop: 20,
},
loadingText: {
 marginTop: 10,
 color: 'white',
},
imageContainer: {
 alignItems: 'center',
 flex:2,
 marginBottom:240,


},
generatedImage: {
 width: 300,
 height: 300,
 resizeMode: 'contain',
 borderRadius: 30,
 marginTop: 30,
 
 
},
placeholderImage: {
  width: 300,
  height: 300,
  resizeMode: 'contain',
  borderRadius: 30,
  marginTop: 30,
  marginLeft:-100
  
 },
sessionContainer: {
 backgroundColor: 'white',
 borderRadius: 10,
 padding: 10,
 margin: 10,
},
sessionText: {
 fontSize: 16,
 fontWeight: 'bold',
 color: 'black',
 marginBottom: 5,
},
button: {
 
 borderRadius: 10,
 paddingVertical: 10,
 paddingHorizontal: 15,
 marginHorizontal: 5,
},
});

export default HomeScreen;