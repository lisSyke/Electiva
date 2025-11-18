// Importa React y el hook useState
import React, { useState } from "react";

// Componentes básicos de React Native
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

// Almacenamiento persistente
import AsyncStorage from "@react-native-async-storage/async-storage";

// Navegación
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

// Iconos
import { Ionicons } from "@expo/vector-icons";

// Tipo para definir la navegación desde esta pantalla
type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

// Props recibidas desde el componente padre
type Props = {
  setIsLoggedIn: (val: boolean) => void;  // Permite cambiar el estado global de sesión
};

export default function LoginScreen({ setIsLoggedIn }: Props) {
  // Hook para navegar a otras pantallas
  const navigation = useNavigation<NavProp>();

  // Estado para almacenar la cédula ingresada por la usuaria
  const [cedula, setCedula] = useState("");

  // Función que maneja el inicio de sesión
  const iniciarSesion = async () => {
    // Validación: evitar campos vacíos
    if (!cedula.trim()) {
      Alert.alert("Error", "Por favor ingresa tu cédula.");
      return;
    }

    try {
      // Consulta al backend para verificar la cédula
      const res = await fetch(`http://192.168.0.8:8000/verificar-cedula/${cedula}`);
      const data = await res.json();

      // Si el backend indica que no existe la usuaria
      if (!data.existe) {
        Alert.alert("Error", "No existe esta cédula registrada. Regístrate primero.");
        return;
      }

      // Guardar cédula localmente para mantener sesión
      await AsyncStorage.setItem("cedula", cedula);

      Alert.alert("Bienvenida", "Inicio de sesión exitoso.");

      // Cambiar estado global para entrar a la app
      setIsLoggedIn(true);

    } catch (e) {
      Alert.alert("Error", "No se pudo conectar al servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingreso de Usuaria</Text>

      {/* Campo de entrada con ícono */}
      <View style={styles.inputGroup}>
        <Ionicons name="person" size={22} color="#5c2a8a" />
        <TextInput
          placeholder="Cédula"
          value={cedula}
          onChangeText={setCedula}
          style={styles.input}
        />
      </View>

      {/* Botón de iniciar sesión */}
      <TouchableOpacity style={styles.btn} onPress={iniciarSesion}>
        <Text style={styles.btnText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Enlace a la pantalla de registro */}
      <TouchableOpacity
        style={styles.linkBtn}
        onPress={() =>
          navigation.navigate("Registro", {
            cedula: "",
            usuaria: { nombre: "", apellido1: "", correo: "" },
          })
        }
      >
        <Text style={styles.linkText}>Nueva usuaria</Text>
      </TouchableOpacity>
    </View>
  );
}

// Mantener estilos existentes
const PURPLE = "#5c2a8a";
const LIGHT = "#f3e9ff";
const PINK = "#ff4d6d";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: PURPLE,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "90%",
    marginBottom: 16,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "#333",
  },
  btn: {
    backgroundColor: PINK,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: "90%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  linkBtn: {
    marginTop: 20,
  },
  linkText: {
    color: PURPLE,
    fontWeight: "600",
  },
});
