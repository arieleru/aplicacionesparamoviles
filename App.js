import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Image
} from "react-native";

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    descargarUsuarios();
  }, []);

  const descargarUsuarios = async () => {
    try {
      const respuesta = await fetch(
        "https://randomuser.me/api/?results=20"
      );

      const json = await respuesta.json();

      setUsuarios(json.results);
      setCargando(false);
    } catch (error) {
      console.error("Error al descargar usuarios:", error);
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.pantallaCentrada}>
        <ActivityIndicator size="large" color="#005691" />
        <Text style={styles.textoCarga}>Descargando perfiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.tituloPrincipal}>Directorio Global</Text>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <View style={styles.tarjetaUsuario}>
            <Image
              source={{ uri: item.picture.large }}
              style={styles.imagenPerfil}
            />

            <View style={styles.infoUsuario}>
              <Text style={styles.nombreUsuario}>
                {item.name.first} {item.name.last}
              </Text>

              <Text style={styles.correoUsuario}>
                {item.email}
              </Text>

              <Text style={styles.paisUsuario}>
                {item.location.country}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f4f7f6",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  pantallaCentrada: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffff",
  },

  textoCarga: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },

  tituloPrincipal: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },

  tarjetaUsuario: {
    flexDirection: "row",
    backgroundColor: "#ffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  imagenPerfil: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },

  infoUsuario: {
    flex: 1,
    justifyContent: "center",
  },

  nombreUsuario: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },

  correoUsuario: {
    fontSize: 14,
    color: "#005691",
    marginBottom: 4,
  },

  paisUsuario: {
    fontSize: 14,
    color: "#777",
  },
});