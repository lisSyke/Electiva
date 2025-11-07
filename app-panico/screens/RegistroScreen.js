import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function RegistroScreen({ route, navigation }) {
  const cedula = route.params?.cedula || "";
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const registrar = async () => {
    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      setMensaje("Complete todos los campos.");
      return;
    }

    setMensaje("Registrando...");

    try {
      const res = await fetch("http://192.168.0.8:8000/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, nombre, apellido1: apellido, correo }),
      });
      const data = await res.json();
      if (data.ok) {
        setMensaje("Registrada correctamente.");
        navigation.navigate("Panico", { cedula });
      } else {
        setMensaje(data.mensaje || "Error al registrar.");
      }
    } catch (e) {
      setMensaje("Error de conexión al registrar.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#7D3BBB", "#9A4DFF"]} style={styles.header}>
        <Text style={styles.headerText}>Registro</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>Cédula</Text>
        <TextInput style={[styles.input, { backgroundColor: "#f2f2f2" }]} editable={false} value={cedula} />

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>Apellido</Text>
        <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />

        <Text style={styles.label}>Correo</Text>
        <TextInput style={styles.input} value={correo} onChangeText={setCorreo} />

        <TouchableOpacity style={styles.button} onPress={registrar}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>

        <Text style={styles.message}>{mensaje}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3E8FF" },
  header: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
  },
  headerText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  card: { marginTop: -30, marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 16, padding: 18, elevation: 6 },
  label: { color: "#4A1F6F", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#C8A7EA", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  button: { backgroundColor: "#7D3BBB", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  message: { marginTop: 12, color: "#4A1F6F", textAlign: "center" },
});
