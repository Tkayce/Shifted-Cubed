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
          s`rounded-3xl border-2 p-8`,
          { 
            borderColor: isDarkMode ? "#475569" : "#cbd5e1",
            backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc",
            shadowColor: isDarkMode ? "#06b6d4" : "#0284c7",
            shadowOpacity: 0.25,
            shadowRadius: 20
          }
        ]}>
          {/* Header */}
          <View style={s`items-center mb-6`}>
            <View style={[
              s`rounded-2xl border-2 p-4 mb-4`,
              { 
                borderColor: isDarkMode ? "#0ea5e9" : "#0284c7",
                backgroundColor: isDarkMode ? "#1f2937" : "#e2e8f0"
              }
            ]}>
              <Ionicons name="cube" size={48} color={theme.accent.secondary} />
            </View>
            <Text style={[
              s`text-xs uppercase tracking-[4px] font-black`,
              { color: isDarkMode ? "#22d3ee" : "#0284c7" }
            ]}>
              CUBE COLLECTOR
            </Text>
            <Text style={[
              s`mt-4 text-4xl font-black leading-tight text-center`,
              { color: isDarkMode ? "#ffffff" : "#0f172a" }
            ]}>
              Collect All Cubes.{"\n"}Master Gravity.
            </Text>
          </View>

          {/* Description */}
          <Text style={[
            s`mt-4 text-base leading-7 text-center font-medium`,
            { color: isDarkMode ? "#cbd5e1" : "#475569" }
          ]}>
            A sequence-based gravity puzzle game. Tap to rotate gravity and guide your cube to collect numbered cubes in order. Can you master all 6 sectors?
          </Text>

          {/* Stats Card */}
          <View style={[
            s`mt-8 rounded-2xl border-2 px-6 py-5`,
            { 
              borderColor: isDarkMode ? "#334155" : "#cbd5e1",
              backgroundColor: isDarkMode ? "#0f172a" : "#f1f5f9"
            }
          ]}>
            <Text style={[
              s`text-xs uppercase tracking-[2px] font-black mb-4`,
              { color: isDarkMode ? "#22d3ee" : "#0284c7" }
            ]}>
              {onboardingSeen ? "YOUR PROGRESS" : "READY TO START"}
            </Text>
            <View style={s`flex-row justify-between items-center mb-3`}>
              <View>
                <Text style={[
                  s`text-xs uppercase tracking-[1px] font-bold`,
                  { color: isDarkMode ? "#cbd5e1" : "#475569" }
                ]}>
                  BEST SCORE
                </Text>
                <Text style={[
                  s`mt-1 text-2xl font-black`,
                  { color: isDarkMode ? "#22d3ee" : "#0284c7" }
                ]}>
                  {progress.bestScore}
                </Text>
              </View>
              <View>
                <Text style={[
                  s`text-xs uppercase tracking-[1px] font-bold`,
                  { color: isDarkMode ? "#cbd5e1" : "#475569" }
                ]}>
                  HIGHEST SECTOR
                </Text>
                <Text style={[
                  s`mt-1 text-2xl font-black`,
                  { color: isDarkMode ? "#10b981" : "#059669" }
                ]}>
                  {progress.highestSector}
                </Text>
              </View>
            </View>
            <View style={[
              s`pt-3 border-t`,
              { borderColor: isDarkMode ? "#334155" : "#e2e8f0" }
            ]}>
              <Text style={[
                s`text-sm leading-6 font-medium`,
                { color: isDarkMode ? "#cbd5e1" : "#475569" }
              ]}>
                {progress.lastSession
                  ? `Last run: Sector ${progress.lastSession.sector} • Score ${progress.lastSession.score}`
                  : "No runs completed yet. Start your first campaign."}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={s`mt-8 gap-3`}>
            <Pressable onPress={handleStartGame}>
              <View style={[
                s`rounded-2xl px-6 py-4 flex-row items-center justify-center gap-2`,
                { 
                  backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                  shadowColor: isDarkMode ? "#06b6d4" : "#0284c7",
                  shadowOpacity: 0.4,
                  shadowRadius: 12
                }
              ]}>
                <Ionicons name="play" size={20} color={isDarkMode ? "#020617" : "#f8fafc"} />
                <Text style={[
                  s`text-lg pl-2 font-black tracking-wide`,
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
                    s`w-full max-w-md rounded-3xl border-2 p-8`,
                    { 
                      borderColor: isDarkMode ? "#0ea5e9" : "#0284c7",
                      backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9"
                    }
                  ]}>
                    {/* Header */}
                    <View style={s`items-center mb-6`}>
                      <Text style={[
                        s`text-3xl font-black text-center`,
                        { color: isDarkMode ? "#ffffff" : "#0f172a" }
                      ]}>How to Play</Text>
                      <Text style={[
                        s`text-xs uppercase tracking-widest font-bold mt-2`,
                        { color: isDarkMode ? "#22d3ee" : "#0284c7" }
                      ]}>Master Cube Collection</Text>
                    </View>

                    {/* Core Mechanics */}
                    <View style={[
                      s`mb-6 rounded-2xl border p-4`,
                      { 
                        borderColor: isDarkMode ? "#0ea5e9" : "#0284c7",
                        backgroundColor: isDarkMode ? "#1f2937/50" : "#e2e8f0/50"
                      }
                    ]}>
                      <Text style={[
                        s`text-sm uppercase tracking-wider font-black mb-3`,
                        { color: isDarkMode ? "#22d3ee" : "#0284c7" }
                      ]}>Core Mechanic</Text>
                      <View style={s`gap-2`}>
                        <View style={s`flex-row items-start gap-3`}>
                          <View style={[
                            s`w-6 h-6 rounded-full items-center justify-center`,
                            { backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7" }
                          ]}>
                            <Text style={[
                              s`text-xs font-black`,
                              { color: isDarkMode ? "#020617" : "#f8fafc" }
                            ]}>1</Text>
                          </View>
                          <View style={s`flex-1`}>
                            <Text style={[
                              s`font-bold text-sm`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>TAP to rotate gravity</Text>
                            <Text style={[
                              s`text-xs mt-1`,
                              { color: isDarkMode ? "#94a3b8" : "#64748b" }
                            ]}>Each tap rotates gravity 90° clockwise</Text>
                          </View>
                        </View>
                        <View style={s`flex-row items-start gap-3`}>
                          <View style={[
                            s`w-6 h-6 rounded-full items-center justify-center`,
                            { backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7" }
                          ]}>
                            <Text style={[
                              s`text-xs font-black`,
                              { color: isDarkMode ? "#020617" : "#f8fafc" }
                            ]}>2</Text>
                          </View>
                          <View style={s`flex-1`}>
                            <Text style={[
                              s`font-bold text-sm`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>CUBE FALLS automatically</Text>
                            <Text style={[
                              s`text-xs mt-1`,
                              { color: isDarkMode ? "#94a3b8" : "#64748b" }
                            ]}>Your cube falls until landing on a platform</Text>
                          </View>
                        </View>
                        <View style={s`flex-row items-start gap-3`}>
                          <View style={[
                            s`w-6 h-6 rounded-full items-center justify-center`,
                            { backgroundColor: isDarkMode ? "#3b82f6" : "#1e40af" }
                          ]}>
                            <Text style={[
                              s`text-xs font-black`,
                              { color: isDarkMode ? "#f0f9ff" : "#f0f9ff" }
                            ]}>1</Text>
                          </View>
                          <View style={s`flex-1`}>
                            <Text style={[
                              s`font-bold text-sm`,
                              { color: isDarkMode ? "#ffffff" : "#0f172a" }
                            ]}>COLLECT blue cube (#1)</Text>
                            <Text style={[
                              s`text-xs mt-1`,
                              { color: isDarkMode ? "#94a3b8" : "#64748b" }
                            ]}>Land on it to collect and progress!</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Important Rules */}
                    <View style={[
                      s`mb-6 rounded-2xl border p-4`,
                      { 
                        borderColor: isDarkMode ? "#f87171" : "#dc2626",
                        backgroundColor: isDarkMode ? "#450a0a/30" : "#fee2e2/50"
                      }
                    ]}>
                      <Text style={[
                        s`text-sm uppercase tracking-wider font-black mb-3`,
                        { color: isDarkMode ? "#f87171" : "#dc2626" }
                      ]}>Collection Sequence</Text>
                      <View style={s`gap-2`}>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={[
                            s`text-lg font-black`,
                            { color: isDarkMode ? "#3b82f6" : "#1e40af" }
                          ]}>1️⃣</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>Collect the <Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#3b82f6" : "#1e40af" }
                          ]}>blue</Text> cube first</Text>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={[
                            s`text-lg font-black`,
                            { color: isDarkMode ? "#10b981" : "#065f46" }
                          ]}>2️⃣</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>Then collect the <Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#10b981" : "#065f46" }
                          ]}>green</Text> cube</Text>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={[
                            s`text-lg font-black`,
                            { color: isDarkMode ? "#f59e0b" : "#92400e" }
                          ]}>3️⃣</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>Finally collect the <Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#f59e0b" : "#92400e" }
                          ]}>orange</Text> cube to complete the level!</Text>
                        </View>
                      </View>
                    </View>

                    {/* Pro Tips */}
                    <View style={[
                      s`mb-6 rounded-2xl border p-4`,
                      { 
                        borderColor: isDarkMode ? "#f87171" : "#dc2626",
                        backgroundColor: isDarkMode ? "#450a0a/30" : "#fee2e2/50"
                      }
                    ]}>
                      <Text style={[
                        s`text-sm uppercase tracking-wider font-black mb-3`,
                        { color: isDarkMode ? "#f87171" : "#dc2626" }
                      ]}>Important Rules</Text>
                      <View style={s`gap-2`}>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={s`text-lg font-black`}>⚠️</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>If the cube falls off the board, you lose a LIFE</Text>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={s`text-lg font-black`}>⚠️</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>Collect cubes out of order and nothing happens</Text>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={s`text-lg font-black`}>⚠️</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}>You have <Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#fca5a5" : "#991b1b" }
                          ]}>3 LIVES</Text> per run</Text>
                        </View>
                      </View>
                    </View>

                    {/* Scoring & Progression */}
                    <View style={[
                      s`mb-6 rounded-2xl border p-4`,
                      { 
                        borderColor: isDarkMode ? "#34d399" : "#10b981",
                        backgroundColor: isDarkMode ? "#064e3b/30" : "#d1fae5/50"
                      }
                    ]}>
                      <Text style={[
                        s`text-sm uppercase tracking-wider font-black mb-3`,
                        { color: isDarkMode ? "#34d399" : "#059669" }
                      ]}>Scoring & Progression</Text>
                      <View style={s`gap-2`}>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#34d399" : "#059669" }
                          ]}>✓</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}><Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#3b82f6" : "#1e40af" }
                          ]}>Cube Collection</Text> = 200+ points + bonuses</Text>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#34d399" : "#059669" }
                          ]}>✓</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}><Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#a5f3fc" : "#164e63" }
                          ]}>Combo</Text> = consecutive moves without falling</Text>
                        </View>
                        <View style={s`flex-row items-start gap-2`}>
                          <Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#34d399" : "#059669" }
                          ]}>✓</Text>
                          <Text style={[
                            s`text-sm flex-1`,
                            { color: isDarkMode ? "#ffffff" : "#0f172a" }
                          ]}><Text style={[
                            s`font-black`,
                            { color: isDarkMode ? "#a5f3fc" : "#164e63" }
                          ]}>CAMPAIGN MODE</Text> has 6 sectors of increasing difficulty</Text>
                        </View>
                      </View>
                    </View>

                    {/* Tips */}
                    <View style={[
                      s`mb-6 rounded-2xl border p-4`,
                      { 
                        borderColor: isDarkMode ? "#38bdf8" : "#0284c7",
                        backgroundColor: isDarkMode ? "#1e3a5f/30" : "#dbeafe/50"
                      }
                    ]}>
                      <Text style={[
                        s`text-sm uppercase tracking-wider font-black mb-3`,
                        { color: isDarkMode ? "#38bdf8" : "#0284c7" }
                      ]}>Pro Tips</Text>
                      <Text style={[
                        s`text-xs leading-5`,
                        { color: isDarkMode ? "#bfdbfe" : "#164e63" }
                      ]}>
                        • Plan your route to collect cubes in order{"\n"}• Build combos for bonus multipliers{"\n"}• Use UNDO if you make a mistake{"\n"}• Clear all 6 sectors for ultimate victory!
                      </Text>
                    </View>

                    {/* Start Button */}
                    <Pressable
                      style={({ pressed }) => [
                        {
                          width: '100%',
                          borderRadius: 12,
                          backgroundColor: isDarkMode ? "#06b6d4" : "#0284c7",
                          paddingVertical: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          opacity: pressed ? 0.8 : 1,
                          shadowColor: isDarkMode ? "#06b6d4" : "#0284c7",
                          shadowOpacity: 0.4,
                          shadowRadius: 8
                        }
                      ]}
                      onPress={handleSkip}
                    >
                      <Ionicons name="play" size={18} color={isDarkMode ? "#020617" : "#f8fafc"} />
                      <Text style={[
                        s`text-base font-black tracking-wide`,
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
