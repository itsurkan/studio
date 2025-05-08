
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppProviders } from "@/contexts/app-providers"; // Import AppProviders

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppProviders> {/* Wrap content with AppProviders */}
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 md:ml-64 pt-4 px-4 md:px-8 pb-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
