import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { s } from "react-native-wind";
import { useAppState } from "../lib/game/AppProvider";
import { getScreenClasses, getTheme } from "../lib/game/theme";

export default function WelcomeScreen() {
  const { progress, onboardingSeen, markOnboardingSeen, settings } = useAppState();
  const isDarkMode = settings.darkModeEnabled;
  const screenBg = getScreenClasses(isDarkMode);
  const theme = getTheme(isDarkMode);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  const handleStartGame = () => {
    setShowOnboarding(true);
  };

  const handleSkip = () => {
    markOnboardingSeen();
    setShowOnboarding(false);
    router.push("/game");
  };

  return (
    <SafeAreaView style={s`flex-1 ${screenBg}`}>
      <ScrollView
        style={s`flex-1`}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: 24,
          paddingBottom: 32,
          paddingHorizontal: 20
        }}
        showsVerticalScrollIndicator={false}
      >
      <View style={s`max-w-2xl mx-auto w-full`}>
        {/* Main Card */}
        <View style={[
          s`rounded-3xl border-2 p-6`,
          { 
            borderColor: isDarkMode ? "#475569" : "#cbd5e1",
            backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc",
            shadowColor: isDarkMode ? "#06b6d4" : "#0284c7",
            shadowOpacity: 0.25,
            shadowRadius: 20
          }
        ]}>
          {/* Header */}
          <View style={s`items-center mb-4`}>
            <View style={[
              s`rounded-2xl border-2 p-3 mb-3`,
              { 
                borderColor: theme.border.primary,
                backgroundColor: isDarkMode ? "#1f2937" : "#e2e8f0"
              }
            ]}>
              <Ionicons name="grid" size={36} color={theme.accent.secondary} />
            </View>
            <Text style={[
              s`text-[10px] uppercase tracking-[3px] font-black`,
              { color: theme.accent.secondary }
            ]}>
              Shifted-Cubed
            </Text>
            <Text style={[
              s`mt-3 text-3xl font-black leading-tight text-center`,
              { color: isDarkMode ? "#ffffff" : "#0f172a" }
            ]}>
              Stack Blocks.{"\n"}Clear Rows. Win.
            </Text>
          </View>

          {/* Description */}
          <Text style={[
            s`mt-3 text-sm leading-6 text-center font-medium`,
            { color: isDarkMode ? "#cbd5e1" : "#475569" }
          ]}>
            A fast-paced block stacking game. Drag falling blocks to build rows, clear them for points, and climb the levels. How high can you score?
          </Text>

          {/* Stats Card */}
          <View style={[
            s`mt-6 rounded-2xl border-2 px-5 py-4`,
            { 
              borderColor: isDarkMode ? "#334155" : "#cbd5e1",
              backgroundColor: isDarkMode ? "#0f172a" : "#f1f5f9"
            }
          ]}>
            <Text style={[
              s`text-[10px] uppercase tracking-[2px] font-black mb-3`,
              { color: isDarkMode ? "#22d3ee" : "#0284c7" }
            ]}>
              {onboardingSeen ? "YOUR PROGRESS" : "READY TO START"}
            </Text>
            <View style={s`flex-row justify-between items-center mb-2`}>
              <View>
                <Text style={[
                  s`text-[10px] uppercase tracking-[1px] font-bold`,
                  { color: isDarkMode ? "#cbd5e1" : "#475569" }
                ]}>
                  BEST SCORE
                </Text>
                <Text style={[
                  s`mt-1 text-xl font-black`,
                  { color: theme.accent.secondary }
                ]}>
                  {progress.bestScore}
                </Text>
              </View>
              <View>
                <Text style={[
                  s`text-[10px] uppercase tracking-[1px] font-bold`,
                  { color: isDarkMode ? "#cbd5e1" : "#475569" }
                ]}>
                  HIGHEST LEVEL
                </Text>
                <Text style={[
                  s`mt-1 text-xl font-black`,
                  { color: isDarkMode ? "#10b981" : "#059669" }
                ]}>
                  {progress.highestSector}
                </Text>
              </View>
            </View>
            <View style={[
              s`pt-2 border-t`,
              { borderColor: isDarkMode ? "#334155" : "#e2e8f0" }
            ]}>
              <Text style={[
                s`text-xs leading-5 font-medium`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>
                {progress.lastSession
                  ? `Last run: Level ${progress.lastSession.sector} • Score ${progress.lastSession.score}`
                  : "No runs completed yet. Start your first game."}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={s`mt-6 gap-2.5`}>
            <Pressable onPress={handleStartGame}>
              <View style={[
                s`rounded-2xl px-5 py-3 flex-row items-center justify-center gap-2`,
                { 
                  backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                  shadowColor: isDarkMode ? "#06b6d4" : "#0284c7",
                  shadowOpacity: 0.4,
                  shadowRadius: 12
                }
              ]}>
                <Ionicons name="play" size={18} color={isDarkMode ? "#020617" : "#f8fafc"} />
                <Text style={[
                  s`text-base pl-1 font-black tracking-wide`,
                  { color: isDarkMode ? "#020617" : "#f8fafc" }
                ]}>
                  START GAME
                </Text>
              </View>
            </Pressable>
            {/* Onboarding Modal */}
            <Modal
              visible={showOnboarding}
              animationType="fade"
              transparent={false}
            >
              <SafeAreaView style={[
                s`flex-1 justify-center items-center px-4`,
                { backgroundColor: isDarkMode ? "#000000e6" : "#f8fafc" }
              ]}>
                <ScrollView contentContainerStyle={s`flex-grow justify-center items-center pb-12`}>
                  <View style={[
                    s`w-full max-w-md rounded-3xl border-2 p-6`,
                    { 
                      borderColor: isDarkMode ? "#0ea5e9" : "#0284c7",
                      backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9"
                    }
                  ]}>
                    {/* Header */}
                    <View style={s`items-center mb-5`}>
                      <Text style={[
                        s`text-2xl font-black text-center`,
                        { color: isDarkMode ? "#ffffff" : "#0f172a" }
                      ]}>How to Play</Text>
                      <Text style={[
                        s`text-[10px] uppercase tracking-widest font-bold mt-2`,
                        { color: theme.accent.secondary }
                      ]}>Block Stacking Mechanics</Text>
                    </View>

                    {/* Best Score Stats */}
                    <View style={[
                      s`mb-5 rounded-2xl border-2 px-4 py-3`,
                      { 
                        borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                        backgroundColor: isDarkMode ? "#0f172a" : "#f1f5f9"
                      }
                    ]}>
                      <Text style={[
                        s`text-[10px] uppercase tracking-[2px] font-black mb-3`,
                        { color: isDarkMode ? "#22d3ee" : "#0284c7" }
                      ]}>YOUR BEST</Text>
                      <View style={s`flex-row justify-around items-center`}>
                        <View style={s`items-center`}>
                          <Text style={[
                            s`text-[10px] uppercase tracking-[1px] font-bold`,
                            { color: isDarkMode ? "#cbd5e1" : "#475569" }
                          ]}>BEST SCORE</Text>
                          <Text style={[
                            s`mt-1 text-xl font-black`,
                            { color: theme.accent.secondary }
                          ]}>{progress.bestScore}</Text>
                        </View>
                        <View style={s`items-center`}>
                          <Text style={[
                            s`text-[10px] uppercase tracking-[1px] font-bold`,
                            { color: isDarkMode ? "#cbd5e1" : "#475569" }
                          ]}>LEVEL</Text>
                          <Text style={[
                            s`mt-1 text-xl font-black`,
                            { color: isDarkMode ? "#10b981" : "#059669" }
                          ]}>{progress.highestSector}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Core Mechanics */}
                    <View style={[
                      s`mb-4 rounded-2xl border p-3`,
                      { 
                        borderColor: theme.border.primary,
                        backgroundColor: isDarkMode ? "#1f2937/50" : "#e2e8f0/50"
                      }
                    ]}>
                      <Text style={[
                        s`text-xs uppercase tracking-wider font-black mb-2`,
                        { color: theme.accent.secondary }
                      ]}>How It Works</Text>
                      <View style={s`gap-2 pl-2`}>
                        <View style={s`flex-row items-start gap-2`}>
                          <View style={[
                            s`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`,
                            { backgroundColor: theme.accent.primary }
                          ]} />
                          <View style={s`flex-1`}>
                            <Text style={[
                              s`font-bold text-xs leading-5`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>Blocks fall from the top</Text>
                            <Text style={[
                              s`text-[10px] mt-0.5 leading-4`,
                              { color: isDarkMode ? "#94a3b8" : "#64748b" }
                            ]}>Different shaped blocks drop automatically</Text>
                          </View>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <View style={[
                            s`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`,
                            { backgroundColor: theme.accent.primary }
                          ]} />
                          <View style={s`flex-1`}>
                            <Text style={[
                              s`font-bold text-xs leading-5`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>Drag left or right to move</Text>
                            <Text style={[
                              s`text-[10px] mt-0.5 leading-4`,
                              { color: isDarkMode ? "#94a3b8" : "#64748b" }
                            ]}>Swipe horizontally to position blocks</Text>
                          </View>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <View style={[
                            s`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`,
                            { backgroundColor: theme.accent.primary }
                          ]} />
                          <View style={s`flex-1`}>
                            <Text style={[
                              s`font-bold text-xs leading-5`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>Drag down to drop faster</Text>
                            <Text style={[
                              s`text-[10px] mt-0.5 leading-4`,
                              { color: isDarkMode ? "#94a3b8" : "#64748b" }
                            ]}>Swipe down to make blocks fall quicker</Text>
                          </View>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <View style={[
                            s`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`,
                            { backgroundColor: theme.accent.primary }
                          ]} />
                          <View style={s`flex-1`}>
                            <Text style={[
                              s`font-bold text-xs leading-5`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>Press Rotate button</Text>
                            <Text style={[
                              s`text-[10px] mt-0.5 leading-4`,
                              { color: isDarkMode ? "#94a3b8" : "#64748b" }
                            ]}>Rotate blocks to fit them into gaps</Text>
                          </View>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <View style={[
                            s`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`,
                            { backgroundColor: theme.accent.primary }
                          ]} />
                          <View style={s`flex-1`}>
                            <Text style={[
                              s`font-bold text-xs leading-5`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>Clear rows to score points</Text>
                            <Text style={[
                              s`text-[10px] mt-0.5 leading-4`,
                              { color: isDarkMode ? "#94a3b8" : "#64748b" }
                            ]}>Complete horizontal rows disappear</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Important Rules */}
                    <View style={[
                      s`mb-4 rounded-2xl border p-3`,
                      { 
                        borderColor: isDarkMode ? "#f87171" : "#dc2626",
                        backgroundColor: isDarkMode ? "#450a0a/30" : "#fee2e2/50"
                      }
                    ]}>
                      <Text style={[
                        s`text-xs uppercase tracking-wider font-black mb-2`,
                        { color: isDarkMode ? "#f87171" : "#dc2626" }
                      ]}>Important Rules</Text>
                      <View style={s`gap-2 pl-2`}>
                        <View style={s`flex-row items-start gap-2`}>
                          <View style={[
                            s`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`,
                            { backgroundColor: isDarkMode ? "#ef4444" : "#dc2626" }
                          ]} />
                          <Text style={[
                            s`text-xs flex-1 leading-5`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>If blocks stack to the top, the game ends</Text>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <View style={[
                            s`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`,
                            { backgroundColor: isDarkMode ? "#10b981" : "#059669" }
                          ]} />
                          <Text style={[
                            s`text-xs flex-1 leading-5`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>Clear multiple rows for combo bonuses</Text>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <View style={[
                            s`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`,
                            { backgroundColor: isDarkMode ? "#a855f7" : "#7e22ce" }
                          ]} />
                          <Text style={[
                            s`text-xs flex-1 leading-5`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>Level increases every 10 rows cleared</Text>
                        </View>
                      </View>
                    </View>

                    {/* Tips */}
                    <View style={[
                      s`mb-4 rounded-2xl border p-3`,
                      { 
                        borderColor: theme.border.primary,
                        backgroundColor: isDarkMode ? "#1f2937/50" : "#e2e8f0/50"
                      }
                    ]}>
                      <Text style={[
                        s`text-xs uppercase tracking-wider font-black mb-2`,
                        { color: theme.accent.secondary }
                      ]}>Pro Tips</Text>
                      <Text style={[
                        s`text-[10px] leading-4 pl-2`,
                        { color: isDarkMode ? "#cbd5e1" : "#475569" }
                      ]}>
                        • Move blocks quickly to position them precisely{"\n"}• Use the Rotate button to change orientation{"\n"}• Clear 4 rows at once for maximum points{"\n"}• Build combos by clearing rows consecutively{"\n"}• Speed increases with level progression
                      </Text>
                    </View>

                    {/* Start Button */}
                    <Pressable
                      style={({ pressed }) => [
                        {
                          width: '100%',
                          borderRadius: 12,
                          backgroundColor: theme.accent.primary,
                          paddingVertical: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          opacity: pressed ? 0.8 : 1,
                          shadowColor: theme.accent.primary,
                          shadowOpacity: 0.4,
                          shadowRadius: 8
                        }
                      ]}
                      onPress={handleSkip}
                    >
                      <Ionicons name="play" size={16} color={isDarkMode ? "#020617" : "#f8fafc"} />
                      <Text style={[
                        s`text-sm font-black tracking-wide`,
                        { color: isDarkMode ? "#020617" : "#f8fafc" }
                      ]}>LET'S PLAY</Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </Modal>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
