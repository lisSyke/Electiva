// screens/RegistroScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { MaterialIcons } from "@expo/vector-icons";

type RegistroRoute = RouteProp<RootStackParamList, "Registro">;

export default function RegistroScreen() {
  const route = useRoute<RegistroRoute>();
  const { cedula: cedulaInicial, usuaria } = route.params || {};

  // refs para debug/focus
  const cedInputRef = useRef<TextInput | null>(null);

  // estados editables (usamos defaultValue fallback si viene undefined)
  const [cedula, setCedula] = useState<string>(cedulaInicial ?? "");
  const [nombre, setNombre] = useState<string>(usuaria?.nombre ?? "");
  const [apellido1, setApellido1] = useState<string>(usuaria?.apellido1 ?? "");
  const [correo, setCorreo] = useState<string>(usuaria?.correo ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Registro screen params:", { cedulaInicial, usuaria });
  }, []);

  // Ver que onChangeText realmente se dispara
  const onChangeCed = (t: string) => {
    console.log("cedula typed:", t);
    setCedula(t);
  };

  const registrar = async () => {
    if (!cedula || !nombre || !apellido1 || !correo) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://192.168.0.8:8000/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula,
          nombre,
          apellido1,
          correo,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        Alert.alert("Registro exitoso", data.mensaje || "Usuaria registrada correctamente.");
      } else {
        Alert.alert("Error", data.mensaje || "No se pudo registrar.");
      }
    } catch (e: any) {
      Alert.alert("Error de conexión", e.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Registrar Usuaria</Text>

        <View style={styles.card}>
          {/* CÉDULA (editable) */}
          <View style={styles.inputGroup}>
            <MaterialIcons name="badge" size={22} color="#5c2a8a" />
            <TextInput
              ref={cedInputRef}
              style={styles.input}
              value={cedula}
              onChangeText={setCedula}
              placeholder="Cédula"
              keyboardType="default"
              editable={true}
              returnKeyType="next"
              onSubmitEditing={() => {
                // pasar focus al siguiente campo si quieres
              }}
            />
          </View>

          {/* NOMBRE */}
          <View style={styles.inputGroup}>
            <MaterialIcons name="person" size={22} color="#5c2a8a" />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          {/* APELLIDO */}
          <View style={styles.inputGroup}>
            <MaterialIcons name="person-outline" size={22} color="#5c2a8a" />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={apellido1}
              onChangeText={(t) => setApellido1(t)}
            />
          </View>

          {/* CORREO */}
          <View style={styles.inputGroup}>
            <MaterialIcons name="email" size={22} color="#5c2a8a" />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={registrar}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Registrar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PURPLE = "#5c2a8a";
const LIGHT = "#f3e9ff";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: LIGHT,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: PURPLE,
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f3ff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  btn: {
    backgroundColor: PURPLE,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  debugBtn: {
    marginTop: 12,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
});
