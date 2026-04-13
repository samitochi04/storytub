import supabase from "../config/supabase.js";
import logger from "./logger.js";

export async function recordAuditLog({
  staffId,
  action,
  resourceType,
  resourceId = null,
  changes = null,
  request = null,
}) {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      staff_id: staffId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      changes,
      ip_address: request?.clientIp || request?.ip || null,
      user_agent: request?.headers?.["user-agent"] || null,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error(
      { error, staffId, action, resourceType, resourceId },
      "Failed to record audit log",
    );
  }
}
