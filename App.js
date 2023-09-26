import { StatusBar } from "expo-status-bar"   
import { StyleSheet, View } from "react-native"   
import AppForm from "./components/AppForm"   
import { GoogleIDProvider, UserProvider } from "./contexts/UserInfo"   
import HomeScreen from "./components/Home"   
import { NavigationContainer } from "@react-navigation/native"   
import { createStackNavigator, Header } from "@react-navigation/stack"   
import Scanner from "./components/Scanner"   
import Profile from "./components/Profile"   
import { SafeAreaProvider } from "react-native-safe-area-context"   
import { GestureHandlerRootView } from "react-native-gesture-handler"   
import { AuthContextProvider } from "./contexts/AuthToken"   
import ScannedQr from "./components/ScannedQr"   

const Stack = createStackNavigator()   

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthContextProvider>
          <UserProvider>
            <GoogleIDProvider>
              <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="Form" component={AppForm} />
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="ScanQrCode" component={Scanner} />
                  <Stack.Screen name="Profile" component={Profile} />
                  <Stack.Screen name="Scanned Qrcode" component={ScannedQr}/>
                </Stack.Navigator>
              </NavigationContainer>
            </GoogleIDProvider>
          </UserProvider>
        </AuthContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )   
}

const styles = StyleSheet.create({
  container: {
    flex:'1',
    alignItems: "center",
    justifyContent: "center",
  },
})   
