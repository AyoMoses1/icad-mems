import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UnauthorizedScreenProps {
  className?: string;
  userRole?: string;
}

export function UnauthorizedScreen({
  className,
  userRole,
}: UnauthorizedScreenProps) {
  const router = useRouter();

  const handleGoBack = () => {
    // Try to go back to IMS or previous page
    if (typeof window === "undefined") return;
    
    // First, try to go back in browser history (if they came from IMS)
    if (window.history.length > 1) {
      const referrer = document.referrer;
      // If referrer exists and is from a different origin, go back
      if (referrer) {
        try {
          const referrerOrigin = new URL(referrer).origin;
          if (referrerOrigin !== window.location.origin) {
            window.history.back();
            return;
          }
        } catch {
          // Invalid referrer URL, continue to fallback
        }
      }
    }
    
    // Otherwise, redirect to IMS URL or fallback
    // In local development, use localhost:3001 (seafarer app port)
    // In staging/prod, use the workspace URL from env or fallback
    const isLocalDev = window.location.origin.includes("localhost");
    const imsUrl = isLocalDev 
      ? "http://localhost:3001"
      : (process.env.NEXT_PUBLIC_IMS_URL || "/");
    window.location.href = imsUrl;
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4",
        className
      )}
    >
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Access Denied
            </h1>
            <p className="text-muted-foreground text-sm">
              You don't have permission to access this application
            </p>
          </div>

          {/* Message */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">
              The Seafarer Management System is only accessible to users with
              the following roles:
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-medium">SEAFARER</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-medium">OWNER</span>
              </div>
            </div>
            {userRole && (
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                Your current role: <span className="font-semibold">{userRole}</span>
              </p>
            )}
          </div>

          {/* Action */}
          <div className="pt-2">
            <Button
              onClick={handleGoBack}
              variant="default"
              size="lg"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>

          {/* Help text */}
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact your administrator
            to request the appropriate role.
          </p>
        </div>
      </div>
    </div>
  );
}

