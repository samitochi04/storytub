import supabase from "../config/supabase.js";
import env from "../config/env.js";
import { Errors } from "../lib/errors.js";
import { queueTemplateEmail } from "../services/email.service.js";

const createSchema = {
  body: {
    type: "object",
    required: ["subject", "category", "priority", "message"],
    properties: {
      subject: { type: "string", minLength: 3, maxLength: 200 },
      category: {
        type: "string",
        enum: [
          "billing",
          "technical",
          "account",
          "feature_request",
          "bug_report",
        ],
      },
      priority: { type: "string", enum: ["low", "normal", "high"] },
      message: { type: "string", minLength: 10, maxLength: 5000 },
    },
  },
};

const replySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
  },
  body: {
    type: "object",
    required: ["message"],
    properties: {
      message: { type: "string", minLength: 1, maxLength: 5000 },
    },
  },
};

export default async function supportRoutes(app) {
  /**
   * POST /support/tickets
   * Create a support ticket + first message, send emails.
   */
  app.post(
    "/tickets",
    { schema: createSchema, preHandler: [app.verifyUser] },
    async (request, reply) => {
      const userId = request.user.id;
      const { subject, category, priority, message } = request.body;

      // Create ticket
      const { data: ticket, error: ticketErr } = await supabase
        .from("support_tickets")
        .insert({
          user_id: userId,
          subject,
          category,
          priority,
        })
        .select()
        .single();

      if (ticketErr) {
        request.log.error({ error: ticketErr }, "Failed to create ticket");
        throw Errors.badRequest("Could not create support ticket");
      }

      // Create first message
      const { error: msgErr } = await supabase.from("support_messages").insert({
        ticket_id: ticket.id,
        sender_id: userId,
        is_staff: false,
        message,
      });

      if (msgErr) {
        request.log.error({ error: msgErr }, "Failed to create ticket message");
      }

      // Send confirmation email to user
      try {
        await queueTemplateEmail({
          userId,
          templateId: "support_ticket_created",
          emailType: "transactional",
          variables: {
            ticket_subject: subject,
            ticket_id: ticket.id,
            ticket_category: category,
          },
        });
      } catch (emailErr) {
        request.log.error(
          { err: emailErr },
          "Failed to queue user support email",
        );
      }

      // Send notification email to admin
      if (env.adminEmail) {
        try {
          await queueTemplateEmail({
            emailAddress: env.adminEmail,
            templateId: "support_ticket_admin",
            emailType: "notification",
            variables: {
              ticket_subject: subject,
              ticket_id: ticket.id,
              ticket_category: category,
              ticket_priority: priority,
              user_email: request.user.email || "Unknown",
              ticket_message: message.slice(0, 500),
            },
          });
        } catch (emailErr) {
          request.log.error(
            { err: emailErr },
            "Failed to queue admin support email",
          );
        }
      }

      return reply.status(201).send(ticket);
    },
  );

  /**
   * POST /support/tickets/:id/reply
   * Add a reply to a ticket, notify admin.
   */
  app.post(
    "/tickets/:id/reply",
    { schema: replySchema, preHandler: [app.verifyUser] },
    async (request, reply) => {
      const userId = request.user.id;
      const ticketId = request.params.id;

      // Verify ticket belongs to user
      const { data: ticket, error: ticketErr } = await supabase
        .from("support_tickets")
        .select("id, subject, status")
        .eq("id", ticketId)
        .eq("user_id", userId)
        .single();

      if (ticketErr || !ticket) throw Errors.notFound("Ticket not found");
      if (ticket.status === "closed" || ticket.status === "resolved") {
        throw Errors.badRequest("This ticket is closed");
      }

      const { data: msg, error: msgErr } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: ticketId,
          sender_id: userId,
          is_staff: false,
          message: request.body.message,
        })
        .select()
        .single();

      if (msgErr) {
        request.log.error({ error: msgErr }, "Failed to create reply");
        throw Errors.badRequest("Could not send reply");
      }

      // Reopen ticket if it was waiting
      if (ticket.status === "waiting") {
        await supabase
          .from("support_tickets")
          .update({ status: "open" })
          .eq("id", ticketId);
      }

      // Notify admin of reply
      if (env.adminEmail) {
        try {
          await queueTemplateEmail({
            emailAddress: env.adminEmail,
            templateId: "support_ticket_admin",
            emailType: "notification",
            variables: {
              ticket_subject: ticket.subject,
              ticket_id: ticketId,
              ticket_category: "reply",
              ticket_priority: "normal",
              user_email: request.user.email || "Unknown",
              ticket_message: request.body.message.slice(0, 500),
            },
          });
        } catch (emailErr) {
          request.log.error(
            { err: emailErr },
            "Failed to queue admin reply email",
          );
        }
      }

      return reply.status(201).send(msg);
    },
  );
}
