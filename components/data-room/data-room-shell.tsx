import { ReactNode } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { Building, Shield } from "lucide-react";

interface DataRoomShellProps {
  children: ReactNode;
}

export function DataRoomShell({ children }: DataRoomShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  ACME Data Room
                </h1>
                <p className="text-sm text-gray-500">
                  Secure Document Repository
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure Session</span>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-full mx-auto bg-white shadow-xs">{children}</div>
    </div>
  );
}
