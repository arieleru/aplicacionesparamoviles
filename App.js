import { useState, useEffect, useRef } from "react";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Keyboard
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

export default function App() {
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cancionActiva, setCancionActiva] = useState(null);
  const [sonidoActual, setSonidoActual] = useState(null);
  const [estaReproduciendo, setEstaReproduciendo] = useState(false);

  const animacionEcualizador = useRef(
    new Animated.Value(0)
  ).current;

  // Animacion del ecualizador
  useEffect(() => {
    animacionEcualizador.stopAnimation();
    animacionEcualizador.setValue(0);

    if (estaReproduciendo) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animacionEcualizador, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false
          }),

          Animated.timing(animacionEcualizador, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false
          })
        ])
      ).start();
    }
  }, [estaReproduciendo, cancionActiva]);

  // Altura de las barras
  const altoBarra1 = animacionEcualizador.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 22]
  });

  const altoBarra2 = animacionEcualizador.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 10]
  });

  const altoBarra3 = animacionEcualizador.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 18]
  });

  // Buscar musica
  const buscarMusica = async () => {
    if (busqueda.trim() === "") {
      return;
    }

    Keyboard.dismiss();
    setCargando(true);

    try {
      const terminoLimpio = busqueda.trim().replace(/ /g, "+");

      // LINK CORREGIDO
      const url = `https://itunes.apple.com/search?term=${terminoLimpio}&media=music&limit=30`;

      const respuesta = await fetch(url);
      const json = await respuesta.json();

      setResultados(json.results || []);

    } catch (error) {
      console.error("Error al buscar musica:", error);
    } finally {
      setCargando(false);
    }
  };

  // Detectar cuando termina una cancion
  const monitorDeReproduccion = (estado) => {
    if (estado.didJustFinish) {
      setEstaReproduciendo(false);
      setCancionActiva(null);
    }
  };

  // Reproducir cancion
  const reproducirCancion = async (cancion) => {
    try {
      // Detener la cancion anterior
      if (sonidoActual) {
        await sonidoActual.unloadAsync();
      }

      setCancionActiva(cancion);
      setEstaReproduciendo(true);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true
      });

      // Verificar si existe vista previa
      if (!cancion.previewUrl) {
        console.log("Esta cancion no tiene vista previa");
        setEstaReproduciendo(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: cancion.previewUrl },
        { shouldPlay: true },
        monitorDeReproduccion
      );

      setSonidoActual(sound);

    } catch (error) {
      console.log("Error al reproducir:", error);
      setEstaReproduciendo(false);
    }
  };

  // Play / Pause
  const alternarPlayPause = async () => {
    if (!sonidoActual) {
      return;
    }

    if (estaReproduciendo) {
      await sonidoActual.pauseAsync();
      setEstaReproduciendo(false);
    } else {
      await sonidoActual.playAsync();
      setEstaReproduciendo(true);
    }
  };

  // Liberar el sonido
  useEffect(() => {
    return () => {
      if (sonidoActual) {
        sonidoActual.unloadAsync();
      }
    };
  }, [sonidoActual]);

  return (
    <View style={styles.contenedor}>

      {/* Titulo */}
      <Text style={styles.tituloHeader}>
        Explorar Musica
      </Text>

      {/* Buscador */}
      <View style={styles.contenedorBusqueda}>

        <TextInput
          style={styles.input}
          placeholder="Buscar cancion o artista..."
          placeholderTextColor="#888"
          value={busqueda}
          onChangeText={setBusqueda}
          onSubmitEditing={buscarMusica}
        />

        <TouchableOpacity
          style={styles.botonBuscar}
          onPress={buscarMusica}
        >
          <Ionicons
            name="search"
            size={24}
            color="white"
          />
        </TouchableOpacity>

      </View>

      {/* Cargando */}
      {cargando ? (

        <View style={styles.zonaCentrada}>

          <ActivityIndicator
            size="large"
            color="#A259FF"
          />

        </View>

      ) : (

        <FlatList
          data={resultado}

          keyExtractor={(item, index) =>
            item.trackId
              ? item.trackId.toString()
              : index.toString()
          }

          contentContainerStyle={{
            paddingBottom: cancionActiva ? 90 : 20
          }}

          renderItem={({ item }) => {

            const esLaActiva =
              cancionActiva?.trackId === item.trackId;

            return (

              <TouchableOpacity
                style={styles.tarjetaCancion}
                onPress={() => reproducirCancion(item)}
              >

                {/* Imagen */}
                <Image
                  source={{
                    uri: item.artworkUrl100
                  }}
                  style={styles.portada}
                />

                {/* Informacion */}
                <View style={styles.infoCancion}>

                  <Text
                    style={[
                      styles.tituloCancion,
                      esLaActiva && {
                        color: "#A259FF"
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {item.trackName || "Cancion desconocida"}
                  </Text>

                  <Text
                    style={styles.artistaCancion}
                    numberOfLines={1}
                  >
                    {item.artistName || "Artista desconocido"}
                  </Text>

                </View>

                {/* Ecualizador */}
                {esLaActiva && estaReproduciendo ? (

                  <View style={styles.contenedorEcualizador}>

                    <Animated.View
                      style={[
                        styles.barraEcualizador,
                        {
                          height: altoBarra1
                        }
                      ]}
                    />

                    <Animated.View
                      style={[
                        styles.barraEcualizador,
                        {
                          height: altoBarra2
                        }
                      ]}
                    />

                    <Animated.View
                      style={[
                        styles.barraEcualizador,
                        {
                          height: altoBarra3
                        }
                      ]}
                    />

                    <Ionicons
                      name="pause-circle"
                      size={32}
                      color="#A259FF"
                    />

                  </View>

                ) : (

                  <Ionicons
                    name="play-circle"
                    size={32}
                    color={
                      esLaActiva
                        ? "#A259FF"
                        : "#144444"
                    }
                  />

                )}

              </TouchableOpacity>
            );
          }}
        />

      )}

      {/* Mini reproductor */}
      {cancionActiva && (

        <View style={styles.miniReproductor}>

          <View style={styles.interiorMiniReproductor}>

            {/* Portada */}
            <Image
              source={{
                uri: cancionActiva.artworkUrl100
              }}
              style={styles.portadaMini}
            />

            {/* Informacion */}
            <View style={styles.infoMini}>

              <Text
                style={styles.tituloMini}
                numberOfLines={1}
              >
                {cancionActiva.trackName}
              </Text>

              <Text
                style={styles.artistaMini}
                numberOfLines={1}
              >
                {cancionActiva.artistName}
              </Text>

            </View>

            {/* Play / Pause */}
            <TouchableOpacity
              onPress={alternarPlayPause}
              style={styles.botonPlayPause}
            >

              <Ionicons
                name={
                  estaReproduciendo
                    ? "pause-circle"
                    : "play-circle"
                }
                size={40}
                color="white"
              />

            </TouchableOpacity>

          </View>

        </View>

      )}

    </View>
  );
}

const styles = StyleSheet.create({

  contenedor: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 60
  },

  tituloHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "center"
  },

  contenedorBusqueda: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 15
  },

  input: {
    flex: 1,
    height: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16
  },

  botonBuscar: {
    width: 50,
    height: 50,
    backgroundColor: "#A259FF",
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center"
  },

  zonaCentrada: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  tarjetaCancion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10
  },

  portada: {
    width: 60,
    height: 60,
    borderRadius: 8
  },

  infoCancion: {
    flex: 1,
    marginLeft: 10
  },

  tituloCancion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50"
  },

  artistaCancion: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 3
  },

  contenedorEcualizador: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },

  barraEcualizador: {
    width: 4,
    backgroundColor: "#c0b1d3",
    borderRadius: 2
  },

  miniReproductor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2359ec",
    padding: 10
  },

  interiorMiniReproductor: {
    flexDirection: "row",
    alignItems: "center"
  },

  portadaMini: {
    width: 50,
    height: 50,
    borderRadius: 6
  },

  infoMini: {
    flex: 1,
    marginLeft: 10
  },

  tituloMini: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold"
  },

  artistaMini: {
    color: "white",
    fontSize: 13
  },

  botonPlayPause: {
    justifyContent: "center",
    alignItems: "center"
  }

});