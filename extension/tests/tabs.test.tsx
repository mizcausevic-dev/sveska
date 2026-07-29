import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App';

async function bootPanel(): Promise<void> {
  render(<App />);
  await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());
}

describe('side panel — hydration + tab switching', () => {
  it('boots into Tasks empty state, switches to Notebook empty state, back', async () => {
    await bootPanel();
    expect(screen.getByTestId('tasks-empty')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('tab-notebook'));
    expect(screen.getByTestId('notebook-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('tasks-empty')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('tab-tasks'));
    expect(screen.getByTestId('tasks-empty')).toBeInTheDocument();
  });

  it('remembers the last active tab across a panel reopen', async () => {
    await bootPanel();
    await userEvent.click(screen.getByTestId('tab-notebook'));
    // Simulate a panel close/reopen — unmount, then render fresh.
    cleanup();
    await bootPanel();
    expect(screen.getByTestId('notebook-empty')).toBeInTheDocument();
  });
});

describe('side panel — Tasks: create, add, toggle, persist', () => {
  it('flips out of the empty state on create and persists across a re-render', async () => {
    await bootPanel();
    await userEvent.click(screen.getByTestId('tasks-create-list'));
    expect(screen.getByTestId('tasks-panel')).toBeInTheDocument();

    const addInput = screen.getByTestId('tasks-add-input');
    await userEvent.type(addInput, 'buy milk{enter}');
    await waitFor(() => expect(screen.getByText('buy milk')).toBeInTheDocument());

    // Reopen the panel — the note must still be there.
    cleanup();
    await bootPanel();
    expect(screen.getByTestId('tasks-panel')).toBeInTheDocument();
    expect(screen.getByText('buy milk')).toBeInTheDocument();
  });

  it('checkbox toggles the task done-state and survives reload', async () => {
    await bootPanel();
    await userEvent.click(screen.getByTestId('tasks-create-list'));
    await userEvent.type(screen.getByTestId('tasks-add-input'), 'call dentist{enter}');
    await waitFor(() => expect(screen.getByText('call dentist')).toBeInTheDocument());

    const checkbox = screen.getByTestId('task-checkbox-0') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await userEvent.click(checkbox);
    await waitFor(() => {
      const cb2 = screen.getByTestId('task-checkbox-0') as HTMLInputElement;
      expect(cb2.checked).toBe(true);
    });

    cleanup();
    await bootPanel();
    const cbAfter = screen.getByTestId('task-checkbox-0') as HTMLInputElement;
    expect(cbAfter.checked).toBe(true);
  });
});

describe('side panel — Notebook: create, type, persist', () => {
  it('creates a notebook note, types into it, and survives reload', async () => {
    await bootPanel();
    await userEvent.click(screen.getByTestId('tab-notebook'));
    await userEvent.click(screen.getByTestId('notebook-create-note'));
    expect(screen.getByTestId('notebook-panel')).toBeInTheDocument();

    const body = screen.getByTestId('notebook-body') as HTMLTextAreaElement;
    expect(body).toHaveAttribute('spellcheck', 'false');
    await userEvent.type(body, 'hello sveska');
    await waitFor(() => {
      const b2 = screen.getByTestId('notebook-body') as HTMLTextAreaElement;
      expect(b2.value).toBe('hello sveska');
    });

    cleanup();
    await bootPanel();
    // Notebook is not the default tab in a *fresh* boot, but the last-
    // active-tab pref remembers we were on Notebook → boots straight there.
    expect(screen.getByTestId('notebook-panel')).toBeInTheDocument();
    const bAfter = screen.getByTestId('notebook-body') as HTMLTextAreaElement;
    expect(bAfter.value).toBe('hello sveska');
  });
});
