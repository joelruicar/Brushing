import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { ThemedText } = require('@/components/themed-text');

const STARTING_SECONDS = 2 * 60;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
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
  const status = isFinished ? 'Tiempo cumplido' : isStopped ? 'Temporizador detenido' : 'En marcha';

  return React.createElement(
    Pressable,
    {
      accessibilityLabel: 'Temporizador de dos minutos',
      accessibilityRole: 'button',
      accessibilityState: { disabled: isStopped || isFinished },
      disabled: isStopped || isFinished,
      onPress: () => setIsStopped(true),
      style: ({ pressed }: { pressed: boolean }) => [styles.container, pressed && styles.pressed],
    },
    React.createElement(
      SafeAreaView,
      { style: styles.safeArea },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(ThemedText, { style: styles.eyebrow }, 'BRUSHING TIMER'),
        React.createElement(ThemedText, { type: 'title', style: styles.title }, 'Dos minutos para ti'),
      ),
      React.createElement(
        View,
        { style: styles.timerArea },
        React.createElement(ThemedText, { style: styles.timer }, formatTime(secondsLeft)),
        React.createElement(View, { style: [styles.statusDot, isStopped && styles.statusDotStopped] }),
        React.createElement(ThemedText, { style: styles.status }, status),
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          ThemedText,
          { style: styles.instruction },
          isFinished ? 'Buen trabajo' : isStopped ? 'El tiempo queda guardado' : 'Toca en cualquier lugar para detener',
        ),
        React.createElement(ThemedText, { style: styles.duration }, '02:00 MIN'),
      ),
    ),
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0E8',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    gap: 12,
  },
  eyebrow: {
    color: '#B65C3A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: '#202A25',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
  },
  timerArea: {
    alignItems: 'center',
    gap: 18,
  },
  timer: {
    color: '#202A25',
    fontSize: 92,
    lineHeight: 104,
    fontWeight: '300',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#B65C3A',
  },
  statusDotStopped: {
    backgroundColor: '#7C837C',
  },
  status: {
    color: '#59635C',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    gap: 14,
  },
  instruction: {
    color: '#59635C',
    fontSize: 14,
    textAlign: 'center',
  },
  duration: {
    color: '#B65C3A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  pressed: {
    opacity: 0.88,
  },
});
