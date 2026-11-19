import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "../components/AppText";

const STARTING_SECONDS = 122;

const LIGHT_THEME = {
  background: "#c6e5e9",
  primaryText: "#202A25",
  timer: "#246c00",
  secondaryText: "#3a6f44",
  accent: "#246c00",
  pressedBackground: "#d11111",
};

const DARK_THEME = {
  background: "#0e0e0e",
  primaryText: "#ffffff",
  timer: "#60d95c",
  secondaryText: "#A8AEA9",
  accent: "#60d95c",
  pressedBackground: "#2A211D",
};

function isNightTime() {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 7;
}

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
    (secondsLeft >= 108 && secondsLeft % 4 === 0) ||
    (secondsLeft >= 68 &&
      secondsLeft <= 100 &&
      (secondsLeft - 100) % 8 === 0) ||
    (secondsLeft >= 48 && secondsLeft <= 60 && secondsLeft % 4 === 0) ||
    (secondsLeft < 48 && secondsLeft > 0 && secondsLeft % 8 === 0)
  );
}

export default function HomeScreen() {
  const [isNightMode] = useState(isNightTime);
  const [secondsLeft, setSecondsLeft] = useState(STARTING_SECONDS);
  const [isStopped, setIsStopped] = useState(true);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const isFinished = secondsLeft === 0;
  const theme = isNightMode ? DARK_THEME : LIGHT_THEME;

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
    ? "Fin"
    : isStopped
      ? "Pausado"
      : isAutoPaused
        ? "Pausa en 01:00"
        : "Lesgoo";

  return (
    <Pressable
      accessibilityLabel={
        isStopped ? "Reanudar" : isAutoPaused ? "Pausa automática" : "Detener"
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: isFinished || isAutoPaused }}
      disabled={isFinished || isAutoPaused}
      onPress={() => setIsStopped((currentValue) => !currentValue)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.background },
        pressed && styles.pressed,
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <AppText style={[styles.title, { color: theme.accent }]}>
            BRUSHING TIMER
          </AppText>
        </View>
        <View style={styles.timerArea}>
          <AppText style={[styles.timer, { color: theme.timer }]}>
            {formatTime(secondsLeft)}
          </AppText>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: theme.accent },
              (isStopped || isAutoPaused) && styles.statusDotStopped,
            ]}
          />
          <AppText style={[styles.status, { color: theme.secondaryText }]}>
            {status}
          </AppText>
        </View>
        <View style={styles.footer}>
          <AppText style={[styles.instruction, { color: theme.secondaryText }]}>
            {isFinished ? "Buen trabajo" : " "}
          </AppText>
          <Pressable
            accessibilityLabel="Reiniciar contador"
            accessibilityRole="button"
            onPress={(event) => {
              event.stopPropagation();
              resetTimer();
            }}
            style={({ pressed }) => [
              styles.resetButton,
              {
                borderColor: theme.accent,
              },
              pressed && {
                backgroundColor: theme.pressedBackground,
              },
            ]}
          >
            <AppText style={[styles.resetButtonText, { color: theme.accent }]}>
              Reiniciar
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
    alignItems: "center",
  },
  timerArea: {
    alignItems: "center",
    gap: 18,
  },
  timer: {
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
  },
  statusDotStopped: {
    backgroundColor: "#7C837C",
  },
  status: {
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    gap: 14,
  },
  instruction: {
    fontSize: 14,
    textAlign: "center",
  },
  duration: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  resetButton: {
    minWidth: 112,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
