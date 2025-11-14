import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type Props = {
  setIsLoggedIn: (val: boolean) => void;
};

export default function HomeScreen({ setIsLoggedIn }: Props) {
  type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;
  const navigation = useNavigation<NavProp>();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

const activarPanico = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Permiso de ubicación denegado");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const coords = `${location.coords.latitude},${location.coords.longitude}`;
    const googleLink = `https://www.google.com/maps?q=${coords}`;

    const cedula = await AsyncStorage.getItem("cedula");
    const contactosStr = await AsyncStorage.getItem("contactos");
    const contactos = contactosStr ? JSON.parse(contactosStr) : [];

    // Enviar mensaje automáticamente a todos los contactos
    for (const c of contactos) {
      const smsUrl = `sms:${c.telefono}?body=⚠️ Emergencia: se activó el botón de pánico. Ubicación: ${googleLink}`;
      Linking.openURL(smsUrl); // 🔹 abrir cada SMS automáticamente
    }

    // También enviar la alerta al servidor
    await fetch("http://192.168.0.8:8000/boton-panico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula, ubicacion: googleLink }),
    });

    Alert.alert("Pánico activado", "Se envió la alerta y tu ubicación a tus contactos.");
  } catch (e) {
    Alert.alert("Error", "No se pudo enviar la alerta.");
  }
};

  const cerrarSesion = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas salir de la aplicación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, salir",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("cedula"); // eliminar sesión
            setIsLoggedIn(false); // volver a Login
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Botón de Pánico</Text>

      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <TouchableOpacity activeOpacity={0.8} onPress={activarPanico} style={styles.panicButton}>
          <Ionicons name="warning-outline" size={48} color="#fff" />
          <Text style={styles.panicText}>¡AYUDA!</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("Agenda" as never)}>
        <Ionicons name="people" size={20} color="#5c2a8a" />
        <Text style={styles.secondaryText}>Agenda de emergencia</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={cerrarSesion}>
        <Ionicons name="exit-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const PINK = "#ff4d6d";
const PURPLE = "#5c2a8a";
const LIGHT = "#f3e9ff";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 26, fontWeight: "700", color: PURPLE, marginBottom: 20 },
  panicButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PINK,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 12,
  },
  panicText: { color: "#fff", fontSize: 22, marginTop: 8, fontWeight: "700" },
  secondaryBtn: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    elevation: 4,
  },
  secondaryText: { color: PURPLE, fontWeight: "600", marginLeft: 8 },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: PINK,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  logoutText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
});
