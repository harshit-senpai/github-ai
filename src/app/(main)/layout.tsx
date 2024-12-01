import { UserButton } from "@clerk/nextjs";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import { Toaster } from "~/components/ui/sonner";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="m-2 w-full">
        <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        <div className="h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
          {children}
          <Toaster />
        </div>
      </main>
    </SidebarProvider>
  );
}
