import { Pressable, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import { s } from "react-native-wind";

type ToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  onPress: () => void;
  isDarkMode?: boolean;
};

export function ToggleRow({ label, description, value, onPress, isDarkMode = true }: ToggleRowProps) {
  const togglePosition = useSharedValue(value ? 1 : 0);

  const animatedSwitchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: togglePosition.value * 28 }],
  }));

  const handlePress = () => {
    togglePosition.value = withTiming(value ? 0 : 1, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        s`mb-4 rounded-2xl border-2 px-5 py-4 active:opacity-75`,
        {
          borderColor: value 
            ? (isDarkMode ? "#06b6d4" : "#0284c7")
            : (isDarkMode ? "#475569" : "#cbd5e1"),
          backgroundColor: value
            ? (isDarkMode ? "#164e63" : "#cffafe")
            : (isDarkMode ? "#1e293b" : "#f1f5f9"),
        }
      ]}
    >
      <View style={s`flex-row items-center justify-between mb-3`}>
        <Text style={[
          s`text-base font-black tracking-wide`,
          {
            color: value
              ? (isDarkMode ? "#22d3ee" : "#0284c7")
              : (isDarkMode ? "#cbd5e1" : "#475569"),
          }
        ]}>
          {label}
        </Text>
        <View
          style={[
            s`h-7 w-16 rounded-full border-2 flex-row items-center px-1`,
            {
              backgroundColor: value
                ? (isDarkMode ? "#06b6d4" : "#0284c7")
                : (isDarkMode ? "#334155" : "#e2e8f0"),
              borderColor: value
                ? (isDarkMode ? "#00d9ff" : "#0ea5e9")
                : (isDarkMode ? "#475569" : "#cbd5e1"),
              shadowColor: value ? (isDarkMode ? "#06b6d4" : "#0284c7") : "transparent",
              shadowOpacity: value ? 0.5 : 0,
              shadowRadius: value ? 8 : 0,
            }
          ]}
        >
          <Animated.View
            style={[
              s`h-5 w-5 rounded-full shadow-lg`,
              {
                backgroundColor: isDarkMode ? "#ffffff" : "#020617",
              },
              animatedSwitchStyle,
            ]}
          />
        </View>
      </View>
      <Text style={[
        s`text-sm leading-6 font-medium`,
        {
          color: value
            ? (isDarkMode ? "#a5f3fc" : "#0c4a6e")
            : (isDarkMode ? "#94a3b8" : "#64748b"),
        }
      ]}>
        {description}
      </Text>
    </Pressable>
  );
}
