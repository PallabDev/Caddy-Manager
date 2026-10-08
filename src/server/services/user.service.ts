import { userRepository } from "@/server/repositories/user.repository";
import { type User } from "@/server/db/schema";
import { logger } from "@/lib/logger";

export class UserService {
  async getAllUsers(adminUser: User): Promise<User[]> {
    if (!adminUser.admin) {
      throw new Error("Access denied: Administrator privileges required.");
    }
    return await userRepository.findAll();
  }

  async setUserAccess(adminUser: User, targetUserId: string, isAccess: boolean): Promise<User> {
    if (!adminUser.admin) {
      throw new Error("Access denied: Administrator privileges required.");
    }

    const updated = await userRepository.updateAccess(targetUserId, isAccess);
    if (!updated) {
      throw new Error("Target user not found.");
    }

    logger.info("Admin updated user access", {
      adminId: adminUser.id,
      targetUserId,
      isAccess,
    });

    return updated;
  }

  async setUserAdmin(adminUser: User, targetUserId: string, admin: boolean): Promise<User> {
    if (!adminUser.admin) {
      throw new Error("Access denied: Administrator privileges required.");
    }

    // Prevent removing own admin privileges
    if (adminUser.id === targetUserId && !admin) {
      throw new Error("You cannot revoke your own administrator rights.");
    }

    const updated = await userRepository.updateAdmin(targetUserId, admin);
    if (!updated) {
      throw new Error("Target user not found.");
    }

    logger.info("Admin updated user role", {
      adminId: adminUser.id,
      targetUserId,
      admin,
    });

    return updated;
  }

  async deleteUser(adminUser: User, targetUserId: string): Promise<void> {
    if (!adminUser.admin) {
      throw new Error("Access denied: Administrator privileges required.");
    }

    if (adminUser.id === targetUserId) {
      throw new Error("You cannot delete your own administrator account.");
    }

    await userRepository.delete(targetUserId);
    logger.info("Admin deleted user", { adminId: adminUser.id, targetUserId });
  }
}

export const userService = new UserService();
