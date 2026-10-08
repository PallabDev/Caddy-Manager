"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/server/auth.helper";
import { userService } from "@/server/services/user.service";
import { logger } from "@/lib/logger";

export async function getUsersAction() {
  try {
    const admin = await requireAdminUser();
    const users = await userService.getAllUsers(admin);
    return { success: true, data: users };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load users";
    logger.error("Error in getUsersAction", { error: message });
    return { success: false, error: message };
  }
}

export async function toggleUserAccessAction(targetUserId: string, isAccess: boolean) {
  try {
    const admin = await requireAdminUser();
    const updated = await userService.setUserAccess(admin, targetUserId, isAccess);
    revalidatePath("/dashboard/users");
    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user access";
    logger.error("Error in toggleUserAccessAction", { targetUserId, error: message });
    return { success: false, error: message };
  }
}

export async function toggleUserRoleAction(targetUserId: string, adminRole: boolean) {
  try {
    const admin = await requireAdminUser();
    const updated = await userService.setUserAdmin(admin, targetUserId, adminRole);
    revalidatePath("/dashboard/users");
    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user role";
    logger.error("Error in toggleUserRoleAction", { targetUserId, error: message });
    return { success: false, error: message };
  }
}

export async function deleteUserAction(targetUserId: string) {
  try {
    const admin = await requireAdminUser();
    await userService.deleteUser(admin, targetUserId);
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    logger.error("Error in deleteUserAction", { targetUserId, error: message });
    return { success: false, error: message };
  }
}
