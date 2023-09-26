import {
  View,
  Text,
  StyleSheet,
  Button,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native" 
import React, { useState, useEffect } from "react" 
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin" 
import auth from "@react-native-firebase/auth" 
import axios from "axios" 
import { AntDesign } from "@expo/vector-icons" 
import { useGoogleIDContext, useUserContext } from "../contexts/UserInfo" 
import { useNavigation } from "@react-navigation/native" 
import { useAuthContext } from "../contexts/AuthToken" 
import * as Font from "expo-font" 
import GoogleIcon from "./GoogleIcon" 
import { LinearGradient } from "expo-linear-gradient" 
import AsyncStorage from '@react-native-async-storage/async-storage' 

export default function AppForm() {
  const [initializing, setInitializing] = useState(true) 
  const [showSpinner, setShowSpinner] = useState(false) 
  const { userInfo, setUserInfo } = useUserContext() 
  const { authToken, setAuthToken } = useAuthContext() 
  const navigation = useNavigation() 
  const { googleIdContext, setGoogleIdContext } = useGoogleIDContext() 
  const [fontsLoaded, setFontsLoaded] = useState(false) 
  const [isLoading, setIsLoading] = useState(false) 

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

  GoogleSignin.configure({
    webClientId:
      "140826057292-hsemnejqh5spit6huek4jnpq6la6l79l.apps.googleusercontent.com",
  }) 

  const onAuthStateChanged = (user) => {
    setUserInfo(user) 
    if (initializing) setInitializing(false) 
  } 

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged) 
    return subscriber 
  }, []) 

  useEffect(() => {
    if (!initializing) {
      if (userInfo) {
        navigation.navigate('Home') 
      } else {
        navigation.navigate('Form') 
      }
    }
  },  [userInfo, initializing, navigation]) 

  const checkLivreur = async (googleId) => {
    try {
      const response = await axios.post(
        "https://backendmobile-goag.onrender.com/api/livreur/check",
        {
          googleId: googleId,
        }
      ) 
      console.log("exist") 
      return response.data.exists 
    } catch (error) {
      console.log(error) 
      return false 
    }
  } 
  useEffect(() => {
    console.log('googleID set', googleIdContext) 
  }, [googleIdContext]) 
  const onGoogleButtonPress = async (isLoading) => {
    if (showSpinner) {
      return  // Return early if the button is already in loading state
    }
    try {
      setShowSpinner(true) 
      setIsLoading(true)
      const { idToken } = await GoogleSignin.signIn() 
      setAuthToken(idToken) 
      const googleCredential = auth.GoogleAuthProvider.credential(idToken) 
      const userSignIn = auth().signInWithCredential(googleCredential) 
      console.log(userSignIn) 

      userSignIn
          .then(async (user) => {
            console.log(`user:${user.additionalUserInfo.profile.sub}`) 
            setGoogleIdContext(user.additionalUserInfo.profile.sub) 
            
            await AsyncStorage.setItem('userID', user.additionalUserInfo.profile.sub) 
            const exists = await checkLivreur(
              user.additionalUserInfo.profile.sub
            ) 

          if (!exists) {
            axios
              .post("https://backendmobile-goag.onrender.com/api/livreur/", {
                googleId: user.additionalUserInfo.profile.sub,
                name: user.user.displayName,
                email: user.user.email,
              })
              .then((response) => {
                console.log(response.data) 
                setShowSpinner(false) 
              })
              .catch((error) => {
                console.log(error) 
                setShowSpinner(false)  // Set setShowSpinner to false
                setIsLoading(false)
              }) 
              setIsLoading(false)
          } else {
            setShowSpinner(false)  // Set setShowSpinner to false
            setIsLoading(false)
            navigation.navigate("Home") 
          }
        })
        .catch((error) => {
          console.log(error) 
          setShowSpinner(false)  // Set setShowSpinner to false
        }) 
        setIsLoading(false) 
    } catch (error) {
      console.log(error) 
      setShowSpinner(false)  // Set setShowSpinner to false
      setIsLoading(false)
    }
  } 

  if (!userInfo || !googleIdContext || googleIdContext === "" || googleIdContext ===null ) {
    return (
      <LinearGradient
      colors={['rgb(3,111,103)', 'rgb(0,28,26)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
          <View>
            <View style={styles.welcomeTextView}>
              <Text style={styles.regularTExt}>Scanne de QrCodes </Text>
              <Text style={styles.regularTExt}>pour une livraison </Text>
              <Text style={styles.boldText}>fluide et précise</Text>
              <Text style={styles.boldText}>des produits</Text>
              <Text style={styles.textItalic}>
                Une application sécurisée et rapide pour un service de livraison
                proffessionel
              </Text>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Se connecter/ S'enregistrer</Text>
            <TouchableOpacity
              onPress={()=>onGoogleButtonPress(isLoading)}
              style={styles.button}
            >
              {showSpinner ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <GoogleIcon size={24} style={styles.icon} />
              )}
              <Text style={styles.buttonText}>Sign in with Google</Text>
            </TouchableOpacity>
            <Text style={styles.dataUsageText}>
              We use your data responsibly.
            </Text>
          </View>
        </LinearGradient>
    ) 
  }

  return null 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#388f89",
  },
  iconContainer: {
    marginTop: 100,
  },

  welcomeTextView: {
    paddingTop: 180,
    marginLeft: 20,
    marginRight: 15,
  },
  regularTExt: {
    fontSize: 35,
    fontFamily: "OpenSans-Regular",
    color: "white",
    marginTop: 5,
    marginBottom: 5,
  },
  boldText: {
    fontSize: 35,
    fontFamily: "OpenSans-Bold",
    color: "white",
    marginTop: 5,
    marginBottom: 5,
  },
  textItalic: {
    fontSize: 16,
    color: "white",
    fontFamily: "OpenSans-Light",
    paddingTop: 5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
    paddingTop: 100,
  },
  title: {
    fontFamily: "OpenSans-Semibold",
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },
  dataUsageText: {
    fontSize: 14,
    color: "#c4c4c0",
    fontFamily: "OpenSans-Regular",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    marginRight: 20,
    marginLeft: 20,
    width: 350,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontFamily: "OpenSans-Semibold",
    marginLeft: 8,
  },
  icon: {
    marginRight: 8,
  },
  spinnerContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 20,
    borderRadius: 10,
  },
}) 
