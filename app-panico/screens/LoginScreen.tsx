import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Ionicons } from "@expo/vector-icons";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

type Props = {
  setIsLoggedIn: (val: boolean) => void;
};

export default function LoginScreen({ setIsLoggedIn }: Props) {
  const navigation = useNavigation<NavProp>();
  const [cedula, setCedula] = useState("");

  const iniciarSesion = async () => {
    if (!cedula.trim()) {
      Alert.alert("Error", "Por favor ingresa tu cédula.");
      return;
    }

    try {
      const res = await fetch(`http://192.168.0.8:8000/verificar-cedula/${cedula}`);
      const data = await res.json();

      if (!data.existe) {
        Alert.alert("Error", "No existe esta cédula registrada. Regístrate primero.");
        return;
      }

      await AsyncStorage.setItem("cedula", cedula);
      Alert.alert("Bienvenida", "Inicio de sesión exitoso.");
      setIsLoggedIn(true); // 🔹 Cambia el estado global a logueado
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar al servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingreso de Usuaria</Text>

      <View style={styles.inputGroup}>
        <Ionicons name="person" size={22} color="#5c2a8a" />
        <TextInput
          placeholder="Cédula"
          value={cedula}
          onChangeText={setCedula}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={iniciarSesion}>
        <Text style={styles.btnText}>Iniciar Sesión</Text>
      </TouchableOpacity>

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
