import React from 'react';

interface StatusIndicatorProps {
  type: 'success' | 'info' | 'warning' | 'error';
  message: React.ReactNode;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ type, message }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500 text-green-700';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-700';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500 text-red-700';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className={`${getStyles()} p-2 mb-2`}>
      {message}
    </div>
  );
};

export default StatusIndicator;