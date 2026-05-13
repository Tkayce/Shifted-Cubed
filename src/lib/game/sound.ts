import { Audio } from 'expo-av';

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isEnabled: boolean = true;

  async initialize() {
    try {
      // Set audio category
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      // Audio initialization failed, continue without sound
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  async loadSound(name: string, path: string) {
    try {
      if (this.sounds.has(name)) {
        return;
      }
      const { sound } = await Audio.Sound.createAsync(path);
      this.sounds.set(name, sound);
    } catch (error) {
      // Sound loading failed, continue
    }
  }

  async playSound(name: string) {
    if (!this.isEnabled) {
      return;
    }

    try {
      const sound = this.sounds.get(name);
      if (!sound) {
        return;
      }

      // Reset sound to beginning
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      // Playback failed, continue
    }
  }

  async unloadSound(name: string) {
    try {
      const sound = this.sounds.get(name);
      if (sound) {
        await sound.unloadAsync();
        this.sounds.delete(name);
      }
    } catch (error) {
      // Unload failed, continue
    }
  }

  async unloadAll() {
    try {
      for (const [name, sound] of this.sounds) {
        await sound.unloadAsync();
      }
      this.sounds.clear();
    } catch (error) {
      // Unload failed, continue
    }
  }
}

export const soundManager = new SoundManager();
