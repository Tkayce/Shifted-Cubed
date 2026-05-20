import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { s } from "react-native-wind";
import { useAppState } from "../lib/game/AppProvider";
import { getScreenClasses, getTheme } from "../lib/game/theme";

export default function HowToPlayScreen() {
  const { settings } = useAppState();
  const isDarkMode = settings.darkModeEnabled;
  const screenBg = getScreenClasses(isDarkMode);
  const theme = getTheme(isDarkMode);

  return (
    <SafeAreaView style={[s`flex-1`, { backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc" }]}>
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
          <View style={s`mb-6 mt-4 flex-row items-center justify-between`}>
            <Link href="/settings" asChild>
              <Pressable>
                <View style={[
                  s`px-4 py-2.5 rounded-lg`,
                  {
                    backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                    borderWidth: 1,
                    borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                  }
                ]}>
                  <Ionicons name="arrow-back" size={24} color={theme.accent.secondary} />
                </View>
              </Pressable>
            </Link>
            <Text style={[
              s`text-2xl font-black tracking-wide`,
              { color: theme.accent.secondary }
            ]}>HOW TO PLAY</Text>
            <View style={s`w-14`} />
          </View>

          {/* Game Mechanics */}
          <View style={[
            s`mb-6 rounded-2xl border p-5`,
            { 
              borderColor: theme.border.primary,
              backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9"
            }
          ]}>
            <Text style={[
              s`text-sm uppercase tracking-wider font-black mb-4`,
              { color: theme.accent.secondary }
            ]}>Game Mechanics</Text>
            <View style={s`gap-4 pl-2`}>
              <View>
                <Text style={[
                  s`font-bold text-base leading-6`,
                  { color: isDarkMode ? "#ffffff" : "#0f172a" }
                ]}>• Blocks Fall Automatically</Text>
                <Text style={[
                  s`text-sm mt-1 leading-6 pl-4`,
                  { color: isDarkMode ? "#94a3b8" : "#64748b" }
                ]}>Different shaped blocks drop from the top of the screen</Text>
              </View>
              <View>
                <Text style={[
                  s`font-bold text-base leading-6`,
                  { color: isDarkMode ? "#ffffff" : "#0f172a" }
                ]}>• Drag Left or Right</Text>
                <Text style={[
                  s`text-sm mt-1 leading-6 pl-4`,
                  { color: isDarkMode ? "#94a3b8" : "#64748b" }
                ]}>Swipe horizontally to position blocks where you want them</Text>
              </View>
              <View>
                <Text style={[
                  s`font-bold text-base leading-6`,
                  { color: isDarkMode ? "#ffffff" : "#0f172a" }
                ]}>• Drag Down to Drop Faster</Text>
                <Text style={[
                  s`text-sm mt-1 leading-6 pl-4`,
                  { color: isDarkMode ? "#94a3b8" : "#64748b" }
                ]}>Swipe down to make blocks fall faster when you're ready</Text>
              </View>
              <View>
                <Text style={[
                  s`font-bold text-base leading-6`,
                  { color: isDarkMode ? "#ffffff" : "#0f172a" }
                ]}>• Press Rotate Button</Text>
                <Text style={[
                  s`text-sm mt-1 leading-6 pl-4`,
                  { color: isDarkMode ? "#94a3b8" : "#64748b" }
                ]}>Use the ROTATE button to change block orientation</Text>
              </View>
              <View>
                <Text style={[
                  s`font-bold text-base leading-6`,
                  { color: isDarkMode ? "#ffffff" : "#0f172a" }
                ]}>• Clear Complete Rows</Text>
                <Text style={[
                  s`text-sm mt-1 leading-6 pl-4`,
                  { color: isDarkMode ? "#94a3b8" : "#64748b" }
                ]}>Fill entire horizontal rows to clear them and score points</Text>
              </View>
            </View>
          </View>

          {/* Scoring */}
          <View style={[
            s`mb-6 rounded-2xl border p-5`,
            { 
              borderColor: theme.border.primary,
              backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9"
            }
          ]}>
            <Text style={[
              s`text-sm uppercase tracking-wider font-black mb-4`,
              { color: theme.accent.secondary }
            ]}>Scoring System</Text>
            <View style={s`gap-3 pl-2`}>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>• 1 Row = 100 points</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>• 2 Rows = 300 points</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>• 3 Rows = 500 points</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>• 4 Rows = 800 points (Tetris!)</Text>
              <Text style={[
                s`text-sm leading-6 font-bold mt-2`,
                { color: theme.accent.secondary }
              ]}>Combo Multiplier: Clear rows consecutively for bonus points!</Text>
            </View>
          </View>

          {/* Important Rules */}
          <View style={[
            s`mb-6 rounded-2xl border-2 p-5`,
            { 
              borderColor: isDarkMode ? "#f87171" : "#dc2626",
              backgroundColor: isDarkMode ? "#450a0a/30" : "#fee2e2/50"
            }
          ]}>
            <Text style={[
              s`text-sm uppercase tracking-wider font-black mb-4`,
              { color: isDarkMode ? "#f87171" : "#dc2626" }
            ]}>Important Rules</Text>
            <View style={s`gap-3 pl-2`}>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#ffffff" : "#0f172a" }
              ]}>⚠️ Game ends if blocks stack to the top</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#ffffff" : "#0f172a" }
              ]}>📈 Level increases every 10 rows cleared</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#ffffff" : "#0f172a" }
              ]}>⚡ Blocks fall faster as levels increase</Text>
            </View>
          </View>

          {/* Pro Tips */}
          <View style={[
            s`mb-6 rounded-2xl border p-5`,
            { 
              borderColor: theme.border.primary,
              backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9"
            }
          ]}>
            <Text style={[
              s`text-sm uppercase tracking-wider font-black mb-4`,
              { color: theme.accent.secondary }
            ]}>Pro Tips</Text>
            <View style={s`gap-2 pl-2`}>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>💡 Plan ahead - look at upcoming blocks</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>💡 Don't leave gaps in the middle</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>💡 Clear 4 rows at once for maximum points</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>💡 Use drag down to place blocks quickly</Text>
              <Text style={[
                s`text-sm leading-6`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>💡 Keep building combos for bonus multipliers</Text>
            </View>
          </View>

          {/* Back to Settings Button */}
          <Link href="/settings" asChild>
            <Pressable>
              <View style={[
                s`rounded-2xl border-2 px-6 py-4`,
                {
                  borderColor: theme.accent.primary,
                  backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                }
              ]}>
                <Text style={[
                  s`text-center text-base font-black`,
                  { color: theme.accent.secondary }
                ]}>BACK TO SETTINGS</Text>
              </View>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
