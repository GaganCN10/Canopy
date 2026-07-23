import { useCallback } from 'react';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../components/Toast';

export function useErrorHandler() {
  const { showError } = useToast();

  const handleError = useCallback(
    (error, customMessage = null) => {
      const errorInfo = getErrorMessage(error);
      const title = customMessage || errorInfo?.title || 'Error';
      const message = errorInfo?.message || error.message || 'An unexpected error occurred.';
      const remedy = errorInfo?.remedy || 'Please try again or contact support if the issue continues.';

      showError(title, message, remedy);

      return errorInfo;
    },
    [showError]
  );

  const handleApiError = useCallback(
    (error) => {
      const errorInfo = handleError(error);
      return errorInfo;
    },
    [handleError]
  );

  return { handleError, handleApiError };
}
