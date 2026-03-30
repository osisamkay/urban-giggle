'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
        <p className="text-gray-600 mb-6">Something went wrong loading the dashboard.</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-meat-600 text-white font-medium rounded-lg hover:bg-meat-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
