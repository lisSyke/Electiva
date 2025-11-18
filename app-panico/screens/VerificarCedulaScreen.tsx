// Pantalla que permite verificar si una cédula existe en el sistema o en el CSV

import React, { useState } from "react";

// Componentes de React Native
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

// Navegación
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Tipos de las rutas definidas en App.tsx
import { RootStackParamList } from "../App";

// Icono para el input
import { MaterialIcons } from "@expo/vector-icons";

// Tipado para navegar desde esta pantalla
type Nav = NativeStackNavigationProp<RootStackParamList, "VerificarCedula">;

export default function VerificarCedulaScreen() {
  const navigation = useNavigation<Nav>();

  // Estado para almacenar la cédula ingresada
  const [cedula, setCedula] = useState("");

  // Estado para mostrar indicador de carga mientras se llama al servidor
  const [loading, setLoading] = useState(false);

  // Función principal que verifica la cédula en el backend
  const verificar = async () => {
    if (!cedula) {
      Alert.alert("Aviso", "Ingresa una cédula.");
      return;
    }

    try {
      setLoading(true); // mostrar spinner

      // Llamado al backend (importante usar IP local, no localhost)
      const res = await fetch(`http://192.168.0.8:8000/verificar-cedula/${cedula}`);

      // Convierte la respuesta a JSON
      const data = await res.json();

      // Caso 1: ya está registrada completamente en el sistema → enviar al Home
      if (data.ok && data.mensaje?.includes("registrada")) {
        navigation.navigate("Home");
        return;
      }

      // Caso 2: no está registrada, pero sí existe en el CSV y es mujer → ir a registro con datos precargados
      if (data.ok && data.es_mujer === true) {
        navigation.navigate("Registro", {
          cedula,               // mandar la cédula
          usuaria: data.usuaria_csv, // información desde el CSV
        });
        return;
      }

      // Caso 3: no encontrada o error desde el backend
      Alert.alert("Resultado", data.mensaje || "No encontrada");
    } catch (e: any) {
      // Error de red o conexión
      Alert.alert("Error", e.message || "Error al conectar");
    } finally {
      // Ocultar loader
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Verificar Cédula</Text>

      {/* Campo de texto con icono */}
      <View style={styles.inputRow}>
        <MaterialIcons name="badge" size={22} color="#5c2a8a" />
        <TextInput
          placeholder="SIM123456789"
          value={cedula}
          onChangeText={setCedula}
          style={styles.input}
          autoCapitalize="characters" // convierte a mayúsculas automáticamente
        />
      </View>

      {/* Botón de verificar */}
      <TouchableOpacity style={styles.btn} onPress={verificar} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" /> // Spinner cuando está cargando
          : <Text style={styles.btnText}>Verificar</Text>
        }
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3e9ff", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700", color: "#5c2a8a", marginBottom: 20, textAlign: "center" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 3,
  },
  input: { marginLeft: 10, flex: 1, fontSize: 16 },
  btn: { backgroundColor: "#5c2a8a", padding: 15, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
