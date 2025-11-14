// ================================================
// Archivo principal de la app: Maneja navegación
// y persistencia de sesión con AsyncStorage
// ================================================

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegistroScreen from "./screens/RegistroScreen";
import AgendaScreen from "./screens/AgendaScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos que definen las pantallas y parámetros
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
  // isLoggedIn controla si la usuaria ya inició sesión
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica si existe la cédula en almacenamiento local
    const checkSession = async () => {
      const cedula = await AsyncStorage.getItem("cedula");
      setIsLoggedIn(!!cedula); // true si existe, false si no
    };
    checkSession();
  }, []);

  // Mientras se verifica sesión, no muestra nada
  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        // Si hay sesión -> mostrar Home y Agenda
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />
            )}
          </Stack.Screen>

          <Stack.Screen name="Agenda" component={AgendaScreen} />
        </Stack.Navigator>
      ) : (
        // Si NO hay sesión -> mostrar Login y Registro
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
            )}
          </Stack.Screen>

          <Stack.Screen name="Registro" component={RegistroScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
