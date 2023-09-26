import React,{createContext, useContext, useState} from "react"  

export const UserContext = createContext()  

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null)  

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  )  
}  
export const useUserContext = () => useContext(UserContext)  

export const GoogleIDContext = createContext()  

export const GoogleIDProvider = ({ children }) => {
  const [googleIdContext, setGoogleIdContext] = useState(null)  

  return (
    <GoogleIDContext.Provider value={{ googleIdContext, setGoogleIdContext }}>
      {children}
    </GoogleIDContext.Provider>
  )  
}  
export const useGoogleIDContext = () => useContext(GoogleIDContext)  