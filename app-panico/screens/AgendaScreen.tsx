import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import * as Contacts from "expo-contacts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type Contacto = {
  nombre: string;
  telefono: string;
};

export default function AgendaScreen() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [contactosDisponibles, setContactosDisponibles] = useState<Contacto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Cargar contactos guardados
  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem("contactos");
      if (data) setContactos(JSON.parse(data));
    })();
  }, []);

  // Cargar contactos del teléfono
  const abrirAgenda = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se puede acceder a la agenda.");
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const disponibles = data
      .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
      .map((c) => ({
        nombre: c.name ?? "Sin nombre",
        telefono: c.phoneNumbers?.[0]?.number ?? "",
      }));

    if (!disponibles.length) {
      Alert.alert("Sin contactos válidos", "No se encontraron contactos con número.");
      return;
    }

    setContactosDisponibles(disponibles);
    setModalVisible(true);
  };

  // Elegir contacto de la lista
  const seleccionarContacto = async (contacto: Contacto) => {
    if (contactos.length >= 3) {
      Alert.alert("Límite alcanzado", "Solo puedes tener 3 contactos de emergencia.");
      setModalVisible(false);
      return;
    }

    const nuevos = [...contactos, contacto];
    setContactos(nuevos);
    await AsyncStorage.setItem("contactos", JSON.stringify(nuevos));
    setModalVisible(false);
    Alert.alert("Contacto agregado", `${contacto.nombre} añadido a emergencia.`);
  };

  // Eliminar contacto
  const eliminarContacto = async (index: number) => {
    const nuevos = contactos.filter((_, i) => i !== index);
    setContactos(nuevos);
    await AsyncStorage.setItem("contactos", JSON.stringify(nuevos));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda de Emergencia</Text>

      <FlatList
        data={contactos}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.phone}>{item.telefono}</Text>
            </View>
            <TouchableOpacity onPress={() => eliminarContacto(index)}>
              <Ionicons name="trash" size={22} color="#ff4d6d" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#777", textAlign: "center", marginTop: 20 }}>
            No hay contactos agregados.
          </Text>
        }
      />

      <TouchableOpacity
        style={[styles.btn, contactos.length >= 3 && { opacity: 0.6 }]}
        disabled={contactos.length >= 3}
        onPress={abrirAgenda}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.btnText}>Agregar contacto</Text>
      </TouchableOpacity>

      {/* Modal de selección */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona un contacto</Text>
          <FlatList
            data={contactosDisponibles}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => seleccionarContacto(item)}
              >
                <Text style={styles.modalText}>{item.nombre}</Text>
                <Text style={styles.modalPhone}>{item.telefono}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const PURPLE = "#5c2a8a";
const LIGHT = "#f3e9ff";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: PURPLE,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 3,
  },
  name: { color: PURPLE, fontWeight: "600", fontSize: 16 },
  phone: { color: "#555", marginTop: 4 },
  btn: {
    backgroundColor: PURPLE,
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalContainer: {
    flex: 1,
    backgroundColor: LIGHT,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PURPLE,
    textAlign: "center",
    marginBottom: 10,
  },
  modalItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginVertical: 4,
  },
  modalText: { color: PURPLE, fontWeight: "600", fontSize: 16 },
  modalPhone: { color: "#555" },
  closeBtn: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: "center",
  },
  closeText: { color: PURPLE, fontWeight: "600" },
});

