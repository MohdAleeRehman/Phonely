interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

export default function Loading({ size = 'md', fullScreen = false, message }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Spinner with Double Ring */}
      <div className="relative">
        <div className={`animate-spin rounded-full border-primary-600 border-t-transparent ${sizeClasses[size]}`}></div>
        <div 
          className={`animate-spin rounded-full border-purple-400 border-t-transparent absolute top-0 left-0 ${sizeClasses[size]}`} 
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
        ></div>
      </div>
      
      {message && (
        <p className="text-gray-300 font-medium animate-pulse">{message}</p>
      )}
      
      {!message && size === 'lg' && (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
