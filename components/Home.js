import React, { useEffect, useState } from "react"  
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from "react-native"  
import { useUserContext } from "../contexts/UserInfo"  
import { GoogleSignin } from "@react-native-google-signin/google-signin"  
import auth from "@react-native-firebase/auth"  
import { useNavigation } from "@react-navigation/native"  
import { createStackNavigator } from "@react-navigation/stack"  
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer"  
import { Ionicons } from "@expo/vector-icons"  
import { NavigationContainer } from "@react-navigation/native"  
import Profile from "./Profile"  
import { SafeAreaView } from "react-native-safe-area-context"  
import AwesomeAlert from "react-native-awesome-alerts"  
import * as Font from "expo-font"  
import Icon from 'react-native-vector-icons/FontAwesome5'  
import ScannedQr from "./ScannedQr"  


const HomeIcon = ({ focused }) => (
  <Ionicons
    name={focused ? "home" : "home-outline"}
    size={24}
    color={focused ? "#134e4a" : "black"}
  />
)  

const ProfileIcon = ({ focused }) => (
  <Ionicons
    name={focused ? "person" : "person-outline"}
    size={24}
    color={focused ? "#134e4a" : "black"}
  />
)  

const QrCodeIcon = ({ focused }) => (
  <Ionicons
    name={focused ? "scan" : "scan-outline"}
    size={24}
    color={focused ? "#134e4a" : "black"}
  />
)  

const LogoutIcon = ({ focused }) => (
  <Ionicons
    name={focused ? "log-out" : "log-out-outline"}
    size={24}
    color={focused ? "#c7001b" : "#c7001b"}
  />
)  

const Drawer = createDrawerNavigator()  

function CustomDrawerContent(props) {
  const { userInfo, setUserInfo } = useUserContext()  
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)  
  const [isLoading, setIsLoading] = useState(false)  
  const signOut = async () => {
    try {
      setIsLoading(true)  

      await GoogleSignin.revokeAccess()  
      await auth().signOut()  
      await GoogleSignin.signOut()  
      setShowLogoutAlert(false)  
      props.navigation.navigate("Form")  
      setUserInfo(null)  
      setIsLoading(false)  
    } catch (error) {
      console.log(error)  
    }
    return
  }  
  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.notLoggedInText}>User is not logged in</Text>
      </View>
    )  }
  return (
    <DrawerContentScrollView {...props}>
    <View style={styles.profileContainer}>
        <Image
          source={{ uri: userInfo.photoURL || 'default-profile-image-url' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userInfo.displayName}</Text>
      </View>
      <DrawerItemList {...props} />

      <DrawerItem
        label="Logout"
        labelStyle={styles.logout}
        onPress={() => {
          setIsLoading(true)  
          setShowLogoutAlert(true)  
        }}
        icon={({ focused }) => <LogoutIcon focused={focused} />}
      />
      <AwesomeAlert
        contentContainerStyle={styles.alertContainerStyle}
        show={showLogoutAlert}
        showProgress={false}
        title="Logout"
        message="Do you want to logout?"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="No"
        confirmText="Yes"
        confirmButtonColor="#c7001b"
        cancelButtonColor="#02b841"
        onConfirmPressed={signOut}
        onCancelPressed={() => setShowLogoutAlert(false)}
        titleStyle={styles.alertTitle}
        messageStyle={styles.alertMessage}
        confirmButtonTextStyle={styles.alertButtonText}
        cancelButtonTextStyle={styles.alertButtonText}
      />
    </DrawerContentScrollView>
  )  
}

function HomeScreen({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false)  
  const { userInfo, setUserInfo } = useUserContext()  

  useEffect(()=>{
    if(!userInfo){
      navigation.navigate("Form")  
    }
  },[userInfo])
  const loadFonts = async () => {
    await Font.loadAsync({
      "OpenSans-Regular": require("../assets/open-sans/OpenSans-Regular.ttf"),
      "OpenSans-Bold": require("../assets/open-sans/OpenSans-Bold.ttf"),
      "OpenSans-Semibold": require("../assets/open-sans/OpenSans-Semibold.ttf"),
      "OpenSans-Light": require("../assets/open-sans/OpenSans-Light.ttf"),
    })  
    setFontsLoaded(true)  
  }  

  useEffect(() => {
    loadFonts()  
  }, [])  


  const handleScanPress = () => {
    navigation.navigate("ScanQrCode")  
  }  

  return (
    <View>
      <Text style={{ fontSize: 28, margin: 20, fontFamily: "OpenSans-Bold",color:"#303030" }}>
        Scannez le qr code d'un client
      </Text>
      <View style={{ backgroundColor: "#dedede", margin: 20, borderRadius: 5 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "300",
            margin: 20,
            fontFamily: "OpenSans-Regular",
          }}
        >
          Lorsque vous scannez le qr code du client, nous sommes automatiquement
          informés de la date, l'heure et la position du scan.
        </Text>
      </View>
      <View style={styles.ButtonView}>
      <TouchableOpacity
    title="ScanQrCode"
    onPress={handleScanPress}
    style={styles.container}
  >
    <Icon name="qrcode" size={24} color="white" style={styles.icon} />
    <Text
      style={{
        fontSize: 20,
        color: "white",
        fontFamily: "OpenSans-Regular",
      }}
    >
      Scan
    </Text>
  </TouchableOpacity>
      </View>
    </View>
  )  
}

export default function AppNavigator() {
  return (
    <SafeAreaView style={[styles.safeAreaStyle]}>
      <Drawer.Navigator
        useLegacyImplementation={true}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveTintColor: "#134e4a",
          drawerLabelStyle: {
            color: "black",
            fontFamily: "OpenSans-Regular",
            fontSize: 16,
          },
        }}
      >
        <Drawer.Screen
          name="Home Page"
          component={HomeScreen}
          options={{
            drawerIcon: ({ focused }) => <HomeIcon focused={focused} />,
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={Profile}
          options={{
            drawerIcon: ({ focused }) => <ProfileIcon focused={focused} />,
          }}
        />
        <Drawer.Screen
          name="Scanned Qrcode "
          component={ScannedQr}
          options={{
            drawerIcon: ({ focused }) => <QrCodeIcon focused={focused} />,
          }}
        />
      </Drawer.Navigator>
    </SafeAreaView>
  )  
}

const styles = StyleSheet.create({
  alertContainerStyle: {
    paddingHorizontal: 30,
    paddingBottom: 20,
    paddingTop: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    marginLeft: 20,
  },
  icon: {
    marginRight: 8,
  },  
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileName: {
    fontFamily: "OpenSans-Regular",
    fontSize: 16,
  },
  ButtonView: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: 100,
  },
  safeAreaStyle: {
    flex: 1,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    height: 60,
    width: 180,
    borderRadius: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#134e4a",
    elevation: 3,
  },
  logout: {
    color: "#c7001b",
    fontFamily: "OpenSans-Bold",
    fontSize: 20,
  },
  card: {
    backgroundColor: "#dedede",
    margin: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    transform: [
      { perspective: 1000 },
      { rotateX: "-2deg" },
      { rotateY: "2deg" },
    ],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 20,
    margin: 20,
    fontFamily: "OpenSans-Regular",
  },
  alertTitle: {
    fontSize: 24,
    fontFamily: "OpenSans-Bold",
  },
  alertMessage: {
    fontSize: 18,
    fontFamily: "OpenSans-Regular",
  },
  alertButtonText: {
    fontSize: 18,
    fontFamily: "OpenSans-Regular",
  },
})  
