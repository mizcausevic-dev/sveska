export interface TableInsertion {
  body: string;
  cursor: number;
}

export function buildMarkdownTable(rows: number, columns: number): string {
  const safeRows = Math.max(1, Math.min(20, Math.floor(rows)));
  const safeColumns = Math.max(1, Math.min(12, Math.floor(columns)));
  const header = `| ${Array.from({ length: safeColumns }, (_, i) => `Column ${i + 1}`).join(' | ')} |`;
  const divider = `| ${Array.from({ length: safeColumns }, () => '---').join(' | ')} |`;
  const data = `| ${Array.from({ length: safeColumns }, () => ' ').join(' | ')} |`;
  return [header, divider, ...Array.from({ length: safeRows }, () => data)].join('\n');
}

export function insertMarkdownTable(
  body: string,
  cursor: number,
  rows: number,
  columns: number,
): TableInsertion {
  const at = Math.max(0, Math.min(body.length, cursor));
  const before = body.slice(0, at);
  const after = body.slice(at);
  const prefix =
    before.length === 0 ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const suffix = after.length === 0 ? '\n' : after.startsWith('\n') ? '\n' : '\n\n';
  const table = buildMarkdownTable(rows, columns);
  const lines = table.split('\n');
  const firstDataOffset = (lines[0]?.length ?? 0) + 1 + (lines[1]?.length ?? 0) + 1 + 2;
  return {
    body: `${before}${prefix}${table}${suffix}${after}`,
    cursor: before.length + prefix.length + firstDataOffset,
  };
}
