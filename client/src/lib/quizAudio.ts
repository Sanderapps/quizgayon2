type CueName = "answerClick" | "confirm" | "transition" | "success" | "start" | "share";

interface ToneStep {
  delay?: number;
  duration: number;
  from: number;
  to: number;
  gain: number;
  type?: OscillatorType;
}

interface CueDefinition {
  cooldownMs: number;
  steps: ToneStep[];
}

const CUE_LIBRARY: Record<CueName, CueDefinition> = {
  answerClick: {
    cooldownMs: 70,
    steps: [
      { duration: 0.05, from: 680, to: 620, gain: 0.016, type: "triangle" },
      { delay: 0.008, duration: 0.03, from: 1180, to: 980, gain: 0.007, type: "sine" },
    ],
  },
  confirm: {
    cooldownMs: 120,
    steps: [
      { duration: 0.06, from: 520, to: 640, gain: 0.014, type: "sine" },
      { delay: 0.045, duration: 0.05, from: 760, to: 900, gain: 0.011, type: "triangle" },
    ],
  },
  transition: {
    cooldownMs: 150,
    steps: [
      { duration: 0.07, from: 410, to: 520, gain: 0.012, type: "triangle" },
      { delay: 0.035, duration: 0.08, from: 700, to: 820, gain: 0.008, type: "sine" },
    ],
  },
  success: {
    cooldownMs: 350,
    steps: [
      { duration: 0.1, from: 480, to: 610, gain: 0.016, type: "sine" },
      { delay: 0.08, duration: 0.12, from: 720, to: 880, gain: 0.018, type: "triangle" },
      { delay: 0.16, duration: 0.14, from: 920, to: 1180, gain: 0.014, type: "sine" },
    ],
  },
  start: {
    cooldownMs: 220,
    steps: [
      { duration: 0.08, from: 360, to: 480, gain: 0.012, type: "sine" },
      { delay: 0.06, duration: 0.1, from: 540, to: 720, gain: 0.014, type: "triangle" },
    ],
  },
  share: {
    cooldownMs: 220,
    steps: [
      { duration: 0.05, from: 720, to: 860, gain: 0.01, type: "triangle" },
      { delay: 0.04, duration: 0.07, from: 900, to: 1080, gain: 0.012, type: "sine" },
    ],
  },
};

class QuizAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private enabled = true;
  private lastPlayedAt: Partial<Record<CueName, number>> = {};

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
      this.compressor = this.ctx.createDynamicsCompressor();

      this.masterGain.gain.value = 0.7;
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 24;
      this.compressor.ratio.value = 8;
      this.compressor.attack.value = 0.002;
      this.compressor.release.value = 0.12;

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
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
    const filter = ctx.createBiquadFilter();
    const startAt = ctx.currentTime + (step.delay || 0) + 0.005;
    const duration = step.duration;

    osc.type = step.type || "triangle";
    osc.frequency.setValueAtTime(step.from, startAt);
    osc.frequency.exponentialRampToValueAtTime(step.to, startAt + duration);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4200, startAt);
    filter.Q.value = 0.4;

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(step.gain, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  play(cueName: CueName) {
    const cue = CUE_LIBRARY[cueName];
    if (!cue) return;

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const lastPlayedAt = this.lastPlayedAt[cueName] || 0;
    if (now - lastPlayedAt < cue.cooldownMs) return;

    this.lastPlayedAt[cueName] = now;
    cue.steps.forEach((step) => this.scheduleTone(step));
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
