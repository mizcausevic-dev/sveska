import { useEffect, useRef } from 'react';

/**
 * Typing sounds (M3.T3.5). Plays a short synthesized "click" via WebAudio
 * on every printable / Space / Enter / Backspace key down. No vendored
 * audio files — a 25 ms sine-ramped tone fits the editor's aesthetic and
 * keeps the bundle byte-clean.
 *
 * Per-event throttle (≥ 25 ms between plays) so a held key doesn't blast
 * the speakers. AudioContext is created lazily on the first keystroke to
 * respect the browser autoplay policy (must be triggered by user input).
 *
 * Discriminates three pitches:
 *   - Enter      → ~520 Hz "ding"
 *   - Space      → ~360 Hz "thud"
 *   - Everything → ~440 Hz "click"
 */
interface Opts {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  enabled: boolean;
  volume: number;
}

export function useTypingSounds({ textareaRef, enabled, volume }: Opts): void {
  const ctxRef = useRef<AudioContext | null>(null);
  const lastPlayedAt = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const el = textareaRef.current;
    if (!el) return;

    function play(freq: number): void {
      const now = performance.now();
      if (now - lastPlayedAt.current < 25) return;
      lastPlayedAt.current = now;
      try {
        if (!ctxRef.current) {
          const Ctor: typeof AudioContext | undefined =
            window.AudioContext ??
            (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!Ctor) return;
          ctxRef.current = new Ctor();
        }
        const ctx = ctxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume * 0.18, start + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.06);
      } catch {
        // Audio failures are best-effort; never let them break typing.
      }
    }

    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Enter') return play(520);
      if (e.key === ' ') return play(360);
      // Skip modifier-only / arrow / function keys.
      if (e.key.length !== 1 && e.key !== 'Backspace') return;
      play(440);
    }
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [enabled, volume, textareaRef]);
}
