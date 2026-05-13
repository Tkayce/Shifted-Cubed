import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { s } from "react-native-wind";
import { ToggleRow } from "../components/ui/ToggleRow";
import { useAppState } from "../lib/game/AppProvider";
import { getScreenClasses, getTheme } from "../lib/game/theme";

export default function SettingsScreen() {
  const { settings, progress, updateSettings } = useAppState();
  
  React.useEffect(() => {
    try { 
      require('../lib/game/sound').soundManager.setEnabled(settings.soundEnabled); 
    } catch {}
  }, [settings.soundEnabled]);

  const isDarkMode = settings.darkModeEnabled;
  const screenBg = getScreenClasses(isDarkMode);
  const theme = getTheme(isDarkMode);

  return (
    <SafeAreaView style={s`flex-1 ${screenBg}`}>
      <ScrollView
        style={s`flex-1`}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 32,
          paddingHorizontal: 20
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s`max-w-2xl mx-auto w-full`}>
          {/* Header */}
          <View style={s`mb-8 mt-4 flex-row items-center justify-between`}>
            <Link href="/game" asChild>
              <Pressable>
                <View style={[
                  s`px-4 py-2.5 active:opacity-70 rounded-lg`,
                  {
                    backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                    borderWidth: 1,
                    borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                  }
                ]}>
                  <Ionicons 
                    name="arrow-back" 
                    size={24} 
                    color={theme.accent.secondary}
                  />
                </View>
              </Pressable>
            </Link>
            <Text style={[
              s`text-2xl font-black tracking-wide`,
              { color: theme.accent.secondary }
            ]}>
              SETTINGS
            </Text>
            <View style={s`w-8`} />
          </View>

          {/* Best Score Card - Prominent */}
          <View style={[
            s`mb-8 rounded-3xl border-2 px-6 py-6`,
            {
              borderColor: isDarkMode ? "#06b6d4" : "#0284c7",
              backgroundColor: isDarkMode ? "#164e63" : "#cffafe",
              shadowColor: isDarkMode ? "#06b6d4" : "#0284c7",
              shadowOpacity: 0.4,
              shadowRadius: 12,
            }
          ]}>
            <Text style={[
              s`text-xs uppercase tracking-[3px] font-black mb-2`,
              { color: isDarkMode ? "#a5f3fc" : "#0c4a6e" }
            ]}>
              Your Best Score
            </Text>
            <Text style={[
              s`text-5xl font-black`,
              { color: isDarkMode ? "#22d3ee" : "#0284c7" }
            ]}>
              {progress.bestScore}
            </Text>
            <View style={[
              s`mt-4 pt-4 flex-row justify-between items-center`,
              {
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? "#0ea5e9" : "#0ea5e9",
              }
            ]}>
              <View>
                <Text style={[
                  s`text-xs uppercase tracking-[1px] font-bold mb-1`,
                  { color: isDarkMode ? "#7dd3fc" : "#0284c7" }
                ]}>
                  Highest Sector
                </Text>
                <Text style={[
                  s`text-3xl font-black`,
                  { color: isDarkMode ? "#22d3ee" : "#0284c7" }
                ]}>
                  {progress.highestSector}
                </Text>
              </View>
              <Ionicons 
                name="trophy" 
                size={48} 
                color={isDarkMode ? "#fbbf24" : "#f59e0b"}
              />
            </View>
          </View>

          {/* Theme Section */}
          <View style={s`mb-8`}>
            <View style={s`flex-row items-center gap-2 mb-4`}>
              <View style={[
                s`w-8 h-8 rounded-lg items-center justify-center`,
                {
                  backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                }
              ]}>
                <Ionicons 
                  name={isDarkMode ? "moon" : "sunny"} 
                  size={18} 
                  color="white"
                />
              </View>
              <Text style={[
                s`text-sm uppercase tracking-[2px] font-black`,
                { color: theme.accent.secondary }
              ]}>
                APPEARANCE
              </Text>
            </View>
            <ToggleRow
              label="Dark Mode"
              description={isDarkMode ? "Dark mode is on. Switch to light mode." : "Light mode is on. Switch to dark mode."}
              value={isDarkMode}
              isDarkMode={isDarkMode}
              onPress={() => updateSettings((current) => ({ 
                ...current, 
                darkModeEnabled: !current.darkModeEnabled 
              }))}
            />
          </View>

          {/* Audio Section */}
          <View style={s`mb-8`}>
            <View style={s`flex-row items-center gap-2 mb-4`}>
              <View style={[
                s`w-8 h-8 rounded-lg items-center justify-center`,
                {
                  backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                }
              ]}>
                <Ionicons 
                  name="volume-high" 
                  size={18} 
                  color="white"
                />
              </View>
              <Text style={[
                s`text-sm uppercase tracking-[2px] font-black`,
                { color: theme.accent.secondary }
              ]}>
                AUDIO & HAPTICS
              </Text>
            </View>
            <ToggleRow
              label="Sound Effects"
              description={settings.soundEnabled ? "Sound is on. Tap to mute." : "Sound is off. Tap to enable."}
              value={settings.soundEnabled}
              isDarkMode={isDarkMode}
              onPress={() => {
                const next = !settings.soundEnabled;
                try {
                  require('../lib/game/sound').soundManager.setEnabled(next);
                } catch {}
                updateSettings((current) => ({
                  ...current,
                  soundEnabled: next
                }));
              }}
            />
            <ToggleRow
              label="Haptic Feedback"
              description={settings.hapticsEnabled ? "Vibration is on. Tap to disable." : "Vibration is off. Tap to enable."}
              value={settings.hapticsEnabled}
              isDarkMode={isDarkMode}
              onPress={() => updateSettings((current) => ({ 
                ...current, 
                hapticsEnabled: !current.hapticsEnabled 
              }))}
            />
          </View>

          {/* Gameplay Section */}
          <View style={[
            s`mb-8 rounded-2xl border-2 px-6 py-5`,
            {
              borderColor: isDarkMode ? "#334155" : "#cbd5e1",
              backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc",
            }
          ]}>
            <View style={s`flex-row items-center gap-2 mb-3`}>
              <View style={[
                s`w-8 h-8 rounded-lg items-center justify-center`,
                {
                  backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                }
              ]}>
                <Ionicons 
                  name="cube" 
                  size={18} 
                  color="white"
                />
              </View>
              <Text style={[
                s`text-sm uppercase tracking-[2px] font-black`,
                { color: theme.accent.secondary }
              ]}>
                ABOUT CUBE COLLECTOR
              </Text>
            </View>
            <Text style={[
              s`text-sm leading-6 font-medium`,
              { color: isDarkMode ? "#cbd5e1" : "#475569" }
            ]}>
              Collect numbered cubes in sequence (1 → 2 → 3) by rotating gravity. Navigate platforms, 
              build combos, and progress through 6 challenging sectors. Master the gravity mechanics!
            </Text>
          </View>

          {/* Version Info */}
          <View 
            style={[
              s`rounded-2xl border-2 px-6 py-5`,
              {
                borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc",
              }
            ]}
          >
            <View style={s`flex-row items-center gap-2 mb-3`}>
              <View style={[
                s`w-8 h-8 rounded-lg items-center justify-center`,
                {
                  backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                }
              ]}>
                <Ionicons 
                  name="code-slash" 
                  size={18} 
                  color="white"
                />
              </View>
              <Text style={[
                s`text-sm uppercase tracking-[2px] font-black`,
                { color: theme.accent.secondary }
              ]}>
                VERSION
              </Text>
            </View>
            <Text style={[
              s`text-sm font-bold mb-1`,
              { color: isDarkMode ? "#cbd5e1" : "#475569" }
            ]}>
              Cube Collector v1.0.0
            </Text>
            <Text style={[
              s`text-xs leading-5`,
              { color: isDarkMode ? "#94a3b8" : "#64748b" }
            ]}>
              Built with React Native, Expo, and Reanimated. Dark and light mode themes included.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
