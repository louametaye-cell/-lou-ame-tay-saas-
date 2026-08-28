// High-resolution API latency and performance logger
export function startTimer() {
  const start = performance.now();
  return {
    elapsedMs: () => Math.round((performance.now() - start) * 100) / 100,
  };
}

export function logPerformance(route: string, durationMs: number, extraInfo?: string) {
  const statusBadge = durationMs < 50 ? '⚡ FAST' : durationMs < 200 ? '✅ NORMAL' : '⚠️ SLOW';
  console.log(`[PERF] ${statusBadge} | ${route} -> ${durationMs}ms ${extraInfo ? `(${extraInfo})` : ''}`);
}