import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth.helper";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAccess) {
    redirect("/access-denied");
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          admin: user.admin,
          isAccess: user.isAccess,
        }}
        variant="sidebar"
      />
      <SidebarInset className="bg-bg text-text min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
