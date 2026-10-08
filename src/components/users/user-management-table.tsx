"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Trash2, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type User } from "@/server/db/schema";
import {
  toggleUserAccessAction,
  toggleUserRoleAction,
  deleteUserAction,
} from "@/features/users/actions/user.actions";
import { formatDate } from "@/lib/utils";

interface UserManagementTableProps {
  initialUsers: User[];
  currentAdminId: string;
}

export function UserManagementTable({ initialUsers, currentAdminId }: UserManagementTableProps) {
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleAccess = async (targetUser: User) => {
    setLoadingId(targetUser.id);
    const newAccess = !targetUser.isAccess;
    const res = await toggleUserAccessAction(targetUser.id, newAccess);
    if (res.success && res.data) {
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isAccess: newAccess } : u))
      );
    }
    setLoadingId(null);
  };

  const handleToggleRole = async (targetUser: User) => {
    if (targetUser.id === currentAdminId) {
      alert("You cannot revoke your own administrator rights.");
      return;
    }
    setLoadingId(targetUser.id);
    const newAdmin = !targetUser.admin;
    const res = await toggleUserRoleAction(targetUser.id, newAdmin);
    if (res.success && res.data) {
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, admin: newAdmin } : u))
      );
    }
    setLoadingId(null);
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.id === currentAdminId) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Are you sure you want to delete user ${targetUser.email}?`)) {
      return;
    }
    setLoadingId(targetUser.id);
    const res = await deleteUserAction(targetUser.id);
    if (res.success) {
      setUserList((prev) => prev.filter((u) => u.id !== targetUser.id));
    }
    setLoadingId(null);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Access Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.map((u) => {
            const isSelf = u.id === currentAdminId;
            const isLoading = loadingId === u.id;

            return (
              <TableRow key={u.id}>
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.image || undefined} alt={u.name} />
                      <AvatarFallback className="bg-slate-800 text-xs">
                        {u.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {u.name}
                        {isSelf && (
                          <span className="text-[10px] font-mono bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Joined Date */}
                <TableCell className="text-xs text-slate-400">
                  {formatDate(u.createdAt)}
                </TableCell>

                {/* isAccess Badge */}
                <TableCell>
                  {u.isAccess ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Approved
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="gap-1">
                      <XCircle className="h-3 w-3" /> Pending Approval
                    </Badge>
                  )}
                </TableCell>

                {/* Admin Role */}
                <TableCell>
                  {u.admin ? (
                    <Badge variant="default" className="gap-1 bg-indigo-500/15 text-indigo-400 border-indigo-500/30">
                      <ShieldCheck className="h-3 w-3" /> Administrator
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <UserIcon className="h-3 w-3" /> Standard User
                    </Badge>
                  )}
                </TableCell>

                {/* Action Buttons */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Toggle Access */}
                    <Button
                      size="sm"
                      variant={u.isAccess ? "outline" : "default"}
                      onClick={() => handleToggleAccess(u)}
                      disabled={isLoading}
                      className="h-8 text-xs"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : u.isAccess ? (
                        "Revoke Access"
                      ) : (
                        "Grant Access"
                      )}
                    </Button>

                    {/* Toggle Admin */}
                    {!isSelf && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleRole(u)}
                        disabled={isLoading}
                        className="h-8 text-xs"
                      >
                        {u.admin ? "Demote" : "Make Admin"}
                      </Button>
                    )}

                    {/* Delete User */}
                    {!isSelf && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(u)}
                        disabled={isLoading}
                        className="h-8 px-2 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
