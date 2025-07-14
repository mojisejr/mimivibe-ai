export const ProfileLoadingState = () => (
  <div className="max-w-2xl mx-auto space-y-6">
    {/* User Info Card Skeleton */}
    <div className="card card-mystical">
      <div className="card-body">
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="flex items-center space-x-4">
          <div className="avatar">
            <div className="w-16 rounded-full skeleton" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-4 w-48" />
          </div>
        </div>
      </div>
    </div>

    {/* Credits Card Skeleton */}
    <div className="card card-mystical">
      <div className="card-body">
        <div className="skeleton h-6 w-32 mb-4" />
        <div className="flex justify-between items-center mb-4">
          <div className="skeleton h-5 w-28" />
          <div className="skeleton h-8 w-16" />
        </div>
        <div className="card-actions justify-end">
          <div className="skeleton h-12 w-32" />
        </div>
      </div>
    </div>

    {/* Stats Card Skeleton */}
    <div className="card card-mystical">
      <div className="card-body">
        <div className="skeleton h-6 w-28 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="skeleton h-8 w-12 mx-auto mb-2" />
            <div className="skeleton h-4 w-20 mx-auto" />
          </div>
          <div className="text-center">
            <div className="skeleton h-8 w-12 mx-auto mb-2" />
            <div className="skeleton h-4 w-16 mx-auto" />
          </div>
        </div>
      </div>
    </div>

    {/* Level Progress Skeleton */}
    <div className="card card-mystical">
      <div className="card-body">
        <div className="skeleton h-6 w-24 mb-4" />
        <div className="flex items-center space-x-4 mb-2">
          <div className="skeleton h-5 w-16" />
          <div className="flex-1 skeleton h-2" />
          <div className="skeleton h-5 w-20" />
        </div>
        <div className="skeleton h-4 w-32" />
      </div>
    </div>
  </div>
);

export const HistoryLoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="card card-mystical">
        <div className="card-body">
          <div className="skeleton h-6 w-32 mb-2" />
          <div className="skeleton h-4 w-20 mb-4" />
          <div className="space-y-2 mb-4">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-3/4" />
          </div>
          <div className="card-actions justify-end">
            <div className="skeleton h-8 w-32" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  retryText?: string;
}

export const ErrorState = ({
  title,
  message,
  onRetry,
  retryText = "ลองใหม่อีกครั้ง",
}: ErrorStateProps) => (
  <div className="card card-mystical max-w-md mx-auto">
    <div className="card-body text-center">
      <div className="text-error mb-4">
        <svg
          className="w-12 h-12 mx-auto mb-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-neutral-content">{message}</p>
      </div>
      <button onClick={onRetry} className="btn btn-primary">
        {retryText}
      </button>
    </div>
  </div>
);

export const EmptyState = ({
  title,
  message,
  actionText,
  onAction,
}: {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}) => (
  <div className="text-center py-12">
    <div className="text-neutral-content mb-4">
      <svg
        className="w-16 h-16 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-neutral-content">{message}</p>
    </div>
    {actionText && onAction && (
      <button onClick={onAction} className="btn btn-primary">
        {actionText}
      </button>
    )}
  </div>
);