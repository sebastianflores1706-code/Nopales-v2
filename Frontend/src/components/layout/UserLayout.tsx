import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "./UserSidebar";
import { UserTopbar } from "./UserTopbar";

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <UserSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <UserTopbar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
