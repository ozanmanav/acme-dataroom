import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn(
        "animate-spin",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "md", 
          "h-8 w-8": size === "lg",
        },
        className
      )}
    />
  );
}

export const FullPageLoader = ({
  text = "Yükleniyor...",
}: {
  text?: string;
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};
