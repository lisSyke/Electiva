import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegistroScreen from "./screens/RegistroScreen";
import AgendaScreen from "./screens/AgendaScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Registro: {
    cedula: string;
    usuaria: {
      nombre: string;
      apellido1: string;
      apellido2?: string;
      fecha_nacimiento?: string;
      correo: string;
    };
  };
  Agenda: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const cedula = await AsyncStorage.getItem("cedula");
      setIsLoggedIn(!!cedula);
    };
    checkSession();
  }, []);

  if (isLoggedIn === null) return null; // Espera a verificar sesión

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home">
            {(props) => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="Agenda" component={AgendaScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="Registro" component={RegistroScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
