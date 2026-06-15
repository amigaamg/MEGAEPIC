'use client';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-midnight-900 text-slate-500 flex-col gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div className="text-xs">{message}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center h-screen bg-midnight-900 text-red-300 flex-col gap-3">
      <span className="text-3xl">⚠</span>
      <div className="text-sm text-slate-100">Error</div>
      <div className="text-xs text-slate-500 max-w-xs text-center">{message}</div>
      {onRetry && (
        <button onClick={onRetry}
          className="px-5 py-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 cursor-pointer text-xs">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📋', title, message }: { icon?: string; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 gap-2">
      <span className="text-3xl">{icon}</span>
      <div className="text-sm font-semibold text-slate-400">{title}</div>
      <div className="text-xs text-slate-600 text-center max-w-xs">{message}</div>
    </div>
  );
}

export function ErrorBoundaryFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-midnight-900 text-red-300 flex-col gap-3">
      <span className="text-3xl">⚠</span>
      <div className="text-sm text-slate-100">Something went wrong</div>
      <div className="text-xs text-slate-500">Please refresh the page or try again.</div>
      <button onClick={() => window.location.reload()}
        className="px-5 py-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 cursor-pointer text-xs">
        Refresh
      </button>
    </div>
  );
}
