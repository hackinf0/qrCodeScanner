import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserContext } from '../contexts/UserInfo';
import * as Font from "expo-font";

const Profile = () => {
  const { userInfo } = useContext(UserContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "OpenSans-Regular": require("../assets/open-sans/OpenSans-Regular.ttf"),
      "OpenSans-Bold": require("../assets/open-sans/OpenSans-Bold.ttf"),
      "OpenSans-Semibold": require("../assets/open-sans/OpenSans-Semibold.ttf"),
      "OpenSans-Light": require("../assets/open-sans/OpenSans-Light.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);


  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.notLoggedInText}>User is not logged in</Text>
      </View>
    );
  }

  return (
    
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: userInfo.photoURL || 'default-profile-image-url' }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{userInfo.displayName}</Text>
          <View style={styles.emailContainer}>
            <MaterialIcons name="email" size={24} color="#c5221f" style={styles.emailIcon} />
            <Text style={styles.email}>{userInfo.email}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 20,
    },
    profileInfo: {
      flex: 1,
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    emailContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    emailIcon: {
      marginRight: 5,
    },
    email: {
      fontSize: 16,
    },
  });
export default Profile;
