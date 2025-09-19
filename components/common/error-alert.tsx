import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";

interface ErrorAlertProps {
  error: string;
  onClose?: () => void;
  className?: string;
}

export const ErrorAlert = ({
  error,
  onClose,
  className = "",
}: ErrorAlertProps) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto pl-3 inline-flex bg-transparent rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
          >
            <span className="sr-only">Kapat</span>
            <X className="h-3 w-3" />
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};
