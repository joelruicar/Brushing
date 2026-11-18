import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STARTING_SECONDS = 2 * 60;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function HomeScreen() {
  const [secondsLeft, setSecondsLeft] = useState(STARTING_SECONDS);
  const [isStopped, setIsStopped] = useState(false);

  useEffect(() => {
    if (isStopped || secondsLeft === 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStopped, secondsLeft]);

  const isFinished = secondsLeft === 0;
  const status = isFinished
    ? "Tiempo cumplido"
    : isStopped
      ? "Temporizador detenido"
      : "En marcha";

  return (
    <Pressable
      accessibilityLabel="Temporizador de dos minutos"
      accessibilityRole="button"
      accessibilityState={{ disabled: isStopped || isFinished }}
      disabled={isStopped || isFinished}
      onPress={() => setIsStopped(true)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>BRUSHING TIMER</Text>
          <Text style={styles.title}>Dos minutos para brillar</Text>
        </View>
        <View style={styles.timerArea}>
          <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
          <View
            style={[styles.statusDot, isStopped && styles.statusDotStopped]}
          />
          <Text style={styles.status}>{status}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.instruction}>
            {isFinished
              ? "Buen trabajo"
              : isStopped
                ? "El tiempo queda guardado"
                : "Toca en cualquier lugar para detener"}
          </Text>
          <Text style={styles.duration}>02:00 MIN</Text>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E8",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  header: {
    gap: 12,
  },
  eyebrow: {
    color: "#B65C3A",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: "#202A25",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
  },
  timerArea: {
    alignItems: "center",
    gap: 18,
  },
  timer: {
    color: "#202A25",
    fontSize: 92,
    lineHeight: 104,
    fontWeight: "300",
    letterSpacing: 1,
    fontVariant: ["tabular-nums"],
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B65C3A",
  },
  statusDotStopped: {
    backgroundColor: "#7C837C",
  },
  status: {
    color: "#59635C",
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    gap: 14,
  },
  instruction: {
    color: "#59635C",
    fontSize: 14,
    textAlign: "center",
  },
  duration: {
    color: "#B65C3A",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  pressed: {
    opacity: 0.88,
  },
});
