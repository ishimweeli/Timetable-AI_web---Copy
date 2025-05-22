import React from 'react';
import { Alert, AlertCircle, XCircle } from 'lucide-react';

interface ValidationMessageProps {
  errors: Record<string, string>;
  showTitle?: boolean;
  variant?: 'default' | 'prominent' | 'inline';
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ 
  errors, 
  showTitle = true,
  variant = 'default'
}) => {
  if(!errors || Object.keys(errors).length === 0) {
    return null;
  }

  // Check if we have an API error - these should always be shown prominently
  const hasApiError = 'apiError' in errors;
  
  // Use prominent variant when we have API errors
  if(hasApiError && variant !== 'prominent') {
    variant = 'prominent';
  }

  // For inline field validation
  if(variant === 'inline') {
    return (
      <div className="text-sm text-red-600 mt-1">
        {Object.values(errors).map((error, index) => (
          <div key={index} className="flex items-start gap-1.5">
            <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  }

  // For prominent display with better visibility
  if(variant === 'prominent') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fadeIn">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3 w-full">
            {showTitle && (
              <h3 className="text-sm font-medium text-red-800">
                {errors.title || (hasApiError ? "Server Error:" : "Please correct the following errors:")}
              </h3>
            )}
            <div className="mt-2">
              <ul className="list-disc pl-5 space-y-1.5">
                {Object.entries(errors)
                  .filter(([key]) => key !== 'title')
                  .map(([key, error], index) => (
                    <li key={index} className={`text-sm ${key === 'apiError' ? 'text-red-800 font-semibold' : 'text-red-700'}`}>
                      {error}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default display
  return (
    <div role="alert" className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
      {showTitle && <div className="font-medium mb-1">{errors.title || (hasApiError ? "Server Error:" : "Please correct the following errors:")}</div>}
      <ul className="list-disc pl-5 text-sm space-y-1">
        {Object.entries(errors)
          .filter(([key]) => key !== 'title')
          .map(([key, error], index) => (
            <li key={index} className={key === 'apiError' ? 'font-semibold' : ''}>{error}</li>
          ))}
      </ul>
    </div>
  );
};

export default ValidationMessage;
