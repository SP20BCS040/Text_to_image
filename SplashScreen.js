import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Animated } from 'react-native';

const SplashScreen = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const fadeIn = new Animated.Value(0);

  useEffect(() => {
    if (isImageLoaded) {
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000, // Adjust the duration as needed
        useNativeDriver: true,
      }).start();
    }
  }, [isImageLoaded, fadeIn]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('./screens/Images/2.png')}
          style={styles.logo}
          onLoad={handleImageLoad}
        />
        {isImageLoaded && (
          <Animated.View style={[styles.content, { opacity: fadeIn }]}>
            <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Use a more attractive background color
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  content: {
    marginTop: 20,
  },
  spinner: {
    marginTop: 20,
  },
});

export default SplashScreen;
