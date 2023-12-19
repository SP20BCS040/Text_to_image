import React from 'react';
import HomeScreen from './Home';
import MyCreationsScreen from './MyCreationsScreen';
import SettingsScreen from './SettingsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'My Creations') {
            iconName = 'image';
          } else if (route.name === 'Account') {
            iconName = 'settings';
          }

          return <Icon name={iconName} color={color} size={size} />;
        },
        tabBarLabelStyle: { marginBottom: 5, fontSize: 12, fontWeight: 'bold' },
        tabBarActiveTintColor: 'yellow',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#000033',
          borderTopWidth: 0,
          borderTopRightRadius:30,
          borderTopLeftRadius:30,        
          marginTop:-200,
          paddingBottom: 5,
          height: 70,
          
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home',headerShown:false }} />
      <Tab.Screen name="My Creations" component={MyCreationsScreen} options={{ tabBarLabel: 'Creations',headerShown:false }} />
      <Tab.Screen name="Account" component={SettingsScreen} options={{ tabBarLabel: 'Account',headerShown:false }} />
    </Tab.Navigator>
  );
};

export default Tabs;