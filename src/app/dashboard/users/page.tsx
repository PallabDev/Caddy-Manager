import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth.helper";
import { userService } from "@/server/services/user.service";
import { UserManagementTable } from "@/components/users/user-management-table";
import { Users, ShieldCheck, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.admin) {
    redirect("/dashboard");
  }

  const allUsers = await userService.getAllUsers(user);
  const totalApproved = allUsers.filter((u) => u.isAccess).length;
  const totalPending = allUsers.filter((u) => !u.isAccess).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary" />
            User Access & Permissions
          </h1>
          <p className="text-sm text-muted mt-1">
            Approve new user sign-ups, grant dashboard access, and manage administrator privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-lg text-xs">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="text-muted">Approved:</span>
            <strong className="text-text">{totalApproved}</strong>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-lg text-xs">
            <ShieldAlert className="h-4 w-4 text-warning" />
            <span className="text-muted">Pending:</span>
            <strong className="text-text">{totalPending}</strong>
          </div>
        </div>
      </div>

      <UserManagementTable
        initialUsers={allUsers}
        currentAdminId={user.id}
      />
    </div>
  );
}
