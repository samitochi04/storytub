import fp from "fastify-plugin";
import supabase from "../config/supabase.js";
import { Errors } from "../lib/errors.js";

/**
 * Checks staff_accounts for the authenticated user and enforces role hierarchy.
 *
 * Role hierarchy: admin > manager > agent
 * requireStaff('agent')   → allows agent, manager, admin
 * requireStaff('manager') → allows manager, admin
 * requireStaff('admin')   → allows admin only
 */
const ROLE_LEVEL = { agent: 1, manager: 2, admin: 3 };

async function staffPlugin(fastify) {
  fastify.decorateRequest("staff", null);

  /**
   * Factory: returns a preHandler that checks minimum role.
   * Usage: { preHandler: [fastify.verifyUser, fastify.requireStaff('manager')] }
   */
  fastify.decorate("requireStaff", (minRole) => {
    const minLevel = ROLE_LEVEL[minRole] || 0;

    return async (request, reply) => {
      if (!request.user) {
        throw Errors.unauthorized();
      }

      const { data: staff, error } = await supabase
        .from("staff_accounts")
        .select("id, role, is_active")
        .eq("user_id", request.user.id)
        .eq("is_active", true)
        .single();

      if (error || !staff) {
        throw Errors.forbidden("Not a staff member");
      }

      const userLevel = ROLE_LEVEL[staff.role] || 0;
      if (userLevel < minLevel) {
        throw Errors.forbidden(
          `Requires ${minRole} role. You are ${staff.role}.`,
        );
      }

      request.staff = {
        id: staff.id,
        role: staff.role,
      };
    };
  });
}

export default fp(staffPlugin, {
  name: "staff",
  dependencies: ["auth"],
});
