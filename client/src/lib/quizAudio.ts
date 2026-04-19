type CueName = "answerClick" | "confirm" | "transition" | "success" | "start" | "share";

interface AssetCueDefinition {
  cooldownMs: number;
  src: string;
  volume: number;
  playbackRate?: number;
}

interface ToneStep {
  delay?: number;
  duration: number;
  from: number;
  to: number;
  gain: number;
  type?: OscillatorType;
}

interface ToneCueDefinition {
  cooldownMs: number;
  steps: ToneStep[];
}

const ASSET_CUES: Partial<Record<CueName, AssetCueDefinition>> = {
  answerClick: {
    cooldownMs: 45,
    src: "/sounds/guitar-click.mp3",
    volume: 0.18,
    playbackRate: 1.04,
  },
  confirm: {
    cooldownMs: 70,
    src: "/sounds/guitar-click.mp3",
    volume: 0.14,
    playbackRate: 0.92,
  },
  success: {
    cooldownMs: 260,
    src: "/sounds/guitar-success.mp3",
    volume: 0.22,
    playbackRate: 1,
  },
  start: {
    cooldownMs: 180,
    src: "/sounds/guitar-click.mp3",
    volume: 0.16,
    playbackRate: 0.86,
  },
  share: {
    cooldownMs: 180,
    src: "/sounds/guitar-success.mp3",
    volume: 0.18,
    playbackRate: 1.06,
  },
};

const TONE_CUES: Partial<Record<CueName, ToneCueDefinition>> = {
  transition: {
    cooldownMs: 90,
    steps: [
      { duration: 0.03, from: 420, to: 500, gain: 0.006, type: "triangle" },
      { delay: 0.016, duration: 0.035, from: 590, to: 700, gain: 0.004, type: "sine" },
    ],
  },
};

class QuizAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = true;
  private lastPlayedAt: Partial<Record<CueName, number>> = {};
  private assetPool = new Map<string, HTMLAudioElement[]>();

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  private ensureContext() {
    if (typeof window === "undefined" || !this.enabled) return null;

    if (!this.ctx) {
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextCtor) return null;

      this.ctx = new AudioContextCtor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private scheduleTone(step: ToneStep) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startAt = ctx.currentTime + (step.delay || 0) + 0.004;

    osc.type = step.type || "triangle";
    osc.frequency.setValueAtTime(step.from, startAt);
    osc.frequency.exponentialRampToValueAtTime(step.to, startAt + step.duration);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(step.gain, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + step.duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startAt);
    osc.stop(startAt + step.duration + 0.02);
  }

  private getAssetInstance(src: string) {
    const pool = this.assetPool.get(src) || [];
    const reusable = pool.find((audio) => audio.paused || audio.ended);

    if (reusable) {
      reusable.currentTime = 0;
      return reusable;
    }

    const nextAudio = new Audio(src);
    nextAudio.preload = "auto";
    pool.push(nextAudio);
    this.assetPool.set(src, pool);
    return nextAudio;
  }

  private playAsset(cueName: CueName, cue: AssetCueDefinition) {
    if (typeof window === "undefined") return;

    const audio = this.getAssetInstance(cue.src);
    audio.volume = cue.volume;
    audio.playbackRate = cue.playbackRate || 1;
    audio.currentTime = 0;
    audio.play().catch(() => {
      const fallback = TONE_CUES[cueName];
      fallback?.steps.forEach((step) => this.scheduleTone(step));
    });
  }

  play(cueName: CueName) {
    if (!this.enabled) return;

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const assetCue = ASSET_CUES[cueName];
    const toneCue = TONE_CUES[cueName];
    const cooldownMs = assetCue?.cooldownMs ?? toneCue?.cooldownMs;
    const lastPlayedAt = this.lastPlayedAt[cueName] || 0;

    if (cooldownMs && now - lastPlayedAt < cooldownMs) return;
    this.lastPlayedAt[cueName] = now;

    if (assetCue) {
      this.playAsset(cueName, assetCue);
      return;
    }

    toneCue?.steps.forEach((step) => this.scheduleTone(step));
  }

  playAnswer() {
    this.play("answerClick");
  }

  playConfirm() {
    this.play("confirm");
  }

  playTransition() {
    this.play("transition");
  }

  playSuccess() {
    this.play("success");
  }

  playStart() {
    this.play("start");
  }

  playShare() {
    this.play("share");
  }
}

export const quizAudio = new QuizAudioEngine();
