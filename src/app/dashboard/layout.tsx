import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth.helper";
import { Header } from "@/components/layout/header";

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
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors">
      <Header
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          admin: user.admin,
          isAccess: user.isAccess,
        }}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
