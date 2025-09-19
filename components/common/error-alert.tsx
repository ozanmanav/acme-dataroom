import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="ml-auto h-6 w-6 p-0 text-red-500 hover:bg-red-100 hover:text-red-600"
          >
            <span className="sr-only">Kapat</span>
            <X className="h-3 w-3" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
