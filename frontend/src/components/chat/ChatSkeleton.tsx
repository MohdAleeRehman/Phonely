export default function ChatSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {/* Loading message bubbles */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-sm rounded-2xl p-4 ${
              i % 2 === 0 ? 'bg-primary-200' : 'bg-gray-200'
            }`}
            style={{ width: `${Math.random() * 40 + 40}%` }}
          >
            <div className="h-4 bg-gray-300 rounded mb-2" />
            {Math.random() > 0.5 && (
              <div className="h-4 bg-gray-300 rounded w-3/4" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
