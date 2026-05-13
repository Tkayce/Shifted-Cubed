import { memo } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { s } from "react-native-wind";

import { BOARD_PIXEL_SIZE, CUBE_COLORS, CUBE_SIZE, TILE_GAP, TILE_SIZE } from "../../lib/game/constants";
import type { Cell, Level } from "../../lib/game/types";
import { getCellOffset, keyForCell } from "../../lib/game/utils";

const BOARD_FRAME_SIZE = BOARD_PIXEL_SIZE + 48;
const NUMBERED_CUBE_SIZE = 28;

const BOARD_CONTAINER_STYLE = {
  width: BOARD_FRAME_SIZE,
  height: BOARD_FRAME_SIZE,
  shadowColor: "#06b6d4",
  shadowOpacity: 0.35,
  shadowRadius: 18,
} as const;

const PLATFORM_STYLE = {
  width: TILE_SIZE,
  height: TILE_SIZE,
  transform: [{ rotate: "45deg" as const }],
} as const;

const CUBE_STYLE = {
  width: CUBE_SIZE,
  height: CUBE_SIZE,
  shadowColor: "#e879f9",
  shadowOpacity: 0.4,
  shadowRadius: 12,
} as const;

type GameBoardProps = {
  level: Level;
  cubeCell: Cell;
  nextCubeNumber: number;
  collectedCount: number;
  worldAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  cubeAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
};

const AnimatedView = Animated.createAnimatedComponent(View);

// Memoize platform rendering for better performance
const Platform = memo(({ 
  platform, 
  isScenic, 
}: { 
  platform: Cell; 
  isScenic: boolean;
}) => {
  return (
    <View
      key={keyForCell(platform)}
      accessible={false}
      style={[
        s`absolute rounded-2xl border-2`,
        {
          left: platform.col * (TILE_SIZE + TILE_GAP),
          top: platform.row * (TILE_SIZE + TILE_GAP),
          borderColor: isScenic ? "rgba(34,211,238,0.6)" : "rgba(103,232,249,0.3)",
          backgroundColor: isScenic ? "rgba(103,232,249,0.9)" : "rgba(125,211,252,0.8)",
          shadowColor: "#06b6d4",
          shadowOpacity: isScenic ? 0.5 : 0.2,
          shadowRadius: isScenic ? 12 : 8,
        },
        PLATFORM_STYLE,
      ]}
    >
      {/* Inner platform surface */}
      <View
        style={[
          s`absolute inset-[4px] rounded-xl`,
          {
            backgroundColor: isScenic ? "rgba(103,232,249,0.9)" : "rgba(125,211,252,0.8)",
          },
        ]}
      />
    </View>
  );
});

Platform.displayName = "Platform";

// Numbered cube component with sequence indicator
const NumberedCube = memo(({
  cube,
  isNext,
  isCollected,
}: {
  cube: { number: number; cell: Cell };
  isNext: boolean;
  isCollected: boolean;
}) => {
  const pulse = useSharedValue(1);
  
  if (isNext && !isCollected) {
    pulse.value = withRepeat(
      withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }

  const cubeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: isCollected ? 0.3 : 1,
  }));

  const colorData = CUBE_COLORS[cube.number] || CUBE_COLORS[1];
  const offset = getCellOffset(cube.cell);

  return (
    <Animated.View
      key={`cube-${cube.number}`}
      style={[
        s`absolute items-center justify-center rounded-lg border-2`,
        {
          left: offset.x - NUMBERED_CUBE_SIZE / 2,
          top: offset.y - NUMBERED_CUBE_SIZE / 2,
          width: NUMBERED_CUBE_SIZE,
          height: NUMBERED_CUBE_SIZE,
          borderColor: isCollected ? `${colorData.hex}50` : colorData.hex,
          backgroundColor: isCollected ? `${colorData.hex}30` : colorData.hex,
          shadowColor: colorData.hex,
          shadowOpacity: isNext && !isCollected ? 0.8 : 0.4,
          shadowRadius: isNext && !isCollected ? 16 : 8,
        },
        cubeAnimStyle,
      ]}
    >
      <Text style={[
        s`font-black text-white`,
        {
          fontSize: 14,
          textShadowColor: "rgba(0, 0, 0, 0.7)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
      ]}>
        {cube.number}
      </Text>

      {/* Pulsing ring for next cube */}
      {isNext && !isCollected && (
        <Animated.View
          style={[
            s`absolute rounded-full border-2`,
            {
              width: NUMBERED_CUBE_SIZE + 12,
              height: NUMBERED_CUBE_SIZE + 12,
              borderColor: colorData.hex,
              opacity: 0.5,
            },
            cubeAnimStyle,
          ]}
        />
      )}
    </Animated.View>
  );
});

NumberedCube.displayName = "NumberedCube";

export const GameBoard = memo(function GameBoard({
  level,
  cubeCell,
  nextCubeNumber,
  collectedCount,
  worldAnimatedStyle,
  cubeAnimatedStyle,
}: GameBoardProps) {
  return (
    <View style={s`items-center justify-center`}>
      {/* Board Container */}
      <View
        style={[
          s`items-center justify-center rounded-3xl border-2 border-cyan-500 bg-slate-950 p-5`,
          BOARD_CONTAINER_STYLE,
        ]}
      >
        {/* Rotating World Container */}
        <AnimatedView
          accessible={false}
          style={[
            s`relative items-center justify-center`,
            worldAnimatedStyle,
            { width: BOARD_PIXEL_SIZE, height: BOARD_PIXEL_SIZE },
          ]}
        >
          {/* Render all platforms */}
          {level.platforms.map((platform) => {
            const isScenic = level.scenicCells.some(
              (cell) => cell.col === platform.col && cell.row === platform.row
            );
            return (
              <Platform
                key={keyForCell(platform)}
                platform={platform}
                isScenic={isScenic}
              />
            );
          })}

          {/* Render numbered cubes */}
          {level.cubes.map((cube) => (
            <NumberedCube
              key={`numbered-cube-${cube.number}`}
              cube={cube}
              isNext={cube.number === nextCubeNumber}
              isCollected={cube.collected}
            />
          ))}

          {/* Player Cube */}
          <AnimatedView
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Player cube at column ${cubeCell.col + 1}, row ${cubeCell.row + 1}`}
            style={[
              s`absolute items-center justify-center rounded-xl border-2 border-fuchsia-300 bg-fuchsia-500`,
              cubeAnimatedStyle,
              CUBE_STYLE,
            ]}
          >
            {/* Cube highlight */}
            <View style={s`h-2.5 w-2.5 rounded-full bg-white/95`} />
            {/* Cube shadow */}
            <View style={s`absolute bottom-[4px] left-[4px] right-[4px] h-[6px] rounded-full bg-fuchsia-300/70`} />
          </AnimatedView>
        </AnimatedView>

        {/* Collection Status Indicator */}
        <View style={s`mt-4 flex-row items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 border border-cyan-500/30`}>
          <Text style={s`text-xs font-black text-cyan-400 tracking-wide`}>
            COLLECTED: {collectedCount}/{level.cubes.length}
          </Text>
        </View>
      </View>
    </View>
  );
});
