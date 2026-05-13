import { Ionicons } from '@expo/vector-icons';
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { s } from "react-native-wind";
import { STARTING_LIVES } from "../../lib/game/constants";
import type { Gravity, Level } from "../../lib/game/types";

type GameHUDProps = {
  level: Level;
  gravity: Gravity;
  score: number;
  combo: number;
  lives: number;
  sector: number;
  clearedLevels: number;
  bestScore: number;
  tapCount: number;
  lastHint: string;
  statusText: string;
};

export function GameHUD({ 
  level, 
  gravity, 
  score, 
  combo, 
  lives, 
  sector,
  bestScore, 
  tapCount, 
  lastHint,
  statusText
}: GameHUDProps) {
  const HUD_LABELS: Record<Gravity, string> = { 
    down: "SOUTH", 
    left: "WEST", 
    up: "NORTH", 
    right: "EAST" 
  };
  
  const lifeDots = Array.from({ length: STARTING_LIVES }, (_, i) => i < lives);
  
  // Status text animations
  const statusOpacity = useSharedValue(1);
  const statusScale = useSharedValue(1);
  const statusY = useSharedValue(0);
  
  // Combo animation
  const comboScale = useSharedValue(1);
  
  // Score animation
  const scoreOpacity = useSharedValue(1);
  
  useEffect(() => {
    // Status text animation
    statusOpacity.value = 0;
    statusScale.value = 0.9;
    statusY.value = -8;
    
    statusOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    statusScale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.2)) });
    statusY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [statusText, statusOpacity, statusScale, statusY]);
  
  useEffect(() => {
    // Combo bounce animation
    comboScale.value = 1.2;
    comboScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.3)) });
  }, [combo, comboScale]);
  
  useEffect(() => {
    // Score pulse animation
    scoreOpacity.value = 1.2;
    scoreOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [score, scoreOpacity]);
  
  const statusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
    transform: [
      { scale: statusScale.value },
      { translateY: statusY.value }
    ],
  }));

  const comboAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: comboScale.value }],
  }));
  
  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    opacity: Math.min(scoreOpacity.value, 1),
  }));

  const AnimatedView = Animated.createAnimatedComponent(View);
  const AnimatedText = Animated.createAnimatedComponent(Text);

  return (
    <View>
      {/* Level Title & Status */}
      <View style={s`mb-2 items-center`}>
        <Text style={s`text-[10px] uppercase tracking-[2px] text-cyan-400 font-bold`}>
          {level.name}
        </Text>
        {/* Animated Status Text */}
        <AnimatedView style={[s`mt-1 items-center`, statusAnimatedStyle]}>
          <Text style={s`text-center text-xs font-black text-white leading-5`}>
            {statusText}
          </Text>
          {lives === 0 && (
            <Text style={s`mt-1 text-xs text-red-400 font-black tracking-wider`}>
              ⚠️ LIVES DEPLETED
            </Text>
          )}
          {lives > 0 && statusText.includes('FELL OFF') && (
            <Text style={[s`mt-1 text-[10px] font-bold`, { color: lives === 1 ? '#f97316' : '#22d3ee' }]}> 
              {lives} {lives === 1 ? 'life' : 'lives'} remaining
            </Text>
          )}
        </AnimatedView>
        {/* Hint Text */}
        <Text style={s`mt-1 text-center text-[10px] text-slate-400 font-medium italic`}>
          {lastHint}
        </Text>
      </View>

      {/* Primary Stats */}
      <View style={s`mb-2 flex-row gap-1`}>
        <View style={s`flex-1 rounded border border-slate-700 bg-slate-800/80 px-1 py-1`}>
          <Text style={s`text-[8px] uppercase tracking-[1px] text-slate-400 font-bold`}>
            GRAVITY
          </Text>
          <Text style={s`mt-0.5 text-xs font-black text-cyan-400`}>
            {HUD_LABELS[gravity]}
          </Text>
        </View>
        <View style={s`flex-1 rounded border border-slate-700 bg-slate-800/80 px-1 py-1`}>
          <Text style={s`text-[8px] uppercase tracking-[1px] text-slate-400 font-bold`}>
            SCORE
          </Text>
          <AnimatedText style={[s`mt-0.5 text-xs font-black text-emerald-400`, scoreAnimatedStyle]}>
            {score}
          </AnimatedText>
        </View>
        <View style={s`flex-1 rounded border border-slate-700 bg-slate-800/80 px-1 py-1`}>
          <Text style={s`text-[8px] uppercase tracking-[1px] text-slate-400 font-bold`}>
            COMBO
          </Text>
          <AnimatedText style={[s`mt-0.5 text-xs font-black text-amber-400`, comboAnimatedStyle]}>
            x{combo + 1}
          </AnimatedText>
        </View>
      </View>

      {/* Lives Indicator - Heart Icons */}
      <View style={s`mb-2 items-center`}>
        <Text style={s`mb-1 text-[8px] uppercase tracking-[1px] text-slate-400 font-bold`}>
          LIVES
        </Text>
        <View style={s`flex-row gap-0.5`}>
          {lifeDots.map((alive, i) => (
            <Ionicons
              key={i}
              name={alive ? 'heart' : 'heart-outline'}
              size={14}
              color={alive ? '#f43f5e' : '#334155'}
              style={{ marginHorizontal: 1, opacity: alive ? 1 : 0.5, transform: [{ scale: alive ? 1.08 : 1 }] }}
            />
          ))}
        </View>
      </View>

      {/* Secondary Stats */}
      <View style={s`rounded border border-slate-700 bg-slate-800/50 px-1 py-1`}>
        <View style={s`flex-row justify-between items-center`}> 
          <View>
            <Text style={s`text-[7px] uppercase tracking-[0.5px] text-slate-500 font-bold`}>
              BEST
            </Text>
            <Text style={s`mt-0.5 text-sm font-black text-cyan-300`}>
              {bestScore}
            </Text>
          </View>
          <View>
            <Text style={s`text-[9px] uppercase tracking-[1px] text-slate-500 font-bold`}>
              SECTOR
            </Text>
            <Text style={s`mt-0.5 text-sm font-black text-white`}>
              {sector}
            </Text>
          </View>
          <View>
            <Text style={s`text-[9px] uppercase tracking-[1px] text-slate-500 font-bold`}>
              TAPS
            </Text>
            <Text style={s`mt-0.5 text-sm font-black text-slate-300`}>
              {tapCount}
            </Text>
          </View>
          <View>
            <Text style={s`text-[9px] uppercase tracking-[1px] text-slate-500 font-bold`}>
              SEED
            </Text>
            <Text style={s`mt-0.5 text-xs font-bold text-slate-400`}>
              {level.seed}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
