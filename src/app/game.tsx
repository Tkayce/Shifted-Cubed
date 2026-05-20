import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, SafeAreaView, Text, Vibration, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { s } from "react-native-wind";
import { ToggleRow } from "../components/ui/ToggleRow";
import { useAppState } from "../lib/game/AppProvider";
import { CELL_GAP, CELL_SIZE, GRID_COLS, GRID_ROWS } from "../lib/game/constants";
import {
  canPlaceBlock,
  clearRows,
  findCompleteRows,
  isGameOver,
  lockBlockInGrid,
  moveBlockDown,
  moveBlockHorizontal,
  rotateBlock,
} from "../lib/game/physics";
import { soundManager } from "../lib/game/sound";
import { getScreenClasses, getTheme } from "../lib/game/theme";
import type { Block, GameGrid } from "../lib/game/types";
import { calculateScore, createEmptyGrid, generateRandomBlock, getCellPixelPosition, getFallSpeed } from "../lib/game/utils";

const BOARD_WIDTH = GRID_COLS * (CELL_SIZE + CELL_GAP) - CELL_GAP;
const BOARD_HEIGHT = GRID_ROWS * (CELL_SIZE + CELL_GAP) - CELL_GAP;

const AnimatedView = Animated.createAnimatedComponent(View);

export default function GameScreen() {
  const { settings, progress, updateProgress, updateSettings } = useAppState();
  const router = useRouter();
  const isDarkMode = settings.darkModeEnabled;
  const screenBg = getScreenClasses(isDarkMode);
  const theme = getTheme(isDarkMode);

  // Game state
  const [grid, setGrid] = useState<GameGrid>(createEmptyGrid());
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [nextBlock, setNextBlock] = useState<Block>(generateRandomBlock());
  const [score, setScore] = useState(0);
  const [rowsCleared, setRowsCleared] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [gameOverState, setGameOverState] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  // Animation values
  const blockX = useSharedValue(0);
  const blockY = useSharedValue(0);
  const scorePopupOpacity = useSharedValue(0);
  const scorePopupY = useSharedValue(0);

  // Refs
  const fallIntervalRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);

  // Load sounds
  const ensureSoundsLoaded = useCallback(async () => {
    if (!soundsLoaded) {
      await soundManager.initialize();
      await soundManager.loadSound('move', require('../assets/sounds/change.mp3'));
      await soundManager.loadSound('finish', require('../assets/sounds/Finish.mp3'));
      setSoundsLoaded(true);
    }
  }, [soundsLoaded]);

  // Spawn new block
  const spawnBlock = useCallback(() => {
    const newBlock = nextBlock;
    setCurrentBlock(newBlock);
    setNextBlock(generateRandomBlock());

    // Update block position animation
    const { x, y } = getCellPixelPosition(newBlock.position.col, newBlock.position.row);
    blockX.value = x;
    blockY.value = y;

    // Check if can place (game over check)
    if (!canPlaceBlock(newBlock, grid)) {
      setGameOverState(true);
      // Save progress immediately on game over
      updateProgress({ score, sector: level, combo, lives: 1, clearedLevels: rowsCleared, statusText: '' });
      if (soundsLoaded) {
        soundManager.playSound('finish');
      }
    }
  }, [nextBlock, grid, blockX, blockY, soundsLoaded, score, level, combo, rowsCleared, updateProgress]);

  // Move block down automatically
  const moveDown = useCallback(() => {
    if (!currentBlock || isPaused || gameOverState) return;

    const movedBlock = moveBlockDown(currentBlock, grid);

    if (movedBlock) {
      setCurrentBlock(movedBlock);
      const { x, y } = getCellPixelPosition(movedBlock.position.col, movedBlock.position.row);
      blockX.value = withTiming(x, { duration: 150 });
      blockY.value = withTiming(y, { duration: 150 });
    } else {
      // Block landed - lock it
      const newGrid = lockBlockInGrid(currentBlock, grid);
      setGrid(newGrid);

      if (soundsLoaded) {
        soundManager.playSound('move');
      }
      if (settings?.hapticsEnabled && Platform.OS !== 'web') {
        Vibration.vibrate(10);
      }

      // Check for complete rows
      const completeRows = findCompleteRows(newGrid);
      let finalGrid = newGrid;

      if (completeRows.length > 0) {
        // Clear rows and update score
        finalGrid = clearRows(newGrid, completeRows);
        setGrid(finalGrid);
        setRowsCleared(prev => prev + completeRows.length);
        
        const comboBonus = combo + 1;
        setCombo(comboBonus);
        
        const points = calculateScore(completeRows.length, comboBonus);
        setScore(prev => prev + points);

        // Animate score popup
        scorePopupOpacity.value = 1;
        scorePopupY.value = 0;
        scorePopupOpacity.value = withTiming(0, { duration: 1500 });
        scorePopupY.value = withTiming(-100, { duration: 1500 });

        if (soundsLoaded) {
          soundManager.playSound('finish');
        }
        if (settings?.hapticsEnabled && Platform.OS !== 'web') {
          Vibration.vibrate([0, 60, 40, 60]);
        }

        // Level up every 10 rows
        if ((rowsCleared + completeRows.length) % 10 === 0) {
          setLevel(prev => prev + 1);
        }
      } else {
        setCombo(0); // Reset combo if no rows cleared
      }

      // Check game over
      if (isGameOver(finalGrid)) {
        setGameOverState(true);
        // Save progress immediately on game over
        updateProgress({ score, sector: level, combo, lives: 1, clearedLevels: rowsCleared, statusText: '' });
        if (soundsLoaded) {
          soundManager.playSound('finish');
        }
      } else {
        // Spawn next block
        setTimeout(() => {
          runOnJS(spawnBlock)();
        }, 200);
      }
    }
  }, [currentBlock, grid, isPaused, gameOverState, combo, rowsCleared, blockX, blockY, scorePopupOpacity, scorePopupY, settings, soundsLoaded, spawnBlock, score, level, updateProgress]);

  // Handle horizontal drag
  const handleDrag = useCallback((translationX: number) => {
    if (!currentBlock || isPaused || gameOverState) return;

    const direction = translationX > 0 ? 1 : -1;
    const movedBlock = moveBlockHorizontal(currentBlock, direction, grid);

    if (movedBlock) {
      setCurrentBlock(movedBlock);
      const { x, y } = getCellPixelPosition(movedBlock.position.col, movedBlock.position.row);
      blockX.value = withSpring(x, { damping: 20, stiffness: 300 });
      if (soundsLoaded) {
        soundManager.playSound('move');
      }
    }
  }, [currentBlock, grid, isPaused, gameOverState, blockX, soundsLoaded]);

  // Handle vertical drag (drop faster)
  const handleDragDown = useCallback(() => {
    if (!currentBlock || isPaused || gameOverState) return;

    const movedBlock = moveBlockDown(currentBlock, grid);

    if (movedBlock) {
      setCurrentBlock(movedBlock);
      const { x, y } = getCellPixelPosition(movedBlock.position.col, movedBlock.position.row);
      blockY.value = withTiming(y, { duration: 50 });
    }
  }, [currentBlock, grid, isPaused, gameOverState, blockY]);

  // Handle rotation
  const handleRotate = useCallback(() => {
    if (!currentBlock || isPaused || gameOverState) return;

    const rotatedBlock = rotateBlock(currentBlock, grid);

    if (rotatedBlock) {
      setCurrentBlock(rotatedBlock);
      const { x, y } = getCellPixelPosition(rotatedBlock.position.col, rotatedBlock.position.row);
      blockX.value = withSpring(x, { damping: 20, stiffness: 300 });
      blockY.value = withSpring(y, { damping: 20, stiffness: 300 });
      if (soundsLoaded) {
        soundManager.playSound('move');
      }
      if (settings?.hapticsEnabled && Platform.OS !== 'web') {
        Vibration.vibrate(10);
      }
    }
  }, [currentBlock, grid, isPaused, gameOverState, blockX, blockY, soundsLoaded, settings]);

  // Start game
  const startGame = useCallback(() => {
    ensureSoundsLoaded();
    setGrid(createEmptyGrid());
    setScore(0);
    setRowsCleared(0);
    setLevel(1);
    setCombo(0);
    setGameOverState(false);
    setIsPaused(false);
    setCurrentBlock(null);
    spawnBlock();
  }, [ensureSoundsLoaded, spawnBlock]);

  // Auto-fall timer
  useEffect(() => {
    if (currentBlock && !isPaused && !gameOverState) {
      const speed = getFallSpeed(level);
      fallIntervalRef.current = setInterval(() => {
        runOnJS(moveDown)();
      }, speed) as unknown as number;
    }

    return () => {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current);
        fallIntervalRef.current = null;
      }
    };
  }, [currentBlock, isPaused, gameOverState, level, moveDown]);

  // Initialize game on mount
  useEffect(() => {
    startGame();
  }, []);

  // Pause game when modals appear
  useEffect(() => {
    if (showExitConfirm || gameOverState) {
      setIsPaused(true);
    }
  }, [showExitConfirm, gameOverState]);

  // Pause game when navigating away
  useFocusEffect(
    useCallback(() => {
      // Resume when screen is focused (but only if not game over)
      if (!gameOverState) {
        setIsPaused(false);
      }
      
      return () => {
        // Pause when leaving screen
        setIsPaused(true);
        // Clear any running intervals
        if (fallIntervalRef.current) {
          clearInterval(fallIntervalRef.current);
          fallIntervalRef.current = null;
        }
        // Save progress when leaving (if game is active)
        if (!gameOverState && score > 0) {
          updateProgress({ score, sector: level, combo, lives: 1, clearedLevels: rowsCleared, statusText: '' });
        }
      };
    }, [gameOverState, score, level, combo, rowsCleared, updateProgress])
  );

  // Animated styles
  const blockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: blockX.value },
      { translateY: blockY.value },
    ],
  }));

  const scorePopupStyle = useAnimatedStyle(() => ({
    opacity: scorePopupOpacity.value,
    transform: [{ translateY: scorePopupY.value }],
  }));

  // Pan gesture handler
  const onGestureEvent = useCallback((event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const deltaX = event.nativeEvent.translationX - dragStartXRef.current;
      const deltaY = event.nativeEvent.translationY - dragStartYRef.current;
      
      // Handle horizontal drag
      if (Math.abs(deltaX) > 30) {
        handleDrag(deltaX);
        dragStartXRef.current = event.nativeEvent.translationX;
      }

      // Handle downward drag
      if (deltaY > 20) {
        handleDragDown();
        dragStartYRef.current = event.nativeEvent.translationY;
      }
    } else if (event.nativeEvent.state === State.BEGAN) {
      dragStartXRef.current = 0;
      dragStartYRef.current = 0;
    }
  }, [handleDrag, handleDragDown]);

  return (
    <SafeAreaView style={s`flex-1 ${screenBg}`}>
      <View style={s`flex-1`}>
        {/* Header */}
        <View style={[
          s`flex-row gap-2 px-3 pt-2 pb-2 mt-2 justify-between items-center border-b`,
          { borderColor: isDarkMode ? "#334155" : "#cbd5e1" }
        ]}>
          <View style={s`flex-row items-center gap-1.5`}>
            <Ionicons name="grid" size={18} color={theme.accent.secondary} />
            <Text style={[
              s`text-sm font-black tracking-wide`,
              { color: isDarkMode ? "#ffffff" : "#0f172a" }
            ]}>
              Shifted-Cubed
            </Text>
          </View>
          <View style={s`flex-row gap-1.5`}>
            <Pressable onPress={() => setShowSettings(true)}>
              <View style={[
                s`rounded-lg border px-2 py-1.5`,
                { 
                  borderColor: theme.border.primary,
                  backgroundColor: isDarkMode ? "#1e293b" : "#e2e8f0"
                }
              ]}>
                <Ionicons name="settings" size={18} color={theme.accent.secondary} />
              </View>
            </Pressable>
            <Pressable onPress={() => setShowExitConfirm(true)}>
              <View style={[
                s`rounded-lg border-2 px-2 py-1.5`,
                { 
                  borderColor: isDarkMode ? "#ef4444" : "#dc2626",
                  backgroundColor: isDarkMode ? "#7f1d1d" : "#fee2e2"
                }
              ]}>
                <Ionicons name="exit" size={18} color={isDarkMode ? "#fca5a5" : "#991b1b"} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Score HUD */}
        <View style={[
          s`mx-3 mt-1.5 mb-2 rounded-lg border p-2`,
          { 
            borderColor: theme.border.primary,
            backgroundColor: isDarkMode ? "#1a1f3a" : "#f3f4f6"
          }
        ]}>
          <View style={s`flex-row justify-between items-center`}>
            <View>
              <Text style={[
                s`text-[9px] uppercase tracking-wide font-bold`,
                { color: theme.text.muted }
              ]}>Score</Text>
              <Text style={[
                s`text-lg font-black`,
                { color: "#00f5ff" }
              ]}>{score}</Text>
            </View>
            <View>
              <Text style={[
                s`text-[9px] uppercase tracking-wide font-bold`,
                { color: theme.text.muted }
              ]}>Rows</Text>
              <Text style={[
                s`text-lg font-black`,
                { color: "#ff00ff" }
              ]}>{rowsCleared}</Text>
            </View>
            <View>
              <Text style={[
                s`text-[9px] uppercase tracking-wide font-bold`,
                { color: theme.text.muted }
              ]}>Level</Text>
              <Text style={[
                s`text-lg font-black`,
                { color: "#ffed00" }
              ]}>{level}</Text>
            </View>
          </View>
        </View>

        {/* Game Board */}
        <PanGestureHandler onHandlerStateChange={onGestureEvent} onGestureEvent={onGestureEvent}>
          <View style={s`items-center mt-1`}>
            <View style={[
              s`rounded-xl border-2 overflow-hidden`,
              {
                width: BOARD_WIDTH + 14,
                height: BOARD_HEIGHT + 14,
                borderColor: theme.border.primary,
                backgroundColor: isDarkMode ? "#0a0e27" : "#fafbfc",
                padding: 7,
              }
            ]}>
              {/* Grid */}
              {grid.map((row, rowIndex) => (
                <View key={rowIndex} style={s`flex-row`}>
                  {row.map((cell, colIndex) => (
                    <View
                      key={colIndex}
                      style={[
                        {
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          marginRight: colIndex < GRID_COLS - 1 ? CELL_GAP : 0,
                          marginBottom: rowIndex < GRID_ROWS - 1 ? CELL_GAP : 0,
                          backgroundColor: cell.filled && cell.color
                            ? cell.color 
                            : (isDarkMode ? "#1a1f3a" : "#e5e7eb"),
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: cell.filled 
                            ? "rgba(255,255,255,0.3)" 
                            : (isDarkMode ? "#252d4a" : "#d1d5db"),
                        }
                      ]}
                    />
                  ))}
                </View>
              ))}

              {/* Current Block */}
              {currentBlock && (
                <AnimatedView
                  style={[
                    { position: 'absolute', top: 7, left: 7 },
                    blockAnimatedStyle,
                  ]}
                >
                  {currentBlock.cells.map((cell, index) => {
                    const { x, y } = getCellPixelPosition(cell.col, cell.row);
                    return (
                      <View
                        key={index}
                        style={[
                          {
                            position: 'absolute',
                            left: x,
                            top: y,
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            backgroundColor: currentBlock.color,
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: 'rgba(255,255,255,0.5)',
                            shadowColor: currentBlock.color,
                            shadowOpacity: 0.8,
                            shadowRadius: 7,
                          }
                        ]}
                      />
                    );
                  })}
                </AnimatedView>
              )}

              {/* Score Popup */}
              <AnimatedView
                style={[
                  { position: 'absolute', top: BOARD_HEIGHT / 2, left: BOARD_WIDTH / 2, alignSelf: 'center' },
                  scorePopupStyle,
                ]}
              >
                <Text style={[
                  s`text-3xl font-black`,
                  { color: "#00ff00", textShadowColor: "#000", textShadowRadius: 5 }
                ]}>
                  +{combo > 1 ? calculateScore(1, combo) : ''}
                </Text>
              </AnimatedView>
            </View>
          </View>
        </PanGestureHandler>

        {/* Controls */}
        <View style={s`items-center mt-2 px-3 pb-2`}>
          <Pressable
            onPress={handleRotate}
            style={({ pressed }) => [
              s`rounded-lg border-2 px-5 py-2 mb-1.5`,
              {
                borderColor: theme.accent.primary,
                backgroundColor: pressed 
                  ? (isDarkMode ? "#164e63" : "#cffafe")
                  : (isDarkMode ? "#0a0e27" : "#f1f5f9"),
                opacity: pressed ? 0.8 : 1,
              }
            ]}
          >
            <View style={s`flex-row items-center gap-1.5`}>
              <Ionicons name="refresh" size={16} color={theme.accent.secondary} />
              <Text style={[
                s`text-xs font-black`,
                { color: theme.accent.secondary }
              ]}>ROTATE</Text>
            </View>
          </Pressable>
          <Text style={[
            s`text-center text-[10px] font-semibold`,
            { color: theme.text.muted }
          ]}>
            Drag left/right to move • Drag down to drop
          </Text>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent={false} animationType="slide">
        <SafeAreaView style={[s`flex-1`, { backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc" }]}>
          <View style={s`flex-1 px-4 py-6`}>
            {/* Header */}
            <View style={s`flex-row items-center justify-between mb-6`}>
              <Pressable onPress={() => setShowSettings(false)}>
                <View style={[
                  s`px-4 py-2.5 rounded-lg`,
                  {
                    backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                    borderWidth: 1,
                    borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                  }
                ]}>
                  <Ionicons name="close" size={24} color={theme.accent.secondary} />
                </View>
              </Pressable>
              <Text style={[
                s`text-2xl font-black tracking-wide`,
                { color: theme.accent.secondary }
              ]}>SETTINGS</Text>
              <View style={s`w-14`} />
            </View>

            {/* Settings Options */}
            <View style={s`max-w-2xl mx-auto w-full`}>
              <ToggleRow
                label="Sound Effects"
                description="Play audio feedback for moves and clears"
                value={settings.soundEnabled}
                onPress={() => {
                  updateSettings((current) => ({
                    ...current,
                    soundEnabled: !current.soundEnabled
                  }));
                  soundManager.setEnabled(!settings.soundEnabled);
                }}
                isDarkMode={isDarkMode}
              />
              <ToggleRow
                label="Haptic Feedback"
                description="Vibrate on blocks landing and clearing rows"
                value={settings.hapticsEnabled}
                onPress={() => updateSettings((current) => ({
                  ...current,
                  hapticsEnabled: !current.hapticsEnabled
                }))}
                isDarkMode={isDarkMode}
              />
              <ToggleRow
                label="Dark Mode"
                description="Switch between dark and light themes"
                value={settings.darkModeEnabled}
                onPress={() => updateSettings((current) => ({
                  ...current,
                  darkModeEnabled: !current.darkModeEnabled
                }))}
                isDarkMode={isDarkMode}
              />

              {/* Game Info */}
              <View style={[
                s`mt-8 rounded-2xl border-2 px-6 py-5`,
                {
                  borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                  backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                }
              ]}>
                <Text style={[
                  s`text-xs uppercase tracking-[2px] font-black mb-4`,
                  { color: theme.accent.secondary }
                ]}>GAME STATS</Text>
                <View style={s`flex-row justify-between items-center mb-3`}>
                  <View>
                    <Text style={[
                      s`text-xs uppercase tracking-[1px] font-bold`,
                      { color: isDarkMode ? "#cbd5e1" : "#475569" }
                    ]}>Best Score</Text>
                    <Text style={[
                      s`mt-1 text-2xl font-black`,
                      { color: theme.accent.secondary }
                    ]}>{progress.bestScore}</Text>
                  </View>
                  <View>
                    <Text style={[
                      s`text-xs uppercase tracking-[1px] font-bold`,
                      { color: isDarkMode ? "#cbd5e1" : "#475569" }
                    ]}>Highest Level</Text>
                    <Text style={[
                      s`mt-1 text-2xl font-black`,
                      { color: isDarkMode ? "#10b981" : "#059669" }
                    ]}>{progress.highestSector}</Text>
                  </View>
                </View>
              </View>

              {/* How to Play */}
              <Link href="/howtoplay" asChild>
                <Pressable
                  style={({ pressed }) => [
                    s`mt-6 rounded-2xl border-2 px-6 py-4`,
                    {
                      borderColor: theme.border.primary,
                      backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                      opacity: pressed ? 0.7 : 1,
                    }
                  ]}
                  onPress={() => {
                    setShowSettings(false);
                  }}
                >
                  <View style={s`flex-row items-center justify-between`}>
                    <View>
                      <Text style={[
                        s`text-base font-black`,
                        { color: isDarkMode ? "#ffffff" : "#0f172a" }
                      ]}>How to Play</Text>
                      <Text style={[
                        s`text-xs mt-1`,
                        { color: theme.text.muted }
                      ]}>View game instructions</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={theme.text.muted} />
                  </View>
                </Pressable>
              </Link>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Game Over Modal */}
      <Modal visible={gameOverState} transparent={false} animationType="fade">
        <View style={[
          s`flex-1 justify-center items-center px-4`,
          { backgroundColor: isDarkMode ? "#000000e6" : "#f8fafc" }
        ]}>
          <View style={[
            s`rounded-3xl border-2 px-8 py-12 items-center max-w-sm w-full`,
            { 
              borderColor: isDarkMode ? "#ef4444" : "#dc2626",
              backgroundColor: isDarkMode ? "#1f2937" : "#fef2f2",
            }
          ]}>
            <Text style={[
              s`text-center text-3xl font-black tracking-wider mb-4`,
              { color: isDarkMode ? "#f87171" : "#dc2626" }
            ]}>
              GAME OVER!
            </Text>
            <View style={s`w-full gap-4 mb-8`}>
              <View style={[
                s`rounded-lg border px-4 py-4`,
                { 
                  borderColor: theme.border.primary,
                  backgroundColor: isDarkMode ? "#0a0e27" : "#e5e7eb"
                }
              ]}>
                <Text style={[
                  s`text-xs uppercase tracking-[2px] font-bold mb-2`,
                  { color: theme.text.muted }
                ]}>Final Score</Text>
                <Text style={[
                  s`text-3xl font-black`,
                  { color: "#00f5ff" }
                ]}>{score}</Text>
              </View>
              <View style={s`flex-row gap-4`}>
                <View style={[
                  s`flex-1 rounded-lg border px-3 py-4`,
                  { 
                    borderColor: theme.border.primary,
                    backgroundColor: isDarkMode ? "#0a0e27" : "#e5e7eb"
                  }
                ]}>
                  <Text style={[
                    s`text-[9px] uppercase tracking-[1.5px] font-bold mb-1`,
                    { color: theme.text.muted }
                  ]}>Rows</Text>
                  <Text style={[
                    s`text-2xl font-black`,
                    { color: "#ff00ff" }
                  ]}>{rowsCleared}</Text>
                </View>
                <View style={[
                  s`flex-1 rounded-lg border px-3 py-4`,
                  { 
                    borderColor: theme.border.primary,
                    backgroundColor: isDarkMode ? "#0a0e27" : "#e5e7eb"
                  }
                ]}>
                  <Text style={[
                    s`text-[9px] uppercase tracking-[1.5px] font-bold mb-1`,
                    { color: theme.text.muted }
                  ]}>Level</Text>
                  <Text style={[
                    s`text-2xl font-black`,
                    { color: "#ffed00" }
                  ]}>{level}</Text>
                </View>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  marginTop: 8,
                  borderRadius: 12,
                  backgroundColor: theme.accent.primary,
                  paddingHorizontal: 32,
                  paddingVertical: 12,
                  opacity: pressed ? 0.8 : 1,
                }
              ]}
              onPress={() => {
                setGameOverState(false);
                startGame();
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

      {/* Exit Confirmation Modal */}
      <Modal visible={showExitConfirm} transparent={true} animationType="fade">
        <View style={[
          s`flex-1 justify-center items-center px-4`,
          { backgroundColor: "rgba(0,0,0,0.8)" }
        ]}>
          <View style={[
            s`rounded-3xl border-2 px-8 py-8 items-center max-w-sm w-full`,
            { 
              borderColor: theme.accent.primary,
              backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
            }
          ]}>
            <Ionicons name="help-circle" size={48} color={theme.accent.secondary} style={s`mb-4`} />
            <Text style={[
              s`text-center text-2xl font-black mb-2`,
              { color: isDarkMode ? "#ffffff" : "#0f172a" }
            ]}>
              Leave Game?
            </Text>
            <Text style={[
              s`text-center text-sm mb-6`,
              { color: theme.text.muted }
            ]}>
              Your progress will be saved
            </Text>
            
            <View style={s`w-full gap-3`}>
              <Pressable
                style={({ pressed }) => [
                  s`rounded-xl border-2 px-6 py-3`,
                  {
                    borderColor: theme.accent.primary,
                    backgroundColor: pressed 
                      ? theme.accent.primary
                      : (isDarkMode ? "#1e293b" : "#f8fafc"),
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
                onPress={() => {
                  setShowExitConfirm(false);
                  setIsPaused(false); // Resume game
                }}
              >
                <Text style={[
                  s`text-center text-base font-black`,
                  { color: theme.accent.secondary }
                ]}>CONTINUE PLAYING</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  s`rounded-xl px-6 py-3`,
                  {
                    backgroundColor: isDarkMode ? "#7f1d1d" : "#fee2e2",
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
                onPress={() => {
                  setShowExitConfirm(false);
                  // Save progress before leaving
                  if (!gameOverState && score > 0) {
                    updateProgress({ score, sector: level, combo, lives: 1, clearedLevels: rowsCleared, statusText: '' });
                  }
                  router.push('/');
                }}
              >
                <Text style={[
                  s`text-center text-base font-black`,
                  { color: isDarkMode ? "#fca5a5" : "#991b1b" }
                ]}>QUIT GAME</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
