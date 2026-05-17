import { useMemo } from 'react';
import { Modal } from '@/ui/Modal';
import { computeStats } from '@/lib/stats';
import { closeStats, useStatsModal } from './statsModalStore';

interface StatsModalHostProps {
  body: string;
}

export function StatsModalHost({ body }: StatsModalHostProps): React.JSX.Element {
  const open = useStatsModal((s) => s.open);
  const stats = useMemo(() => computeStats(body), [body]);
  return (
    <Modal open={open} onClose={closeStats} title="Statistics" describedById="stats-hint">
      <p id="stats-hint" className="visually-hidden">
        Live counts for the current note. Updates as you type.
      </p>
      <div className="stats-grid" data-testid="stats-grid">
        <Stat label="Words" value={stats.words} testId="stats-words" />
        <Stat label="Characters" value={stats.chars} testId="stats-chars" />
        <Stat
          label="Chars (no spaces)"
          value={stats.charsNoSpaces}
          testId="stats-chars-no-spaces"
        />
        <Stat label="Lines" value={stats.lines} testId="stats-lines" />
        <Stat label="Paragraphs" value={stats.paragraphs} testId="stats-paragraphs" />
        <Stat label="Unique words" value={stats.uniqueWords} testId="stats-unique" />
        <Stat
          label="Reading time"
          value={stats.readingMinutes}
          suffix={stats.readingMinutes === 1 ? 'min' : 'mins'}
          testId="stats-reading"
        />
      </div>
    </Modal>
  );
}

interface StatProps {
  label: string;
  value: number;
  suffix?: string;
  testId: string;
}

function Stat({ label, value, suffix, testId }: StatProps): React.JSX.Element {
  return (
    <div className="stat-cell" data-testid={testId}>
      <span className="stat-label">{label}</span>
      <span className="stat-value mono">
        {value.toLocaleString()}
        {suffix && <span className="stat-suffix"> {suffix}</span>}
      </span>
    </div>
  );
}
