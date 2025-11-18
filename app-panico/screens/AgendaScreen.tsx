// Importa React y los hooks useEffect y useState
import React, { useEffect, useState } from "react";

// Importa componentes de React Native para UI y funcionalidad
import {
  View, //contenedores
  Text, //Textos
  TouchableOpacity, //Botones
  FlatList, //Lista optimizada
  StyleSheet, //Estilos
  Modal, //Ventanas emergentes
  Alert, //Mensajes del sistema
} from "react-native";

// Importa el acceso a contactos del teléfono
import * as Contacts from "expo-contacts";

// Importa almacenamiento local persistente
import AsyncStorage from "@react-native-async-storage/async-storage";

// Íconos de Expo
import { Ionicons } from "@expo/vector-icons";

// Tipo para definir cómo luce un contacto dentro del sistema
type Contacto = {
  nombre: string;
  telefono: string;
};

export default function AgendaScreen() {
  // Lista de contactos guardados como emergencia
  const [contactos, setContactos] = useState<Contacto[]>([]);

  // Lista de contactos del teléfono disponibles para elegir
  const [contactosDisponibles, setContactosDisponibles] = useState<Contacto[]>([]);

  // Controla si el modal de selección está visible
  const [modalVisible, setModalVisible] = useState(false);

  // useEffect que carga los contactos guardados al iniciar
  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem("contactos"); // Leer del almacenamiento
      if (data) setContactos(JSON.parse(data)); // Convertir JSON a array
    })();
  }, []);

  // Función para abrir la agenda del teléfono
  const abrirAgenda = async () => {
    const { status } = await Contacts.requestPermissionsAsync(); // Pedir permisos

    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se puede acceder a la agenda.");
      return;
    }

    // Obtener contactos del teléfono con números de teléfono
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    // Filtrar contactos válidos y formatearlos
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

    setContactosDisponibles(disponibles); // Guardar contactos disponibles
    setModalVisible(true); // Abrir modal
  };

  // Agregar un contacto desde la lista del modal
  const seleccionarContacto = async (contacto: Contacto) => {
    if (contactos.length >= 3) {
      Alert.alert("Límite alcanzado", "Solo puedes tener 3 contactos de emergencia.");
      setModalVisible(false);
      return;
    }

    const nuevos = [...contactos, contacto]; // Agrega el nuevo contacto
    setContactos(nuevos);
    await AsyncStorage.setItem("contactos", JSON.stringify(nuevos)); // Guardar en memoria
    setModalVisible(false);
    Alert.alert("Contacto agregado", `${contacto.nombre} añadido a emergencia.`);
  };

  // Eliminar contacto previamente guardado
  const eliminarContacto = async (index: number) => {
    const nuevos = contactos.filter((_, i) => i !== index); // Filtra el eliminado
    setContactos(nuevos);
    await AsyncStorage.setItem("contactos", JSON.stringify(nuevos)); // Guardar cambios
  };

  return (
    //Título de la pantalla
    <View style={styles.container}>
      <Text style={styles.title}>Agenda de Emergencia</Text>
      <FlatList //Lista de contactos de emergencia ya guardados
        data={contactos} //Datos a mostrar
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}> 
             {/*Contenedor del nombre y número*/}
            <View>
              <Text style={styles.name}>{item.nombre}</Text>           
              <Text style={styles.phone}>{item.telefono}</Text>
            </View>
          
            <TouchableOpacity onPress={() => eliminarContacto(index)}>
              <Ionicons name="trash" size={22} color="#ff4d6d" />
            </TouchableOpacity>
          </View>
        )}
        //En caso de que no haya contactos guardados muestra este mensaje
        ListEmptyComponent={
          <Text style={{ color: "#777", textAlign: "center", marginTop: 20 }}>
            No hay contactos agregados.
          </Text>
        }
      />

      {/*Botón para abrir la agenda del teléfono*/}
      <TouchableOpacity
        style={[styles.btn, contactos.length >= 3 && { opacity: 0.6 }]}
        disabled={contactos.length >= 3} // Desactivar si ya hay 3 contactos
        onPress={abrirAgenda}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.btnText}>Agregar contacto</Text>
      </TouchableOpacity>

      {/*Muestra los contactos del teléfono*/}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona un contacto</Text>

          {/*Lista con los contactos disponibles del teléfono*/}
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

          {/*Botón de cierre*/}
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

