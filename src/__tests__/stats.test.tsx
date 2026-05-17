import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { computeStats } from '@/lib/stats';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';

describe('M1.T1.4 — computeStats (pure)', () => {
  it('returns all-zero for empty body', () => {
    expect(computeStats('')).toEqual({
      words: 0,
      chars: 0,
      charsNoSpaces: 0,
      lines: 0,
      paragraphs: 0,
      readingMinutes: 0,
      uniqueWords: 0,
    });
  });

  it('counts words / chars / chars-no-spaces correctly', () => {
    const s = computeStats('hello world');
    expect(s.words).toBe(2);
    expect(s.chars).toBe(11);
    expect(s.charsNoSpaces).toBe(10);
  });

  it('treats apostrophes + hyphens inside a word as part of the word', () => {
    const s = computeStats("don't twenty-one O'Reilly");
    expect(s.words).toBe(3);
    expect(s.uniqueWords).toBe(3);
  });

  it('handles Unicode letters (Bosnian diacritics) as letters', () => {
    const s = computeStats('Prazna sveska. Najbolji početak.');
    expect(s.words).toBe(4);
    expect(s.uniqueWords).toBe(4);
  });

  it('counts lines via \\n, normalizes CRLF', () => {
    expect(computeStats('a\nb\nc').lines).toBe(3);
    expect(computeStats('a\r\nb\r\nc').lines).toBe(3);
    expect(computeStats('').lines).toBe(0);
    expect(computeStats('only one line').lines).toBe(1);
  });

  it('paragraphs = runs of non-blank lines separated by blank lines', () => {
    expect(computeStats('alpha').paragraphs).toBe(1);
    expect(computeStats('alpha\n\nbravo').paragraphs).toBe(2);
    expect(computeStats('alpha\n   \nbravo').paragraphs).toBe(2);
    expect(computeStats('alpha\nbravo\n\ncharlie\n\n').paragraphs).toBe(2);
    expect(computeStats('').paragraphs).toBe(0);
  });

  it('readingMinutes = ceil(words / 230)', () => {
    expect(computeStats('one').readingMinutes).toBe(1);
    const lots = Array.from({ length: 460 }, (_, i) => `w${i}`).join(' ');
    expect(computeStats(lots).readingMinutes).toBe(2);
    const lotsPlusOne = lots + ' overflow';
    expect(computeStats(lotsPlusOne).readingMinutes).toBe(3);
    expect(computeStats('').readingMinutes).toBe(0);
  });

  it('uniqueWords is case-insensitive', () => {
    const s = computeStats('Hello hello HELLO hello');
    expect(s.words).toBe(4);
    expect(s.uniqueWords).toBe(1);
  });

  it('ignores pure punctuation', () => {
    expect(computeStats('. , ; — ··· !!').words).toBe(0);
  });
});

describe('M1.T1.4 — Stats modal UI integration', () => {
  async function renderApp(): Promise<void> {
    await bootstrapTheme();
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  }

  it('Stats button opens the modal with live counts', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'hello world hello');

    await userEvent.click(screen.getByTestId('stats-open'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByTestId('stats-words').textContent).toMatch(/Words.*3/);
    expect(screen.getByTestId('stats-unique').textContent).toMatch(/Unique words.*2/);
    expect(screen.getByTestId('stats-chars').textContent).toMatch(/Characters.*17/);
  });

  it('Ctrl+Shift+I opens the modal', async () => {
    await renderApp();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'I', ctrlKey: true, shiftKey: true });
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByText(/Statistics/i)).toBeInTheDocument();
  });

  it('Counts update live when the body changes', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'one');
    await userEvent.click(screen.getByTestId('stats-open'));
    await waitFor(() => screen.getByRole('dialog'));
    expect(screen.getByTestId('stats-words').textContent).toMatch(/Words.*1/);

    await userEvent.type(textarea, ' two three');
    await waitFor(() => expect(screen.getByTestId('stats-words').textContent).toMatch(/Words.*3/));
  });
});
