import { useEffect } from 'react';

/**
 * Typewriter-mode scroll behavior (M3.T3.5).
 *
 * When `enabled`, on every caret change we scroll the textarea so the
 * caret line sits near the vertical middle (40% from the top — slightly
 * above true center reads better when the user looks down at what they
 * just typed).
 *
 * Pure DOM math: count `\n` up to the caret to get a 1-based line index,
 * multiply by the computed lineHeight, subtract 40% of the visible
 * client height, and set `scrollTop`. Cheaper than DOM measurement on
 * every keystroke and accurate enough at the px level.
 */
interface Opts {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  body: string;
  selectionStart: number;
  enabled: boolean;
}

export function useTypewriterScroll({ textareaRef, body, selectionStart, enabled }: Opts): void {
  useEffect(() => {
    if (!enabled) return;
    const el = textareaRef.current;
    if (!el) return;
    const beforeCaret = body.slice(0, selectionStart);
    const lineIdx = beforeCaret.split('\n').length - 1;
    const style = window.getComputedStyle(el);
    const lh = parseLineHeight(style);
    const desiredTop = lineIdx * lh - el.clientHeight * 0.4;
    el.scrollTop = Math.max(0, desiredTop);
  }, [enabled, body, selectionStart, textareaRef]);
}

function parseLineHeight(style: CSSStyleDeclaration): number {
  // `normal` resolves to ~1.2 * font-size; numerical lineHeight is in px
  // in computed styles because we set line-height via inline style on
  // the textarea (number form like 1.7 may come through unitless on some
  // browsers, so handle both).
  const raw = style.lineHeight;
  if (raw === 'normal') {
    const fs = parseFloat(style.fontSize) || 16;
    return fs * 1.2;
  }
  const n = parseFloat(raw);
  if (Number.isFinite(n)) {
    if (raw.endsWith('px')) return n;
    // Unitless number → multiplier on font-size.
    const fs = parseFloat(style.fontSize) || 16;
    return fs * n;
  }
  return 24;
}
