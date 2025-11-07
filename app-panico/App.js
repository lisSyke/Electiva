import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import VerificarCedulaScreen from "./screens/VerificarCedulaScreen";
import RegistroScreen from "./screens/RegistroScreen";
import PanicoScreen from "./screens/PanicoScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="VerificarCedula"
        screenOptions={{
          headerStyle: { backgroundColor: "#4A1F6F" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen
          name="VerificarCedula"
          component={VerificarCedulaScreen}
          options={{ title: "Verificar cédula" }}
        />
        <Stack.Screen
          name="Registro"
          component={RegistroScreen}
          options={{ title: "Registrar usuaria" }}
        />
        <Stack.Screen name="Panico" component={PanicoScreen} options={{ title: "Botón de pánico" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
