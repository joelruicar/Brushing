import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STARTING_SECONDS = 2 * 60;

async function triggerStrongVibration() {
  if (Platform.OS === "android") {
    Vibration.vibrate(500);
    return;
  }

  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function shouldVibrate(secondsLeft: number) {
  return (
    (secondsLeft >= 108 && secondsLeft < 120 && secondsLeft % 4 === 0) ||
    (secondsLeft >= 68 &&
      secondsLeft <= 100 &&
      (secondsLeft - 100) % 8 === 0) ||
    (secondsLeft >= 48 && secondsLeft <= 60 && secondsLeft % 4 === 0) ||
    (secondsLeft < 48 && secondsLeft > 0 && secondsLeft % 8 === 0)
  );
}

export default function HomeScreen() {
  const [secondsLeft, setSecondsLeft] = useState(STARTING_SECONDS);
  const [isStopped, setIsStopped] = useState(true);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const isFinished = secondsLeft === 0;

  const resetTimer = () => {
    Vibration.cancel();
    setSecondsLeft(STARTING_SECONDS);
    setIsStopped(true);
    setIsAutoPaused(false);
  };

  useEffect(() => {
    if (isStopped || isAutoPaused || isFinished) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoPaused, isFinished, isStopped]);

  useEffect(() => {
    if (isStopped || isAutoPaused) {
      Vibration.cancel();
    }
  }, [isAutoPaused, isStopped]);

  useEffect(() => {
    if (secondsLeft !== 60 || isStopped) {
      return;
    }

    setIsAutoPaused(true);
    const pauseTimer = setTimeout(() => {
      setIsAutoPaused(false);
    }, 3000);

    return () => clearTimeout(pauseTimer);
  }, [isStopped, secondsLeft]);

  useEffect(() => {
    if (isStopped || isAutoPaused || secondsLeft === 0) {
      return;
    }

    if (!shouldVibrate(secondsLeft)) {
      return;
    }

    void triggerStrongVibration().catch((error) => {
      console.warn("No se pudo activar la vibracion", error);
    });
  }, [isAutoPaused, isStopped, secondsLeft]);

  const status = isFinished
    ? "Tiempo cumplido"
    : isStopped
      ? "Temporizador detenido"
      : isAutoPaused
        ? "Pausa en 01:00"
        : "En marcha";

  return (
    <Pressable
      accessibilityLabel={
        isStopped
          ? "Reanudar temporizador de dos minutos"
          : isAutoPaused
            ? "Pausa automática"
            : "Detener temporizador de dos minutos"
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: isFinished || isAutoPaused }}
      disabled={isFinished || isAutoPaused}
      onPress={() => setIsStopped((currentValue) => !currentValue)}
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
            style={[
              styles.statusDot,
              (isStopped || isAutoPaused) && styles.statusDotStopped,
            ]}
          />
          <Text style={styles.status}>{status}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.instruction}>
            {isFinished
              ? "Buen trabajo"
              : isStopped
                ? "Toca en cualquier lugar para reanudar"
                : isAutoPaused
                  ? "Pausa automática de 3 segundos"
                  : "Toca en cualquier lugar para detener"}
          </Text>
          <Pressable
            accessibilityLabel="Reiniciar contador"
            accessibilityRole="button"
            onPress={(event) => {
              event.stopPropagation();
              resetTimer();
            }}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Reiniciar</Text>
          </Pressable>
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
  resetButton: {
    minWidth: 112,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B65C3A",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  resetButtonPressed: {
    backgroundColor: "#E8DED2",
  },
  resetButtonText: {
    color: "#B65C3A",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
