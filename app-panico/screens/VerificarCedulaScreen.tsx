// screens/VerificarCedulaScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { MaterialIcons } from "@expo/vector-icons";

type Nav = NativeStackNavigationProp<RootStackParamList, "VerificarCedula">;

export default function VerificarCedulaScreen() {
  const navigation = useNavigation<Nav>();
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);

  const verificar = async () => {
    if (!cedula) {
      Alert.alert("Aviso", "Ingresa una cédula.");
      return;
    }

    try {
      setLoading(true);
      // IMPORTANTE: en tu teléfono cambia localhost por la IP de tu PC, ej: 192.168.0.15
      const res = await fetch(`http://192.168.0.8:8000/verificar-cedula/${cedula}`);
      const data = await res.json();

      if (data.ok && data.mensaje?.includes("registrada")) {
        // Ya registrada -> ir al Home
        navigation.navigate("Home");
        return;
      }

      if (data.ok && data.es_mujer === true) {
        // No registrada pero encontrada en CSV y es mujer -> mandar a registro con datos
        navigation.navigate("Registro", {
          cedula,
          usuaria: data.usuaria_csv,
        });
        return;
      }

      Alert.alert("Resultado", data.mensaje || "No encontrada");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error al conectar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificar Cédula</Text>

      <View style={styles.inputRow}>
        <MaterialIcons name="badge" size={22} color="#5c2a8a" />
        <TextInput
          placeholder="SIM123456789"
          value={cedula}
          onChangeText={setCedula}
          style={styles.input}
          autoCapitalize="characters"
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={verificar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verificar</Text>}
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
