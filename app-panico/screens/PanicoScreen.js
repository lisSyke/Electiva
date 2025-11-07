import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

export default function PanicoScreen({ route }) {
  const cedula = route.params?.cedula || "";
  const [mensaje, setMensaje] = useState("");

  const activarPanico = async () => {
    setMensaje("Obteniendo ubicación...");
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setMensaje("Permiso de ubicación denegado.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const ubicacion = `https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;

    setMensaje("Enviando alerta...");
    try {
      const res = await fetch("http://192.168.0.8:8000/boton-panico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, ubicacion }),
      });
      const data = await res.json();
      setMensaje(JSON.stringify(data));
    } catch (e) {
      setMensaje("Error al enviar alerta. Verifica backend.");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#7D3BBB", "#9A4DFF"]} style={styles.header}>
        <Text style={styles.headerText}>Botón de Pánico</Text>
      </LinearGradient>

      <View style={styles.center}>
        <TouchableOpacity style={styles.panicContainer} onPress={activarPanico}>
          <LinearGradient colors={["#9A4DFF", "#7D3BBB"]} style={styles.panicButton}>
            <Text style={styles.panicText}>ALERTA</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.info}>{mensaje || "Presiona el botón para enviar una alerta"}</Text>
      </View>
    </View>
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: -30 },
  panicContainer: { elevation: 8, borderRadius: 200 },
  panicButton: { width: 220, height: 220, borderRadius: 200, justifyContent: "center", alignItems: "center" },
  panicText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  info: { marginTop: 24, color: "#4A1F6F", textAlign: "center", paddingHorizontal: 20 },
});
