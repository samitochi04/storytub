import {
  createCampaign,
  listCampaigns,
  queueCampaignSend,
} from "../services/email.service.js";
import { recordAuditLog } from "../lib/audit.js";

const createCampaignSchema = {
  body: {
    type: "object",
    required: ["template_id", "name", "subject_en", "subject_fr"],
    properties: {
      template_id: { type: "string", minLength: 1, maxLength: 100 },
      name: { type: "string", minLength: 1, maxLength: 200 },
      subject_en: { type: "string", minLength: 1, maxLength: 300 },
      subject_fr: { type: "string", minLength: 1, maxLength: 300 },
      target_audience: { type: "object", additionalProperties: true },
      scheduled_at: { type: "string", format: "date-time" },
    },
  },
};

const campaignIdSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
};

export default async function emailRoutes(app) {
  const managerOnly = [app.verifyUser, app.requireStaff("manager")];

  app.get("/campaigns", { preHandler: managerOnly }, async (request) => {
    const campaigns = await listCampaigns();

    await recordAuditLog({
      staffId: request.staff.id,
      action: "read",
      resourceType: "email_campaign",
      changes: { count: campaigns.length },
      request,
    });

    return { campaigns };
  });

  app.post(
    "/campaigns",
    { schema: createCampaignSchema, preHandler: managerOnly },
    async (request, reply) => {
      const campaign = await createCampaign({
        templateId: request.body.template_id,
        name: request.body.name,
        subjectEn: request.body.subject_en,
        subjectFr: request.body.subject_fr,
        targetAudience: request.body.target_audience,
        scheduledAt: request.body.scheduled_at,
        createdBy: request.staff.id,
      });

      await recordAuditLog({
        staffId: request.staff.id,
        action: "create",
        resourceType: "email_campaign",
        resourceId: campaign.id,
        changes: { after: campaign },
        request,
      });

      return reply.status(201).send({ campaign });
    },
  );

  app.post(
    "/campaigns/:id/send",
    { schema: campaignIdSchema, preHandler: managerOnly },
    async (request, reply) => {
      const totalRecipients = await queueCampaignSend(request.params.id);

      await recordAuditLog({
        staffId: request.staff.id,
        action: "update",
        resourceType: "email_campaign",
        resourceId: request.params.id,
        changes: { queued_recipients: totalRecipients },
        request,
      });

      return reply.status(202).send({
        campaign_id: request.params.id,
        total_recipients: totalRecipients,
        message: "Campaign queued for delivery",
      });
    },
  );
}
