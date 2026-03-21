"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "./MutationContext";

// ---------------------------------------------------------------------------
// SoundEngine – ambient audio driven by corruption & totalMutations
// ---------------------------------------------------------------------------

export default function SoundEngine() {
  const { corruption, totalMutations } = useMutation();

  // Refs that persist across renders
  const ctxRef = useRef<AudioContext | null>(null);
  const initedRef = useRef(false);

  // Drone oscillators & gains
  const drone1Ref = useRef<OscillatorNode | null>(null);
  const drone1GainRef = useRef<GainNode | null>(null);
  const drone2Ref = useRef<OscillatorNode | null>(null);
  const drone2GainRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  // Extra drones for high corruption
  const drone3Ref = useRef<OscillatorNode | null>(null);
  const drone3GainRef = useRef<GainNode | null>(null);
  const drone4Ref = useRef<OscillatorNode | null>(null);
  const drone4GainRef = useRef<GainNode | null>(null);

  // Noise layer
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const noiseFilterRef = useRef<BiquadFilterNode | null>(null);

  // High-freq crackle layer
  const crackleSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const crackleGainRef = useRef<GainNode | null>(null);
  const crackleFilterRef = useRef<BiquadFilterNode | null>(null);

  // Master gain
  const masterGainRef = useRef<GainNode | null>(null);

  // Track corruption in a ref so glitch callback can read latest value
  const corruptionRef = useRef(corruption);
  useEffect(() => {
    corruptionRef.current = corruption;
  }, [corruption]);

  // -----------------------------------------------------------------------
  // Create a looping white-noise buffer source
  // -----------------------------------------------------------------------
  const createNoiseSource = useCallback((ctx: AudioContext): AudioBufferSourceNode => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }, []);

  // -----------------------------------------------------------------------
  // Initialize audio graph (called once on first user click)
  // -----------------------------------------------------------------------
  const initAudio = useCallback(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const now = ctx.currentTime;

    // Master gain – keeps overall volume sane
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.35, now);
    master.connect(ctx.destination);
    masterGainRef.current = master;

    // --- Drone 1: primary low sine ---
    const d1 = ctx.createOscillator();
    d1.type = "sine";
    d1.frequency.setValueAtTime(48, now);
    const d1g = ctx.createGain();
    d1g.gain.setValueAtTime(0, now);
    d1.connect(d1g).connect(master);
    d1.start();
    drone1Ref.current = d1;
    drone1GainRef.current = d1g;

    // --- Drone 2: second sine for LFO modulation layer ---
    const d2 = ctx.createOscillator();
    d2.type = "sine";
    d2.frequency.setValueAtTime(55, now);
    const d2g = ctx.createGain();
    d2g.gain.setValueAtTime(0, now);
    d2.connect(d2g).connect(master);
    d2.start();
    drone2Ref.current = d2;
    drone2GainRef.current = d2g;

    // --- LFO modulating drone2 frequency ---
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.1, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0, now); // depth of modulation in Hz
    lfo.connect(lfoGain).connect(d2.frequency);
    lfo.start();
    lfoRef.current = lfo;
    lfoGainRef.current = lfoGain;

    // --- Drone 3: dissonant mid-low ---
    const d3 = ctx.createOscillator();
    d3.type = "sawtooth";
    d3.frequency.setValueAtTime(73, now);
    const d3g = ctx.createGain();
    d3g.gain.setValueAtTime(0, now);
    d3.connect(d3g).connect(master);
    d3.start();
    drone3Ref.current = d3;
    drone3GainRef.current = d3g;

    // --- Drone 4: higher warble ---
    const d4 = ctx.createOscillator();
    d4.type = "triangle";
    d4.frequency.setValueAtTime(185, now);
    const d4g = ctx.createGain();
    d4g.gain.setValueAtTime(0, now);
    d4.connect(d4g).connect(master);
    d4.start();
    drone4Ref.current = d4;
    drone4GainRef.current = d4g;

    // --- Noise layer (low-mid rumble) ---
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(400, now);
    noiseFilter.Q.setValueAtTime(1, now);
    const noiseSrc = createNoiseSource(ctx);
    noiseSrc.connect(noiseFilter).connect(noiseGain).connect(master);
    noiseSrc.start();
    noiseSourceRef.current = noiseSrc;
    noiseGainRef.current = noiseGain;
    noiseFilterRef.current = noiseFilter;

    // --- Crackle layer (high-freq filtered noise) ---
    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0, now);
    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = "highpass";
    crackleFilter.frequency.setValueAtTime(3000, now);
    crackleFilter.Q.setValueAtTime(2, now);
    const crackleSrc = createNoiseSource(ctx);
    crackleSrc.connect(crackleFilter).connect(crackleGain).connect(master);
    crackleSrc.start();
    crackleSourceRef.current = crackleSrc;
    crackleGainRef.current = crackleGain;
    crackleFilterRef.current = crackleFilter;
  }, [createNoiseSource]);

  // -----------------------------------------------------------------------
  // One-time click listener to init AudioContext
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handler = () => {
      initAudio();
      document.removeEventListener("click", handler);
    };
    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  }, [initAudio]);

  // -----------------------------------------------------------------------
  // Adjust levels based on corruption
  // -----------------------------------------------------------------------
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const ramp = now + 0.3; // smooth 300ms transition
    const c = corruption;

    // --- Drone 1 (primary low sine) ---
    if (drone1GainRef.current) {
      let vol = 0;
      if (c >= 15 && c < 30) {
        // very quiet: 0.02–0.04
        vol = 0.02 + ((c - 15) / 15) * 0.02;
      } else if (c >= 30 && c < 50) {
        vol = 0.04 + ((c - 30) / 20) * 0.03;
      } else if (c >= 50 && c < 70) {
        vol = 0.07 + ((c - 50) / 20) * 0.04;
      } else if (c >= 70 && c < 85) {
        vol = 0.11 + ((c - 70) / 15) * 0.04;
      } else if (c >= 85) {
        vol = 0.15;
      }
      drone1GainRef.current.gain.linearRampToValueAtTime(vol, ramp);
    }

    // --- Drone 2 + LFO (appears at 30+) ---
    if (drone2GainRef.current && lfoGainRef.current) {
      let vol = 0;
      let lfoDepth = 0;
      if (c >= 30 && c < 50) {
        vol = 0.02 + ((c - 30) / 20) * 0.02;
        lfoDepth = 3;
      } else if (c >= 50 && c < 70) {
        vol = 0.04 + ((c - 50) / 20) * 0.03;
        lfoDepth = 6;
      } else if (c >= 70 && c < 85) {
        vol = 0.07 + ((c - 70) / 15) * 0.04;
        lfoDepth = 10;
      } else if (c >= 85) {
        vol = 0.11;
        lfoDepth = 15;
      }
      drone2GainRef.current.gain.linearRampToValueAtTime(vol, ramp);
      lfoGainRef.current.gain.linearRampToValueAtTime(lfoDepth, ramp);
    }

    // --- Drone 3 (dissonant, appears at 50+) ---
    if (drone3GainRef.current) {
      let vol = 0;
      if (c >= 50 && c < 70) {
        vol = 0.015 + ((c - 50) / 20) * 0.02;
      } else if (c >= 70 && c < 85) {
        vol = 0.035 + ((c - 70) / 15) * 0.03;
      } else if (c >= 85) {
        vol = 0.065;
      }
      drone3GainRef.current.gain.linearRampToValueAtTime(vol, ramp);
    }

    // --- Drone 4 (mid warble, appears at 70+) ---
    if (drone4GainRef.current) {
      let vol = 0;
      if (c >= 70 && c < 85) {
        vol = 0.01 + ((c - 70) / 15) * 0.02;
      } else if (c >= 85) {
        vol = 0.04;
      }
      drone4GainRef.current.gain.linearRampToValueAtTime(vol, ramp);
    }

    // --- Noise (faint at 30+, louder as corruption rises) ---
    if (noiseGainRef.current && noiseFilterRef.current) {
      let vol = 0;
      let freq = 400;
      if (c >= 30 && c < 50) {
        vol = 0.005 + ((c - 30) / 20) * 0.005;
      } else if (c >= 50 && c < 70) {
        vol = 0.01 + ((c - 50) / 20) * 0.015;
        freq = 600;
      } else if (c >= 70 && c < 85) {
        vol = 0.025 + ((c - 70) / 15) * 0.02;
        freq = 900;
      } else if (c >= 85) {
        vol = 0.045;
        freq = 1200;
      }
      noiseGainRef.current.gain.linearRampToValueAtTime(vol, ramp);
      noiseFilterRef.current.frequency.linearRampToValueAtTime(freq, ramp);
    }

    // --- Crackle (high-freq, appears at 70+) ---
    if (crackleGainRef.current) {
      let vol = 0;
      if (c >= 70 && c < 85) {
        vol = 0.004 + ((c - 70) / 15) * 0.006;
      } else if (c >= 85) {
        vol = 0.015;
      }
      crackleGainRef.current.gain.linearRampToValueAtTime(vol, ramp);
    }

    // --- At 85+: randomize drone frequencies for chaos ---
    if (c >= 85) {
      if (drone1Ref.current) {
        drone1Ref.current.frequency.linearRampToValueAtTime(
          40 + Math.random() * 25, ramp
        );
      }
      if (drone3Ref.current) {
        drone3Ref.current.frequency.linearRampToValueAtTime(
          60 + Math.random() * 50, ramp
        );
      }
      if (drone4Ref.current) {
        drone4Ref.current.frequency.linearRampToValueAtTime(
          150 + Math.random() * 120, ramp
        );
      }
      if (lfoRef.current) {
        lfoRef.current.frequency.linearRampToValueAtTime(
          0.1 + Math.random() * 2, ramp
        );
      }
    }
  }, [corruption]);

  // -----------------------------------------------------------------------
  // Glitch sounds triggered by totalMutations changes
  // -----------------------------------------------------------------------
  const prevMutationsRef = useRef(totalMutations);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (totalMutations === prevMutationsRef.current) return;
    prevMutationsRef.current = totalMutations;

    const c = corruptionRef.current;
    // No glitch sounds below 50
    if (c < 50) return;

    // Probability: at 50 = 30%, at 70 = 60%, at 85+ = 90%
    let chance = 0.3;
    if (c >= 70 && c < 85) chance = 0.6;
    else if (c >= 85) chance = 0.9;
    if (Math.random() > chance) return;

    const now = ctx.currentTime;
    const master = masterGainRef.current;
    if (!master) return;

    // Pick a random glitch type
    const type = Math.random();

    if (type < 0.4) {
      // --- Frequency sweep oscillator ---
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const duration = 0.05 + Math.random() * 0.15; // 50-200ms
      osc.type = Math.random() > 0.5 ? "sawtooth" : "square";
      const startFreq = 800 + Math.random() * 1500;
      const endFreq = 60 + Math.random() * 100;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
      const glitchVol = 0.03 + (c / 100) * 0.05;
      g.gain.setValueAtTime(glitchVol, now);
      g.gain.linearRampToValueAtTime(0, now + duration);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    } else if (type < 0.7) {
      // --- Filtered noise burst ---
      const bufferSize = Math.floor(ctx.sampleRate * 0.15);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = Math.random() > 0.5 ? "bandpass" : "highpass";
      filter.frequency.setValueAtTime(500 + Math.random() * 3000, now);
      filter.Q.setValueAtTime(5 + Math.random() * 15, now);
      const g = ctx.createGain();
      const glitchVol = 0.02 + (c / 100) * 0.04;
      g.gain.setValueAtTime(glitchVol, now);
      g.gain.linearRampToValueAtTime(0, now + 0.12);
      src.connect(filter).connect(g).connect(master);
      src.start(now);
    } else {
      // --- Bass drop: quick ramp to low freq then silence ---
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
      const glitchVol = 0.05 + (c / 100) * 0.04;
      g.gain.setValueAtTime(glitchVol, now);
      g.gain.setValueAtTime(glitchVol, now + 0.06);
      g.gain.linearRampToValueAtTime(0, now + 0.12);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }, [totalMutations]);

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------
  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      // Stop all oscillators
      [drone1Ref, drone2Ref, lfoRef, drone3Ref, drone4Ref].forEach((ref) => {
        try { ref.current?.stop(); } catch { /* already stopped */ }
      });

      // Stop noise sources
      [noiseSourceRef, crackleSourceRef].forEach((ref) => {
        try { ref.current?.stop(); } catch { /* already stopped */ }
      });

      ctx.close();
      ctxRef.current = null;
      initedRef.current = false;
    };
  }, []);

  // This component renders nothing
  return null;
}
