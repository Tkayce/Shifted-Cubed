// ...existing code...

import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Modal, Platform, Pressable, SafeAreaView, ScrollView, Text, Vibration, View } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { s } from "react-native-wind";
import { GameBoard } from "../components/game/GameBoard";
import { GameHUD } from "../components/game/GameHUD";
import { useAppState } from "../lib/game/AppProvider";
import {
    CUBE_FALL_MULTIPLIER,
    START_GRAVITY,
    STARTING_LIVES
} from "../lib/game/constants";
import { createCampaignLevel } from "../lib/game/levels";
import { findRestingCell } from "../lib/game/physics";
import { soundManager } from "../lib/game/sound";
import { getScreenClasses, getTheme } from "../lib/game/theme";
import type { Cell, Gravity, Level } from "../lib/game/types";
import { getCellOffset } from "../lib/game/utils";


// Helper to get next gravity direction
function getNextGravity(current: Gravity): Gravity {
  const order: Gravity[] = ["down", "left", "up", "right"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

// Helper to generate helpful hints
function generateHint(attempts: number, combo: number, level: Level, cubeCell: Cell): string {
  if (attempts === 0) return "";
  
  const hints = [
    "Every rotation changes gravity by 90°.",
    "Try rotating toward the goal.",
    "Study the board layout before tapping.",
    "Use the highlighted path as a guide.",
    "Remember: cube falls automatically after rotation.",
    "Keep your combo going for more points!",
    "Path highlighting shows potential moves.",
    "Think ahead before each rotation.",
    "Some rotations might block you—plan ahead!",
    "The goal is the glowing amber tile.",
  ];
  
  const difficultHints = [
    "Your combo is building—don't fall!",
    "Can't reach directly? Try a longer path.",
    "Look for alternative routes up.",
    "This level requires 3+ rotations.",
    "Chain moves together for huge combos!",
  ];
  
  // Provide more specific hints if stuck
  if (attempts >= 3 && combo === 0) {
    return "Tip: After each rotation, the cube falls automatically. Land on a platform!";
  }
  if (attempts >= 5 && combo < 2) {
    return "Try: Rotate multiple times to find a path to the goal.";
  }
  if (attempts >= 8) {
    return "Keep trying! Study the board pattern and plan your moves.";
  }
  
  // Random general hints
  if (attempts % 2 === 0) {
    return hints[Math.floor(Math.random() * hints.length)];
  } else {
    return difficultHints[Math.floor(Math.random() * difficultHints.length)];
  }
}

const AnimatedView = Animated.createAnimatedComponent(View);

export default function GameScreen() {
  const { settings, progress, updateProgress } = useAppState();
  const isDarkMode = settings.darkModeEnabled;
  const screenBg = getScreenClasses(isDarkMode);
  const theme = getTheme(isDarkMode);

  // Game state
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [level, setLevel] = useState<Level>(() => createCampaignLevel(Date.now(), 0));
  const [gravity, setGravity] = useState(START_GRAVITY);
  const [cubeCell, setCubeCell] = useState<Cell>({ col: 3, row: 3 });
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [sector, setSector] = useState(1);
  const [clearedLevels, setClearedLevels] = useState(0);
  const [statusText, setStatusText] = useState("Collect the numbered cubes in order!");
  const [tapCount, setTapCount] = useState(0);
  const [lastHint, setLastHint] = useState("");
  const [showGameOver, setShowGameOver] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [levelAttempts, setLevelAttempts] = useState(0);
  const [collectedCubes, setCollectedCubes] = useState<number[]>([]); // Track collected cube numbers
  // Undo state
  const [undoState, setUndoState] = useState<any>(null);

  // Calculate next cube to collect
  const nextCubeNumber = Math.max(...collectedCubes, 0) + 1;

  // Level preview modal (removed)
  
  // Prevent double-taps
  const isShiftingRef = useRef(false);

  // Animated values
  const rotation = useSharedValue(0);
  const cubeX = useSharedValue(getCellOffset(level.spawn).x);
  const cubeY = useSharedValue(getCellOffset(level.spawn).y);
  // Realistic bounce: animate both X and Y scale
  const cubeScaleX = useSharedValue(1);
  const cubeScaleY = useSharedValue(1);
  const boardGlow = useSharedValue(0.3);

  // Load sounds on first game interaction (React Native compatible)
  const [soundsInitStarted, setSoundsInitStarted] = useState(false);

  // Load sounds on first interaction
  const ensureSoundsLoaded = useCallback(async () => {
    if (!soundsInitStarted) {
      setSoundsInitStarted(true);
      await soundManager.initialize();
      await soundManager.loadSound('move', require('../assets/sounds/change.mp3'));
      await soundManager.loadSound('finish', require('../assets/sounds/Finish.mp3'));
      setSoundsLoaded(true);
    }
  }, [soundsInitStarted]);



  // Apply a new level (stub)
  const applyLevel = useCallback(
    (levelIndex: number) => {
      const newLevel = createCampaignLevel(Date.now(), levelIndex);
      setLevel(newLevel);
      setGravity(START_GRAVITY);
      setCombo(0);
      setTapCount(0);
      setLevelAttempts(0);
      setCollectedCubes([]); // Reset collected cubes for new level
      rotation.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      boardGlow.value = withTiming(0.3, { duration: 300 });
      setStatusText("Collect the numbered cubes in order!");
      setLastHint("");
      setCubeCell(newLevel.spawn);
      const spawnOffset = getCellOffset(newLevel.spawn);
      cubeX.value = spawnOffset.x;
      cubeY.value = spawnOffset.y;
      cubeScaleX.value = 1;
      cubeScaleY.value = 1;
    },
    [boardGlow, cubeScaleX, cubeScaleY, cubeX, cubeY, rotation]
  );

  // Reboot the run (used for Play Again)
  const rebootRun = useCallback(() => {
    setScore(0);
    setCombo(0);
    setLives(STARTING_LIVES);
    setClearedLevels(0);
    setSector(1);
    setTapCount(0);
    // Start at level 0
    applyLevel(0);
    setLastHint("");
  }, [applyLevel]);

  // Undo handler
  const handleUndo = useCallback(() => {
    if (!undoState) return;
    setCubeCell(undoState.cubeCell);
    setGravity(undoState.gravity);
    setScore(undoState.score);
    setCombo(undoState.combo);
    setLives(undoState.lives);
    setSector(undoState.sector);
    setClearedLevels(undoState.clearedLevels);
    setStatusText(undoState.statusText);
    setTapCount(undoState.tapCount);
    setLastHint(undoState.lastHint);
    setLevel(undoState.level);
    setCollectedCubes(undoState.collectedCubes);
    // Also reset cube position visually
    const spawnOffset = getCellOffset(undoState.cubeCell);
    cubeX.value = spawnOffset.x;
    cubeY.value = spawnOffset.y;
    cubeScaleX.value = 1;
    cubeScaleY.value = 1;
    setUndoState(null);
  }, [undoState, cubeX, cubeY, cubeScaleX, cubeScaleY]);

  const handleShift = useCallback(async () => {
    // Save undo state before move
    setUndoState({
      cubeCell,
      gravity,
      score,
      combo,
      lives,
      sector,
      clearedLevels,
      statusText,
      tapCount,
      lastHint,
      level,
      collectedCubes,
    });
    await ensureSoundsLoaded();
    if (isShiftingRef.current) {
      return;
    }

    // CRITICAL: Ensure scale is at 1 before starting bounce
    if (cubeScaleX.value !== 1 || cubeScaleY.value !== 1) {
      cubeScaleX.value = 1;
      cubeScaleY.value = 1;
    }

    isShiftingRef.current = true;
    setTapCount((current: number) => current + 1);

    // Play move sound and haptic
    if (soundsLoaded) {
      soundManager.playSound('move');
    }
    if (settings?.hapticsEnabled && Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }

    // Rotate gravity and world
    const order: Gravity[] = ["down", "left", "up", "right"];
    const idx = order.indexOf(gravity);
    const nextGravity: Gravity = order[(idx + 1) % order.length];
    const nextRotation = rotation.value + 90;
    setGravity(nextGravity);
    rotation.value = withTiming(nextRotation, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });

    // Calculate where cube will land
    const resolution = findRestingCell(level, cubeCell, nextGravity);

    // CASE 1: Cube falls off the board
    if (resolution.fallen) {
      if (soundsLoaded) {
        soundManager.playSound('finish');
      }
      if (settings?.hapticsEnabled && Platform.OS !== 'web') {
        Vibration.vibrate([0, 60, 40, 60]);
      }
      const nextLives = lives - 1;
      setLives(nextLives);
      setCombo(0);
      const nextAttempts = levelAttempts + 1;
      setLevelAttempts(nextAttempts);
      const directions: Record<Gravity, string> = {
        down: "South",
        up: "North",
        left: "West",
        right: "East"
      };
      setStatusText(`☠️ Fell off! Gravity: ${directions[nextGravity]}`);
      const hint = generateHint(nextAttempts, combo, level, cubeCell);
      setLastHint(nextLives === 0 ? "Game Over! 3 lives lost." : hint || `${nextLives} ${nextLives === 1 ? 'life' : 'lives'} remaining. Be careful!`);
      boardGlow.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0.3, { duration: 300 })
      );
      // Bounce the cube up and down to indicate falling (dramatic)
      // (handled above with squash-and-stretch)
      cubeY.value = withSequence(
        withTiming(cubeY.value - 20, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(cubeY.value + CUBE_FALL_MULTIPLIER * 3, {
          duration: 300,
          easing: Easing.in(Easing.quad),
        }),
        withTiming(getCellOffset(level.spawn).y, { duration: 200, easing: Easing.out(Easing.quad) })
      );
      setTimeout(() => {
        if (nextLives === 0) {
          if (soundsLoaded) {
            soundManager.playSound('finish');
          }
          setShowGameOver(true);
        } else {
          cubeScaleX.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
          cubeScaleY.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
          runOnJS(applyLevel)(clearedLevels);
        }
        isShiftingRef.current = false;
      }, 350);
      return;
    }

    // CASE 2: Cube stays in place (blocked immediately)
    if (resolution.travelDistance === 0 && !resolution.hitCube) {
      if (settings?.hapticsEnabled && Platform.OS !== 'web') {
        Vibration.vibrate(8);
      }
      const nextAttempts = levelAttempts + 1;
      setLevelAttempts(nextAttempts);
      const directions: Record<Gravity, string> = {
        down: "downward",
        up: "upward",
        left: "to the left",
        right: "to the right"
      };
      setStatusText(`Can't move ${directions[nextGravity]}!`);
      const hint = generateHint(nextAttempts, combo, level, cubeCell);
      setLastHint(hint || "Try a different rotation direction.");
      // (handled above with squash-and-stretch)
      setTimeout(() => {
        isShiftingRef.current = false;
      }, 300);
      return;
    }

    // CASE 3: Cube moves to new position
    const offset = getCellOffset(resolution.restingCell!);
    const travelReward = Math.max(1, resolution.travelDistance);
    
    setCubeCell(resolution.restingCell!);
    setScore((current: number) => current + travelReward * 15 + combo * 10);
    setCombo((current: number) => current + 1);
    
    // Animate cube movement
    if (soundsLoaded) {
      soundManager.playSound('move');
    }
    if (settings?.hapticsEnabled && Platform.OS !== 'web') {
      Vibration.vibrate(6);
    }
    cubeX.value = withTiming(offset.x, { duration: 350, easing: Easing.out(Easing.cubic) });
    cubeY.value = withTiming(offset.y, { duration: 350, easing: Easing.out(Easing.cubic) });
    
    // Bigger bounce effect on landing
    // (handled above with squash-and-stretch)

    // CASE 4: Check for cube collection!
    if (resolution.hitCube && resolution.hitCube.number === nextCubeNumber) {
      // Correct cube collected!
      setCollectedCubes([...collectedCubes, resolution.hitCube.number]);
      setScore((current: number) => current + 200 + sector * 50 + combo * 30);
      setStatusText(`✨ COLLECTED CUBE ${resolution.hitCube.number}!`);
      if (soundsLoaded) {
        soundManager.playSound('finish');
      }
      if (settings?.hapticsEnabled && Platform.OS !== 'web') {
        Vibration.vibrate([0, 60, 40, 60]);
      }
      
      // Check if level complete (all cubes collected)
      const allCollected = [...collectedCubes, resolution.hitCube.number].length === level.cubes.length;
      if (allCollected) {
        const nextCleared = clearedLevels + 1;
        setClearedLevels(nextCleared);
        setStatusText("🏆 ALL CUBES COLLECTED! Level complete!");
        setLastHint("");
        boardGlow.value = withSequence(
          withTiming(0.7, { duration: 200 }),
          withTiming(0.3, { duration: 300 })
        );
        cubeScaleX.value = 1;
        cubeScaleY.value = 1;
        cubeScaleX.value = withSequence(
          withTiming(1.22, { duration: 120, easing: Easing.out(Easing.cubic) }),
          withTiming(0.88, { duration: 100, easing: Easing.in(Easing.cubic) }),
          withTiming(1.08, { duration: 80, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 80, easing: Easing.out(Easing.cubic) })
        );
        cubeScaleY.value = withSequence(
          withTiming(0.88, { duration: 120, easing: Easing.out(Easing.cubic) }),
          withTiming(1.22, { duration: 100, easing: Easing.in(Easing.cubic) }),
          withTiming(0.96, { duration: 80, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 80, easing: Easing.out(Easing.cubic) })
        );
        setTimeout(() => {
          runOnJS(applyLevel)(nextCleared);
          isShiftingRef.current = false;
        }, 400);
        return;
      }
    } else if (resolution.hitCube) {
      // Wrong cube!
      setStatusText(`❌ Wrong cube! Need #${nextCubeNumber}`);
      setLastHint(`Collect cube #${nextCubeNumber} to progress.`);
    }
    
    // Continue with normal move
    if (!resolution.hitCube && soundsLoaded) {
      soundManager.playSound('move');
    }
    const encouragements = [
      `Keep collecting!`,
      `Next: Cube #${nextCubeNumber}!`,
      `Cube #${nextCubeNumber} awaits!`,
      `Combo x${combo + 1}!`
    ];
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    setStatusText(randomEncouragement);
    setLastHint(`Collected: ${collectedCubes.length}/${level.cubes.length} cubes`);
    
    setTimeout(() => {
      isShiftingRef.current = false;
    }, 350);
  }, [
    applyLevel,
    boardGlow,
    clearedLevels,
    combo,
    collectedCubes,
    cubeCell,
    cubeScaleX,
    cubeScaleY,
    cubeX,
    cubeY,
    gravity,
    level,
    lives,
    nextCubeNumber,
    rebootRun,
    rotation,
    sector,
    settings?.hapticsEnabled,
  ]);

  // Animated styles
  const worldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const cubeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cubeX.value },
      { translateY: cubeY.value },
      { scaleX: cubeScaleX.value },
      { scaleY: cubeScaleY.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({ 
    opacity: boardGlow.value 
  }));

  return (
    <SafeAreaView style={s`flex-1 ${screenBg}`}>
      {/* Level Preview Modal removed */}
      <TapGestureHandler onActivated={handleShift}>
        <View style={s`flex-1`}>
          <Animated.View 
            pointerEvents="none" 
            style={[s`absolute inset-0 bg-cyan-400/10`, glowAnimatedStyle]} 
          />

          {/* Header */}
          <View style={[
            s`flex-row gap-3 px-3 pt-3 pb-3 mt-2 justify-between items-center border-b`,
            { borderColor: isDarkMode ? "#334155" : "#cbd5e1" }
          ]}>
            <View style={s`flex-row items-center gap-2`}>
              <Ionicons name="cube" size={24} color={theme.accent.secondary} />
              <Text style={[
                s`text-base font-black tracking-wide`,
                { color: isDarkMode ? "#ffffff" : "#0f172a" }
              ]}>
                SHIFT CUBED
              </Text>
            </View>
            <View style={s`flex-row gap-2`}>
                            {/* How to Play button */}
                            <Pressable onPress={() => setShowHowToPlay(true)}>
                              <View style={[
                                s`rounded-lg border px-3 py-2.5 ml-1 flex-row items-center gap-1`,
                                { 
                                  borderColor: isDarkMode ? "#0ea5e9" : "#0284c7",
                                  backgroundColor: isDarkMode ? "#1e293b" : "#e2e8f0"
                                }
                              ]}>
                                <Ionicons 
                                  name="help-circle" 
                                  size={20} 
                                  color={isDarkMode ? "#38bdf8" : "#0284c7"}
                                />
                                <Text style={[
                                  s`text-xs font-black tracking-wider`,
                                  { color: isDarkMode ? "#cffafe" : "#164e63" }
                                ]}>
                                  ?
                                </Text>
                              </View>
                            </Pressable>
                    {/* How to Play Modal */}
                    <Modal
                      visible={showHowToPlay}
                      transparent={false}
                      animationType="fade"
                      onRequestClose={() => setShowHowToPlay(false)}
                    >
                      <View style={[
                        s`flex-1 justify-center items-center px-4`,
                        { backgroundColor: isDarkMode ? "#000000e6" : "#f8fafc" }
                      ]}>
                        <View style={[
                          s`rounded-3xl border-2 px-8 py-8 items-center max-w-sm w-full`,
                          { 
                            borderColor: isDarkMode ? "#0ea5e9" : "#0284c7",
                            backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                            shadowColor: isDarkMode ? "#06b6d4" : "#0284c7",
                            shadowOpacity: 0.7,
                            shadowRadius: 30
                          }
                        ]}>
                          <Text style={[
                            s`text-2xl font-black mb-4`,
                            { color: isDarkMode ? "#cffafe" : "#164e63" }
                          ]}>How to Play</Text>
                          <Text style={[
                            s`text-base mb-3`,
                            { color: isDarkMode ? "#cbd5e1" : "#475569" }
                          ]}>Cube Collector is a puzzle game about rotating gravity to collect numbered cubes in sequence.</Text>
                          <View style={s`mb-4 w-full`}>
                            <Text style={[
                              s`mb-2 font-bold`,
                              { color: isDarkMode ? "#a5f3fc" : "#164e63" }
                            ]}>Goal:</Text>
                            <Text style={[
                              s`mb-2`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>Collect all numbered cubes (<Text style={[
                              s`font-bold`,
                              { color: isDarkMode ? "#3b82f6" : "#1e40af" }
                            ]}>1</Text>, <Text style={[
                              s`font-bold`,
                              { color: isDarkMode ? "#10b981" : "#065f46" }
                            ]}>2</Text>, <Text style={[
                              s`font-bold`,
                              { color: isDarkMode ? "#f59e0b" : "#92400e" }
                            ]}>3</Text>) in order by rotating gravity and landing on them.</Text>
                            <Text style={[
                              s`mb-2 font-bold`,
                              { color: isDarkMode ? "#a5f3fc" : "#164e63" }
                            ]}>How to Play:</Text>
                            <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• <Text style={[s``, { color: isDarkMode ? "#06b6d4" : "#0284c7" }]}>Tap anywhere</Text> to rotate gravity 90° and move your cube.</Text>
                            <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• Your cube falls in the new gravity direction until it lands on a platform.</Text>
                            <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• Land on cube <Text style={[s`font-bold`, { color: isDarkMode ? "#3b82f6" : "#1e40af" }]}>1</Text> first to collect it!</Text>
                            <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• After collecting cube 1, collect cube <Text style={[s`font-bold`, { color: isDarkMode ? "#10b981" : "#065f46" }]}>2</Text>, then cube <Text style={[s`font-bold`, { color: isDarkMode ? "#f59e0b" : "#92400e" }]}>3</Text>.</Text>
                            <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• Collect cubes out of order and nothing happens—keep trying!</Text>
                            <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• Use <Text style={[s``, { color: isDarkMode ? "#06b6d4" : "#0284c7" }]}>Undo</Text> to revert your last move if you make a mistake.</Text>
                            <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• Avoid falling off the board—lose all 3 lives and it's game over!</Text>
                          </View>
                          <Text style={[
                            s`font-bold mb-2`,
                            { color: isDarkMode ? "#22d3ee" : "#0284c7" }
                          ]}>Tips:</Text>
                          <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• Plan your rotations ahead to land safely on the correct cube.</Text>
                          <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• Build combos by moving smoothly—each move increases your multiplier!</Text>
                          <Text style={[s`mb-1`, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>• Collect all cubes quickly for high scores and sector progression!</Text>
                          <Pressable onPress={() => setShowHowToPlay(false)} style={({ pressed }: { pressed: boolean }) => [
                            {
                              marginTop: 24,
                              borderRadius: 12,
                              backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                              paddingHorizontal: 32,
                              paddingVertical: 12,
                              opacity: pressed ? 0.8 : 1,
                            }
                          ]}> 
                            <Text style={[
                              s`text-lg font-black`,
                              { color: isDarkMode ? "#020617" : "#f8fafc" }
                            ]}>Got it!</Text>
                          </Pressable>
                        </View>
                      </View>
                    </Modal>
              <Link href="/" asChild>
                <Pressable>
                  <View style={[
                    s`rounded-lg border px-3 py-2.5`,
                    { 
                      borderColor: isDarkMode ? "#475569" : "#cbd5e1",
                      backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9"
                    }
                  ]}>
                    <Ionicons name="home" size={20} color={theme.text.primary} />
                  </View>
                </Pressable>
              </Link>
              <Link href="/settings" asChild>
                <Pressable>
                  <View style={[
                    s`rounded-lg border px-3 py-2.5`,
                    { 
                      borderColor: isDarkMode ? "#475569" : "#cbd5e1",
                      backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9"
                    }
                  ]}>
                    <Ionicons name="settings" size={20} color={theme.text.primary} />
                  </View>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Undo + Gravity Row */}
          <View style={s`flex-row items-center justify-between px-4 mt-3 mb-2 gap-3`}>
            {/* Next Gravity */}
            <View style={[
              s`flex-row items-center gap-2 flex-1 rounded-lg border px-3 py-2`,
              { 
                borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                backgroundColor: isDarkMode ? "#1e293b/50" : "#f1f5f9/50"
              }
            ]}>
              <Ionicons
                name={(() => {
                  const next = getNextGravity(gravity);
                  if (next === "down") return "arrow-down-circle";
                  if (next === "up") return "arrow-up-circle";
                  if (next === "left") return "arrow-back-circle";
                  if (next === "right") return "arrow-forward-circle";
                  return "help-circle";
                })()}
                size={24}
                color={theme.accent.secondary}
              />
              <View style={s`flex-1`}>
                <Text style={[
                  s`text-[10px] uppercase tracking-[1px] font-bold`,
                  { color: isDarkMode ? "#94a3b8" : "#64748b" }
                ]}>Next Gravity</Text>
                <Text style={[
                  s`text-xs font-bold`,
                  { color: isDarkMode ? "#cffafe" : "#164e63" }
                ]}>{getNextGravity(gravity).toUpperCase()}</Text>
              </View>
            </View>
            {/* Undo Button */}
            <Pressable
              onPress={handleUndo}
              disabled={!undoState}
              style={({ pressed }: { pressed: boolean }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: isDarkMode ? "#0ea5e9" : "#0284c7",
                backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                opacity: !undoState ? 0.4 : (pressed ? 0.7 : 1),
              }]}
            >
              <Ionicons name="arrow-undo" size={20} color={theme.accent.secondary} style={s`mr-1.5`} />
              <Text style={[
                s`text-xs font-black tracking-wide`,
                { color: isDarkMode ? "#cffafe" : "#164e63" }
              ]}>UNDO</Text>
            </Pressable>
          </View>

          {/* Game Area */}
          <ScrollView style={s`flex-1 px-4 pt-2 pb-6`} contentContainerStyle={s`justify-center`} scrollEnabled={false}>
            {/* Game Board */}
            <View style={s`mb-8 items-center mt-2`}>
              <GameBoard
                level={level}
                cubeCell={cubeCell}
                nextCubeNumber={nextCubeNumber}
                collectedCount={collectedCubes.length}
                worldAnimatedStyle={worldAnimatedStyle}
                cubeAnimatedStyle={cubeAnimatedStyle}
              />
            </View>

            {/* HUD */}
            <View style={[ 
              s`border-2 border-cyan-500 bg-slate-900/95 items-center self-center mb-8 mt-4 justify-center`,
              { borderRadius: 22, shadowColor: "#06b6d4", shadowOpacity: 0.08, shadowRadius: 1, width: '99%', maxWidth: 440, minHeight: 28, paddingVertical: 0, paddingHorizontal: 1, alignItems: 'center', justifyContent: 'center' }
            ]}>
              <GameHUD
                level={level}
                gravity={gravity}
                score={score}
                combo={combo}
                lives={lives}
                sector={sector}
                clearedLevels={clearedLevels}
                bestScore={progress.bestScore}
                tapCount={tapCount}
                lastHint={lastHint}
                statusText={statusText}
              />
            </View>

          </ScrollView>
        </View>
      </TapGestureHandler>
      
      {/* Game Over Modal */}
      <Modal
        visible={showGameOver}
        transparent={false}
        animationType="fade"
      >
        <View style={[
          s`flex-1 justify-center items-center px-4`,
          { backgroundColor: isDarkMode ? "#000000e6" : "#f8fafc" }
        ]}>
          <View style={[
            s`rounded-3xl border-2 px-8 py-12 items-center max-w-sm w-full`,
            { 
              borderColor: isDarkMode ? "#ef4444" : "#dc2626",
              backgroundColor: isDarkMode ? "#1f2937" : "#fef2f2",
              shadowColor: isDarkMode ? "#ff0000" : "#dc2626",
              shadowOpacity: 0.8,
              shadowRadius: 30
            }
          ]}>
            <Text style={s`text-6xl mb-6`}>💀</Text>
            <Text style={[
              s`text-center text-3xl font-black tracking-wider mb-4`,
              { color: isDarkMode ? "#f87171" : "#dc2626" }
            ]}>
              GAME OVER!
            </Text>
            <Text style={[
              s`text-center text-base mb-8 font-semibold`,
              { color: isDarkMode ? "#fca5a5" : "#991b1b" }
            ]}>
              All stability points depleted
            </Text>
            <View style={s`w-full gap-4 mb-8`}>
              <View style={[
                s`rounded-lg border px-4 py-4`,
                { 
                  borderColor: isDarkMode ? "#be123c" : "#dc2626",
                  backgroundColor: isDarkMode ? "#450a0a" : "#fee2e2"
                }
              ]}>
                <Text style={[
                  s`text-xs uppercase tracking-[2px] font-bold mb-2`,
                  { color: isDarkMode ? "#f87171" : "#991b1b" }
                ]}>
                  Final Score
                </Text>
                <Text style={[
                  s`text-3xl font-black`,
                  { color: isDarkMode ? "#10b981" : "#059669" }
                ]}>{score}</Text>
              </View>
              <View style={s`flex-row gap-4`}>
                <View style={[
                  s`flex-1 rounded-lg border px-3 py-4`,
                  { 
                    borderColor: isDarkMode ? "#be123c" : "#dc2626",
                    backgroundColor: isDarkMode ? "#450a0a" : "#fee2e2"
                  }
                ]}>
                  <Text style={[
                    s`text-[9px] uppercase tracking-[1.5px] font-bold mb-1`,
                    { color: isDarkMode ? "#f87171" : "#991b1b" }
                  ]}>
                    Levels
                  </Text>
                  <Text style={[
                    s`text-2xl font-black`,
                    { color: isDarkMode ? "#06b6d4" : "#0284c7" }
                  ]}>{clearedLevels}</Text>
                </View>
                <View style={[
                  s`flex-1 rounded-lg border px-3 py-4`,
                  { 
                    borderColor: isDarkMode ? "#be123c" : "#dc2626",
                    backgroundColor: isDarkMode ? "#450a0a" : "#fee2e2"
                  }
                ]}>
                  <Text style={[
                    s`text-[9px] uppercase tracking-[1.5px] font-bold mb-1`,
                    { color: isDarkMode ? "#f87171" : "#991b1b" }
                  ]}>
                    Sector
                  </Text>
                  <Text style={[
                    s`text-2xl font-black`,
                    { color: isDarkMode ? "#fbbf24" : "#d97706" }
                  ]}>{sector}</Text>
                </View>
              </View>
            </View>
            <Pressable
              style={({ pressed }: { pressed: boolean }) => [
                {
                  marginTop: 8,
                  borderRadius: 12,
                  backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                  paddingHorizontal: 32,
                  paddingVertical: 12,
                  opacity: pressed ? 0.8 : 1,
                }
              ]}
              onPress={() => {
                // Save final score and sector to progress before resetting
                updateProgress({
                  score,
                  sector,
                  combo,
                  lives,
                  clearedLevels,
                  statusText,
                });
                setShowGameOver(false);
                runOnJS(rebootRun)();
              }}
            >
              <Text style={[
                s`text-lg font-black`,
                { color: isDarkMode ? "#020617" : "#f8fafc" }
              ]}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
