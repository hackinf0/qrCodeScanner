import React, { useState, useEffect, useContext } from "react"  
import {
  Text,
  View,
  StyleSheet,
  Button,
  Animated,
  ActivityIndicator,
  Alert
} from "react-native"  
import { BarCodeScanner } from "expo-barcode-scanner"  
import * as Location from "expo-location"  
import { useAuthContext } from "../contexts/AuthToken"  
import { useTailwind } from "tailwind-rn"  
import AwesomeAlert from "react-native-awesome-alerts"  
import { useNavigation } from "@react-navigation/native"  
import { useGoogleIDContext } from "../contexts/UserInfo"  
import * as Font from "expo-font"  
import AsyncStorage from "@react-native-async-storage/async-storage"  


export default function Scanner() {
    const {authToken,setAuthToken} =useAuthContext()
    const [hasCameraPermission, setHasCameraPermission] = useState(null)  
    const [hasLocationPermission, setHasLocationPermission] = useState(null)  
    const [scanned, setScanned] = useState(false)  
    const [location, setLocation] = useState(null)  
    const [loading, setLoading] = useState(true)  
    const [errorMsg, setErrorMsg] = useState(null)  
    const tailwind = useTailwind()  
    const [alertMessage, setAlertMessage] = useState("")  
    const [showAlert, setShowAlert] = useState(false)  
    const navigation =useNavigation()
    const [userID, setUserID] = useState(null)  
    const [fontsLoaded, setFontsLoaded] = useState(false)  

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

    useEffect(() => {
      const fetchUserIDFromStorage = async () => {
        try {
          const storedUserID = await AsyncStorage.getItem("userID")  
          setUserID(storedUserID)  
        } catch (error) {
          console.log("Failed to fetch userID from storage:", error)  
        }
      }  
  
      fetchUserIDFromStorage()  
    }, [])  

    useEffect(() => {
        (async () => {
          try {
            // Request camera permission
            const { status: cameraStatus } =
              await BarCodeScanner.requestPermissionsAsync()  
            setHasCameraPermission(cameraStatus === "granted")  
            if (cameraStatus !== "granted") {
              return alert("Please grant camera permission")  
            }
    
            // Request location permission
            const { status: locationStatus } =
              await Location.requestForegroundPermissionsAsync()  
            setHasLocationPermission(locationStatus === "granted")  
            if (locationStatus !== "granted") {
              return alert("Please grant location permission")  
            }
    
            const userLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Highest,
              maximumAge: 10000,
            })  
            setLocation(userLocation)  
            console.log("Location", userLocation)  
          } catch (error) {
            console.log(error)  
            setErrorMsg("Failed to get user location")  
          }
        })()  
      }, [])

      useEffect(() => {
        const timer = setTimeout(() => {
          setLoading(false)  
        }, 2000)  
    
        return () => clearTimeout(timer)  
      }, [])  



      const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        setLoading(true);
        console.log("Sending data to server:", {
          qrInformation: data,
          userLocation: location,
          googleId: userID,
        });
      
        try {
          const response = await fetch("https://backendmobile-goag.onrender.com/scan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              qrInformation: data,
              userLocation: location,
              googleId: userID,
            }),
          });
      
          const responseData = await response.json();
          console.log("Response data:", responseData);
          console.log("Response status:", response.status);
          console.log("Response status text:", response.statusText);
      
          if (responseData.success) {
            setAlertMessage(`Successfully scanned: ${data}`);
            setShowAlert(true);
          } else {
            if (responseData.message === "QR code already scanned today. Please try again tomorrow.") {
              // Show confirmation pop-up to scan again
              setShowAlert(false);
              Alert.alert(
                "QR Code Already Scanned",
                "You have already scanned for the day. Do you want to scan again?",
                [
                  {
                    text: "No",
                    onPress: () => {
                      setScanned(false);
                      setLoading(false);
                    },
                    style: "cancel",
                  },
                  {
                    text: "Yes",
                    onPress: () => {
                      setScanned(false);
                      setLoading(false);
                      handleBarCodeScanned({ type, data });
                    },
                  },
                ],
                { cancelable: false }
              )}else {
              // Other error message
              setAlertMessage(responseData.message);
              setShowAlert(true);
            }
          }
        } catch (error) {
          console.error(error);
          setAlertMessage(error);
          setShowAlert(true);
        }
      };
      
    
      const hideAlert = () => {
        setShowAlert(false)  
        setScanned(false)  
        navigation.goBack()  
      }  
      if (errorMsg) {
        console.log(errorMsg)  
      }
    
      if (hasCameraPermission === null || hasLocationPermission === null) {
        return <Text>Requesting for camera and location permission</Text>  
      }
    
      if (hasCameraPermission === false || hasLocationPermission === false) {
        return <Text>No access to camera or location</Text>  
      }

 return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.camera}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame}>
          <View style={styles.scanLineHorizontal} />
        </View>
      </View>
      {loading && (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator color="black" size="large" />
        </View>
      )}
      {scanned && (
        <Button
          title="Tap to Scan Again"
          onPress={() => setScanned(false)}
          style={tailwind("bg-blue-500 py-2 px-4 rounded mt-4")}
          textStyle={tailwind("text-white")}
        />
      )}
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        contentContainerStyle={styles.alertContainerStyle}
        title="Scan Result"
        titleStyle={{ fontFamily: "OpenSans-Bold" }}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#02b841"
        onConfirmPressed={hideAlert}
        messageStyle={styles.alertText}
        confirmButtonStyle={styles.confirmButton}
      />
    </View>
  )  
}

const styles = StyleSheet.create({
  alertContainerStyle: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 30,
  },
  alertText: {
    fontSize: 18,
    marginBottom: 8,
    fontFamily: "OpenSans-Regular",
  },
  confirmButton: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontFamily: "OpenSans-Regular",
  },
  scannedData: {
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scanFrame: {
    position: "relative",
    width: 400,
    height: 400,
    borderWidth: 2,
    borderColor: "white",
  },
  scanLineHorizontal: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "green",
  },
  spinnerContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 20,
  },
})  
