import React, { useState, useEffect } from 'react';
import { StatusBar, Text, View, Image, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TextRecognition from 'react-native-text-recognition';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';

type CameraScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Camera'>;
};

const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [image, setImage] = useState<Asset | null>(null);
  const [text, setText] = useState<string | null>(null);

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: any) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
        setText(null); // Clear previously recognized text
      }
    });
  };

  const captureImage = () => {
    launchCamera({ mediaType: 'photo' }, (response: any) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
        setText(null); // Clear previously recognized text
      }
    });
  };

  useEffect(() => {
    const recognizeText = async () => {
      if (image) {
        const result = await TextRecognition.recognize(image.uri ?? '');
        const joinedText = result.join('\n'); // Join array of strings into a single string
        setText(joinedText);
      }
    };

    recognizeText();
  }, [image]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const goBack = () => {
    console.log('Recognized Text:', text);
    navigation.navigate('Home', { recognizedText: text }); // Pass recognized text as a parameter
  };

  return (
    <LinearGradient colors={['#2b03a3', '#000']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Text Recognition</Text>
        <TextInput
          style={styles.textInput}
          value={text || ''}
          onChangeText={handleTextChange}
          multiline
          editable
          placeholder="Recognized Text"
          placeholderTextColor="#999"
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={selectImage}>
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={captureImage}>
            <Text style={styles.buttonText}>Capture Image</Text>
          </TouchableOpacity>
        </View>
        {image && <Image source={{ uri: image.uri }} style={styles.image} />}
        <View style={styles.goBackContainer}>
          <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
            <Text style={styles.goBackButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  textInput: {
    height: 200,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: 'white',
    borderRadius: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  goBackContainer: {
    position: 'absolute',
    left: 20,
    bottom: 20,
  },
  goBackButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen;