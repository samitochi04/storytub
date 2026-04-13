import supabase from "../config/supabase.js";
import { Errors } from "../lib/errors.js";
import { recordAuditLog } from "../lib/audit.js";
import {
  getBillingOverview,
  getDashboardAnalytics,
  getMonitoringOverview,
  getRevenueBreakdown,
} from "../services/analytics.service.js";

const createStaffSchema = {
  body: {
    type: "object",
    required: ["email", "display_name", "password", "role"],
    properties: {
      email: { type: "string", format: "email" },
      display_name: { type: "string", minLength: 1, maxLength: 120 },
      password: { type: "string", minLength: 8, maxLength: 128 },
      role: { type: "string", enum: ["admin", "manager", "agent"] },
      avatar_url: { type: "string", minLength: 1, maxLength: 500 },
      permissions: {
        type: "array",
        items: {
          type: "object",
          required: ["resource"],
          properties: {
            resource: { type: "string", minLength: 1, maxLength: 80 },
            can_create: { type: "boolean" },
            can_read: { type: "boolean" },
            can_update: { type: "boolean" },
            can_delete: { type: "boolean" },
          },
        },
      },
    },
  },
};

const updateStaffSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
  body: {
    type: "object",
    properties: {
      display_name: { type: "string", minLength: 1, maxLength: 120 },
      role: { type: "string", enum: ["admin", "manager", "agent"] },
      avatar_url: { type: "string", minLength: 1, maxLength: 500 },
      is_active: { type: "boolean" },
      permissions: {
        type: "array",
        items: {
          type: "object",
          required: ["resource"],
          properties: {
            resource: { type: "string", minLength: 1, maxLength: 80 },
            can_create: { type: "boolean" },
            can_read: { type: "boolean" },
            can_update: { type: "boolean" },
            can_delete: { type: "boolean" },
          },
        },
      },
    },
  },
};

const idParamSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
};

async function fetchStaffById(id) {
  const { data, error } = await supabase
    .from("staff_accounts")
    .select("*, staff_permissions(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw Errors.notFound("Staff member not found");
  }

  return data;
}

async function upsertPermissions(staffId, permissions = []) {
  const { error: deleteError } = await supabase
    .from("staff_permissions")
    .delete()
    .eq("staff_id", staffId);

  if (deleteError) {
    throw deleteError;
  }

  if (!permissions.length) return [];

  const rows = permissions.map((permission) => ({
    staff_id: staffId,
    resource: permission.resource,
    can_create: permission.can_create ?? false,
    can_read: permission.can_read ?? false,
    can_update: permission.can_update ?? false,
    can_delete: permission.can_delete ?? false,
  }));

  const { error } = await supabase.from("staff_permissions").insert(rows);
  if (error) {
    throw error;
  }

  return rows;
}

export default async function adminRoutes(app) {
  const adminOnly = [app.verifyUser, app.requireStaff("admin")];
  const managerOrAdmin = [app.verifyUser, app.requireStaff("manager")];

  app.get("/staff", { preHandler: managerOrAdmin }, async (request) => {
    const { data, error } = await supabase
      .from("staff_accounts")
      .select("*, staff_permissions(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    await recordAuditLog({
      staffId: request.staff.id,
      action: "read",
      resourceType: "staff",
      changes: { count: data?.length || 0 },
      request,
    });

    return { staff: data || [] };
  });

  app.post(
    "/staff",
    { schema: createStaffSchema, preHandler: managerOrAdmin },
    async (request, reply) => {
      const {
        email,
        display_name: displayName,
        password,
        role,
        avatar_url: avatarUrl,
        permissions = [],
      } = request.body;

      if (request.staff.role === "manager" && role !== "agent") {
        throw Errors.forbidden("Managers can only create agents");
      }

      const createdUser = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      });

      if (createdUser.error || !createdUser.data.user) {
        throw (
          createdUser.error ||
          Errors.badRequest("Failed to create staff auth user")
        );
      }

      const authUserId = createdUser.data.user.id;

      try {
        const { data: staffRow, error: staffError } = await supabase
          .from("staff_accounts")
          .insert({
            user_id: authUserId,
            email,
            display_name: displayName,
            role,
            avatar_url: avatarUrl || null,
            created_by: request.staff.id,
          })
          .select("*")
          .single();

        if (staffError || !staffRow) {
          throw (
            staffError || Errors.badRequest("Failed to create staff profile")
          );
        }

        const savedPermissions = await upsertPermissions(
          staffRow.id,
          permissions,
        );

        await recordAuditLog({
          staffId: request.staff.id,
          action: "create",
          resourceType: "staff",
          resourceId: staffRow.id,
          changes: { after: { ...staffRow, permissions: savedPermissions } },
          request,
        });

        return reply.status(201).send({
          staff: { ...staffRow, permissions: savedPermissions },
        });
      } catch (error) {
        await supabase.auth.admin.deleteUser(authUserId).catch(() => null);
        throw error;
      }
    },
  );

  app.patch(
    "/staff/:id",
    { schema: updateStaffSchema, preHandler: adminOnly },
    async (request, reply) => {
      const existing = await fetchStaffById(request.params.id);
      const updatePayload = {};

      if (request.body.display_name !== undefined) {
        updatePayload.display_name = request.body.display_name;
      }
      if (request.body.role !== undefined) {
        updatePayload.role = request.body.role;
      }
      if (request.body.avatar_url !== undefined) {
        updatePayload.avatar_url = request.body.avatar_url;
      }
      if (request.body.is_active !== undefined) {
        updatePayload.is_active = request.body.is_active;
      }

      let updated = existing;

      if (Object.keys(updatePayload).length) {
        const { data, error } = await supabase
          .from("staff_accounts")
          .update(updatePayload)
          .eq("id", request.params.id)
          .select("*")
          .single();

        if (error || !data) {
          throw error || Errors.badRequest("Failed to update staff member");
        }

        updated = data;
      }

      let savedPermissions = existing.staff_permissions || [];
      if (request.body.permissions !== undefined) {
        savedPermissions = await upsertPermissions(
          updated.id,
          request.body.permissions,
        );
      }

      await recordAuditLog({
        staffId: request.staff.id,
        action: "update",
        resourceType: "staff",
        resourceId: updated.id,
        changes: {
          before: existing,
          after: { ...updated, permissions: savedPermissions },
        },
        request,
      });

      return reply.status(200).send({
        staff: { ...updated, permissions: savedPermissions },
      });
    },
  );

  app.delete(
    "/staff/:id",
    { schema: idParamSchema, preHandler: adminOnly },
    async (request, reply) => {
      const existing = await fetchStaffById(request.params.id);

      const { error } = await supabase
        .from("staff_accounts")
        .update({ is_active: false })
        .eq("id", request.params.id);

      if (error) throw error;

      await recordAuditLog({
        staffId: request.staff.id,
        action: "delete",
        resourceType: "staff",
        resourceId: existing.id,
        changes: { before: existing, after: { ...existing, is_active: false } },
        request,
      });

      return reply.status(200).send({ success: true });
    },
  );

  app.get("/analytics", { preHandler: adminOnly }, async (request) => {
    const analytics = await getDashboardAnalytics();

    await recordAuditLog({
      staffId: request.staff.id,
      action: "read",
      resourceType: "analytics",
      changes: { range_days: 30 },
      request,
    });

    return analytics;
  });

  app.get("/analytics/revenue", { preHandler: adminOnly }, async (request) => {
    const revenue = await getRevenueBreakdown();

    await recordAuditLog({
      staffId: request.staff.id,
      action: "read",
      resourceType: "billing_revenue",
      changes: { range_days: 30 },
      request,
    });

    return revenue;
  });

  app.get("/audit-logs", { preHandler: adminOnly }, async (request) => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*, staff_accounts(id, email, display_name, role)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    await recordAuditLog({
      staffId: request.staff.id,
      action: "read",
      resourceType: "audit_logs",
      changes: { count: data?.length || 0 },
      request,
    });

    return { logs: data || [] };
  });

  app.get("/billing", { preHandler: adminOnly }, async (request) => {
    const overview = await getBillingOverview();

    await recordAuditLog({
      staffId: request.staff.id,
      action: "read",
      resourceType: "billing",
      request,
    });

    return overview;
  });

  app.get("/monitoring", { preHandler: adminOnly }, async (request) => {
    const monitoring = await getMonitoringOverview();

    await recordAuditLog({
      staffId: request.staff.id,
      action: "read",
      resourceType: "monitoring",
      request,
    });

    return monitoring;
  });
}
