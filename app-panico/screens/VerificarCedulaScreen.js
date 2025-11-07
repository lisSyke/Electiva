import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function VerificarCedulaScreen({ navigation }) {
  const [cedula, setCedula] = useState("");
  const [mensaje, setMensaje] = useState("");

  const verificar = async () => {
    if (!cedula.trim()) {
      setMensaje("Ingrese una cédula válida.");
      return;
    }

    setMensaje("Verificando...");

    try {
      const res = await fetch(`http://192.168.0.8:8000/verificar-cedula?cedula=${encodeURIComponent(cedula)}`);
      const data = await res.json();

      // Ajusta esto según la estructura real de tu endpoint
      if (data.existe === false && data.es_mujer === true) {
        setMensaje("Cédula de mujer no registrada. Proceda a registro.");
        navigation.navigate("Registro", { cedula });
      } else if (data.existe === true) {
        setMensaje("Usuaria encontrada. Ir a botón de pánico.");
        navigation.navigate("Panico", { cedula });
      } else {
        setMensaje("Cédula no válida o no es mujer.");
      }
    } catch (e) {
      setMensaje("Error de conexión. Verifica que el backend esté corriendo y que reemplazaste TU_IP_LOCAL.");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#7D3BBB", "#9A4DFF"]} style={styles.header}>
        <Text style={styles.headerText}>Verificar cédula</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>Cédula</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: SIM128492780"
          placeholderTextColor="#BDA0D9"
          value={cedula}
          onChangeText={setCedula}
        />

        <TouchableOpacity style={styles.button} onPress={verificar}>
          <Text style={styles.buttonText}>Verificar</Text>
        </TouchableOpacity>

        <Text style={styles.message}>{mensaje}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3E8FF" },
  header: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
  },
  headerText: { color: "#fff", fontSize: 26, fontWeight: "700" },
  card: {
    marginTop: -40,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  label: { color: "#4A1F6F", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#C8A7EA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#7D3BBB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  message: { marginTop: 14, color: "#4A1F6F", textAlign: "center" },
});
