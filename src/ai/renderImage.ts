import { type ImageSpec } from './imageSpec';

/**
 * Render an ImageSpec onto a Canvas at OG-card dimensions (1200×630)
 * and return a PNG Blob. Server-free, deterministic from the spec.
 */
const WIDTH = 1200;
const HEIGHT = 630;

const BG = '#0c0c0e';
const SURFACE = '#161619';
const TEXT = '#f4efe6';
const DIM = '#b8b2a6';
const BORDER = '#2a2a30';

const FONT_DISPLAY = "700 56px 'Bricolage Grotesque', Georgia, serif";
const FONT_TITLE = "600 32px 'Bricolage Grotesque', Georgia, serif";
const FONT_BODY = '400 22px ui-sans-serif, system-ui, sans-serif';
const FONT_MONO = '600 18px ui-monospace, monospace';

export function renderImageToCanvas(spec: ImageSpec, canvas: HTMLCanvasElement): void {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background card on the page bg.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = SURFACE;
  roundedRect(ctx, 32, 32, WIDTH - 64, HEIGHT - 64, 18);
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  roundedRect(ctx, 32, 32, WIDTH - 64, HEIGHT - 64, 18);
  ctx.stroke();

  // Accent band on the left edge.
  ctx.fillStyle = spec.accent;
  ctx.fillRect(32, 32, 6, HEIGHT - 64);

  // Header: title + subtitle
  const padX = 80;
  let y = 110;
  ctx.fillStyle = TEXT;
  ctx.font = FONT_DISPLAY;
  ctx.textBaseline = 'top';
  y = drawWrapped(ctx, spec.title, padX, y, WIDTH - padX * 2, 62, 2);
  if (spec.subtitle) {
    ctx.fillStyle = DIM;
    ctx.font = FONT_BODY;
    y = drawWrapped(ctx, spec.subtitle, padX, y + 8, WIDTH - padX * 2, 30, 2);
  }

  // Body
  y += 28;
  ctx.fillStyle = TEXT;
  if (spec.variant === 'concise') {
    ctx.font = FONT_BODY;
    for (const bullet of spec.bullets) {
      // accent dot
      ctx.fillStyle = spec.accent;
      ctx.beginPath();
      ctx.arc(padX + 6, y + 14, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = TEXT;
      y = drawWrapped(ctx, bullet, padX + 26, y, WIDTH - padX * 2 - 26, 30, 2) + 6;
    }
  } else {
    // 2x2 sections
    const colW = (WIDTH - padX * 2 - 32) / 2;
    const sectionH = 180;
    spec.sections.slice(0, 4).forEach((sec, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = padX + col * (colW + 32);
      const sy = y + row * sectionH;
      ctx.fillStyle = spec.accent;
      ctx.font = FONT_MONO;
      ctx.fillText(sec.heading.toUpperCase(), sx, sy);
      ctx.fillStyle = TEXT;
      ctx.font = FONT_TITLE;
      let ly = sy + 26;
      ctx.font = FONT_BODY;
      for (const line of sec.lines) {
        ly = drawWrapped(ctx, '— ' + line, sx, ly, colW, 28, 2) + 4;
      }
    });
  }

  // Footer
  ctx.fillStyle = DIM;
  ctx.font = FONT_MONO;
  ctx.fillText('SVESKA · sveska.studio', padX, HEIGHT - 64);
}

export async function exportImage(spec: ImageSpec): Promise<Blob> {
  // Off-screen canvas so we don't disturb the DOM.
  const canvas = document.createElement('canvas');
  renderImageToCanvas(spec, canvas);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('toBlob returned null'));
      else resolve(blob);
    }, 'image/png');
  });
}

/** Trigger a download of the rendered PNG. */
export async function downloadImage(spec: ImageSpec, filename = 'sveska-card.png'): Promise<void> {
  const blob = await exportImage(spec);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

// ─── helpers ──────────────────────────────────────────────────────────

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Word-wrap a string into the given column and draw it. Returns the y
 *  coordinate AFTER the last drawn line. */
function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(/\s+/);
  let line = '';
  let lines = 0;
  for (const w of words) {
    const trial = line ? line + ' ' + w : w;
    if (ctx.measureText(trial).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines++;
      if (lines >= maxLines) return y;
      line = w;
    } else {
      line = trial;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}
