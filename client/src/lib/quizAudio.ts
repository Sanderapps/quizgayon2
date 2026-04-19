type CueName =
  | "answerClick"
  | "confirm"
  | "transition"
  | "success"
  | "start"
  | "share"
  | "tap"
  | "softToggle"
  | "panelOpen"
  | "panelClose"
  | "submit";

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

const ASSET_CUES: Partial<Record<CueName, AssetCueDefinition>> = {};

const TONE_CUES: Partial<Record<CueName, ToneCueDefinition>> = {
  answerClick: {
    cooldownMs: 55,
    steps: [{ duration: 0.032, from: 840, to: 760, gain: 0.011, type: "square" }],
  },
  tap: {
    cooldownMs: 95,
    steps: [{ duration: 0.026, from: 780, to: 700, gain: 0.007, type: "square" }],
  },
  confirm: {
    cooldownMs: 90,
    steps: [
      { duration: 0.028, from: 620, to: 720, gain: 0.009, type: "square" },
      { delay: 0.018, duration: 0.03, from: 760, to: 880, gain: 0.007, type: "square" },
    ],
  },
  start: {
    cooldownMs: 180,
    steps: [
      { duration: 0.03, from: 540, to: 680, gain: 0.008, type: "square" },
      { delay: 0.024, duration: 0.034, from: 720, to: 960, gain: 0.01, type: "square" },
    ],
  },
  transition: {
    cooldownMs: 90,
    steps: [
      { duration: 0.024, from: 460, to: 540, gain: 0.004, type: "triangle" },
      { delay: 0.016, duration: 0.026, from: 600, to: 700, gain: 0.003, type: "square" },
    ],
  },
  success: {
    cooldownMs: 260,
    steps: [
      { duration: 0.04, from: 620, to: 740, gain: 0.007, type: "square" },
      { delay: 0.03, duration: 0.045, from: 820, to: 980, gain: 0.008, type: "square" },
      { delay: 0.062, duration: 0.05, from: 1040, to: 1240, gain: 0.009, type: "square" },
    ],
  },
  submit: {
    cooldownMs: 220,
    steps: [
      { duration: 0.032, from: 600, to: 700, gain: 0.006, type: "square" },
      { delay: 0.022, duration: 0.03, from: 760, to: 860, gain: 0.006, type: "square" },
    ],
  },
  share: {
    cooldownMs: 220,
    steps: [
      { duration: 0.025, from: 700, to: 820, gain: 0.006, type: "square" },
      { delay: 0.018, duration: 0.028, from: 900, to: 1080, gain: 0.007, type: "square" },
    ],
  },
  softToggle: {
    cooldownMs: 110,
    steps: [{ duration: 0.03, from: 520, to: 620, gain: 0.005, type: "square" }],
  },
  panelOpen: {
    cooldownMs: 150,
    steps: [
      { duration: 0.028, from: 380, to: 460, gain: 0.0045, type: "square" },
      { delay: 0.02, duration: 0.03, from: 520, to: 660, gain: 0.0055, type: "square" },
    ],
  },
  panelClose: {
    cooldownMs: 150,
    steps: [
      { duration: 0.026, from: 620, to: 520, gain: 0.0045, type: "square" },
      { delay: 0.014, duration: 0.022, from: 480, to: 380, gain: 0.0035, type: "square" },
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

  private getVolumeScale() {
    if (typeof window === "undefined") return 1;
    const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
    return isCoarsePointer ? 0.78 : 1;
  }

  private playAsset(cueName: CueName, cue: AssetCueDefinition) {
    if (typeof window === "undefined") return;

    const audio = this.getAssetInstance(cue.src);
    audio.volume = cue.volume * this.getVolumeScale();
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

  playTap() {
    this.play("tap");
  }

  playSoftToggle() {
    this.play("softToggle");
  }

  playPanelOpen() {
    this.play("panelOpen");
  }

  playPanelClose() {
    this.play("panelClose");
  }

  playSubmit() {
    this.play("submit");
  }
}

export const quizAudio = new QuizAudioEngine();
