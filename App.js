import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import { Ionicons } from '@expo/vector-icons';


export default function App() {
  const [galeria, setGaleria] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [fotoExpandida, setFotoExpandida] = useState(null);


  const tomarFoto = async () => {
    if (galeria.length >= 6) {
      Alert.alert('Galeria llena', 'Solo puedes tener un maximo de 6 fotografias');
      return;
    }

    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (permiso.granted === false) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la camara');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!resultado.canceled) { 
      const nuevaFoto = {
        id: Date.now().toString(),
        uri: resultado.assets[0].uri,
      };
      setGaleria([...galeria, nuevaFoto]);
    }
  };

  const alternarSeleccion = (idFoto) => {
    if (seleccionadas.includes(idFoto)) {
      setSeleccionadas(seleccionadas.filter((id) => id !== idFoto));
    } else {
      setSeleccionadas([...seleccionadas, idFoto]);
    }
  };


  const seleccionarTodas = () => {
    if (seleccionadas.length === galeria.length) {
      setSeleccionadas([]);
    } else {
      const todosLosIds = galeria.map((foto) => foto.id);
      setSeleccionadas(todosLosIds);
    }
  };

  const borrarSeleccionadas = () => {
    Alert.alert(
      'Confirmar borrado',
      `¿Eliminar ${seleccionadas.length} foto(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => {
            const galeriaFiltrada = galeria.filter((foto) => !seleccionadas.includes(foto.id));
            setGaleria(galeriaFiltrada);
            setSeleccionadas([]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Mi Galeria</Text>
        <Text style={styles.contadorTexto}>Fotos: {galeria.length}</Text>
      </View>

      {galeria.length === 0 ? (
        <View style={styles.estadoVacio}>
          <Ionicons name="images-outline" size={60} color="#ccc" />
          <Text style={styles.textoVacio}>Aun no han tomado ninguna foto</Text>
        </View>
      ) : (
        <FlatList
          style={styles.lista}
          data={galeria}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => { 
            const estaSeleccionada = seleccionadas.includes(item.id);
            return (
              <TouchableOpacity
                style={styles.contenedorFoto}
                onPress={() => setFotoExpandida(item.uri)}
                onLongPress={() => alternarSeleccion(item.id)}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={[styles.imagen, estaSeleccionada && styles.imagenSeleccionada]}
                />

                {estaSeleccionada && (
                  <View style={styles.checkOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color="#e74c3c" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}



      <View style={styles.contenedorControlesAbajo}>
        <TouchableOpacity
          style={[styles.botonPrincipal, galeria.length >= 6 && styles.botonPrincipalDeshabilitado]} 
          onPress={tomarFoto}
          disabled={galeria.length >= 6}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.textoBotonPrincipal}>Tomar Foto</Text>
        </TouchableOpacity>

        <View style={styles.filaSecundaria}>
          <View style={styles.mitadFila}>
            {seleccionadas.length > 0 && (
              <TouchableOpacity
                style={styles.botonIconoTexto}
                onPress={borrarSeleccionadas}
              >
                <Ionicons name="trash" size={20} color="#e74c3c" />
                <Text style={[styles.textoBotonSecundario, { color: '#e74c3c' }]}>
                  {seleccionadas.length} Borrar 
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.mitadFila, { alignItems: 'flex-end' }]}>
            {galeria.length > 0 && (
              <TouchableOpacity
                style={styles.botonIconoTexto}
                onPress={seleccionarTodas}
              >
                <Ionicons
                  name={seleccionadas.length === galeria.length ? "close-circle-outline" : "checkmark-circle-outline"}
                  size={20}
                  color={seleccionadas.length === galeria.length ? "#7f8c8d" : "#3498db"}
                />
                <Text style={[styles.textoBotonSecundario,
                { color: seleccionadas.length === galeria.length ? "#7f8c8d" : "#3498db" }
                ]}>
                  {seleccionadas.length === galeria.length ? "Deseleccionar" : "Seleccionar todo"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Modal visible={fotoExpandida !== null} transparent={true} animationType="fade">
        <View style={styles.fondoModal}>
          <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setFotoExpandida(null)}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: fotoExpandida }}
            style={styles.imagenCompleta}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60 },
  encabezado: { alignItems: 'center', marginBottom: 15 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50' },
  contadorTexto: { fontSize: 16, color: '#7f8c8d', marginTop: 2 },

  lista: { paddingHorizontal: 15 },
  estadoVacio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoVacio: { fontSize: 18, color: '#bdc3c7', marginTop: 10 },

  contenedorFoto: { flex: 1, margin: 5, position: 'relative' },
  imagen: { width: '100%', height: 180, borderRadius: 12 },
  imagenSeleccionada: { borderWidth: 4, borderColor: '#e74c3c', opacity: 0.7 },
  checkOverlay: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white', borderRadius: 12 },

  contenedorControlesAbajo: {
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 20,
    backgroundColor: '#8a8989',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  botonPrincipal: {
    flexDirection: 'row',
    backgroundColor: '#94bdf3',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  botonPrincipalDeshabilitado: {
    backgroundColor: '#bdc3c7',
  },
  textoBotonPrincipal: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },

  filaSecundaria: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  mitadFila: {
    flex: 1,
  },
  botonIconoTexto: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoBotonSecundario: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
  },



  fondoModal: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
  botonCerrarModal: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  imagenCompleta: { width: '100%', height: '80%' }
});