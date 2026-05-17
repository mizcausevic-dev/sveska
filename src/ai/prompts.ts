/**
 * Curated system prompts for the M4.T4.2 slash AI commands.
 *
 * Hard-coded for now (the prompts-edit UI is post-M4 per the ticket
 * "Don't"). Each entry maps to a slash command (`/improve`, etc.) and
 * a palette entry; both run the AI proxy with the same prompt.
 */

export type AICommandId =
  | 'ai.improve'
  | 'ai.summarize'
  | 'ai.continue'
  | 'ai.rewrite'
  | 'ai.linkedin';

export interface AICommandSpec {
  id: AICommandId;
  /** Slash trigger after the leading `/` — e.g. `improve` for `/improve`. */
  trigger: string;
  /** Human-readable label for the palette + popover row. */
  label: string;
  /** One-line hint for the row. */
  hint: string;
  /** System prompt sent to Anthropic with the active body as the user msg. */
  system: string;
  /**
   * If true, the result replaces the active note's body. Default = false
   * (result streams into a read-only side pane the user can copy from).
   */
  replaceBody?: boolean;
  /**
   * If true, the result gets copied to the clipboard once streaming
   * finishes. The side pane still shows the stream.
   */
  copyOnComplete?: boolean;
}

export const AI_COMMANDS: AICommandSpec[] = [
  {
    id: 'ai.improve',
    trigger: 'improve',
    label: 'AI · Improve writing',
    hint: 'Tighten prose, fix grammar, preserve voice. Replaces the body.',
    system:
      "You are a careful editor. Rewrite the user's note to tighten prose, fix grammar, and improve clarity. Preserve the author's voice, register, and structure (headings, lists, code blocks, line breaks). Output ONLY the rewritten note body — no preamble, no explanation, no surrounding quotes.",
    replaceBody: true,
  },
  {
    id: 'ai.summarize',
    trigger: 'summarize',
    label: 'AI · Summarize',
    hint: 'Three-bullet TL;DR alongside the original.',
    system:
      "You are a careful summarizer. Read the user's note and produce a three-bullet TL;DR. Each bullet is one sentence, max 18 words. Output ONLY the three Markdown bullets — no heading, no preamble.",
  },
  {
    id: 'ai.continue',
    trigger: 'continue',
    label: 'AI · Continue writing',
    hint: 'Pick up where the cursor ended and write the next paragraph.',
    system:
      "You are a continuation engine. Read the user's note (which ends mid-thought) and write the next 1-2 paragraphs in the same voice, register, and topic. Do not repeat the existing text. Do not add a heading. Output ONLY the continuation prose.",
  },
  {
    id: 'ai.rewrite',
    trigger: 'rewrite',
    label: 'AI · Rewrite',
    hint: 'Same meaning, different phrasing. Replaces the body.',
    system:
      "You are a rewriter. Produce a faithful but freshly-phrased version of the user's note. Preserve facts and structure (headings, lists, line breaks). Vary sentence rhythm and word choice. Output ONLY the rewritten note body.",
    replaceBody: true,
  },
  {
    id: 'ai.linkedin',
    trigger: 'linkedin',
    label: 'AI · Copy as LinkedIn post',
    hint: 'Reshape the note as a tight LinkedIn post + copy to clipboard.',
    system:
      'You are a LinkedIn-post writer. Take the user\'s note and reshape it as a punchy 120-200 word LinkedIn post: an attention hook (line 1), a body of 3-5 short paragraphs (one idea each, line breaks between), and a closing question or CTA. No hashtags, no emojis, no "Excited to share". Output ONLY the post text.',
    copyOnComplete: true,
  },
];

export function findAICommand(id: AICommandId): AICommandSpec | null {
  return AI_COMMANDS.find((c) => c.id === id) ?? null;
}
