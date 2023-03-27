const TicketHistory = require("../models/tickets_histories.model");

const Ticket = require("../models/tickets.model");
const TicketSubscriptions = require("../models/ticket_subscriptions.model");
const User = require("../models/users.model");

const TicketNotification = async ({
  from,
  to,
  title,
  content,
  type,
  ticketId,
}) => {
  const currentTicket = await Ticket.query().findById(ticketId);

  // all admins get notifications
  let sendNotifications = [];

  const admins = await User.query()
    .where({ current_role: "admin" })
    .select("custom_id as user_id");

  const assignee = await Ticket.query()
    .where({ id: ticketId })
    .select("assignee as user_id");

  if (currentTicket?.is_published) {
    // find the subscriptions
    const userSubscriptions = await TicketSubscriptions.query().where({
      ticket_id: ticketId,
    });
  }
};

const insertTicketHistory = (ticketId, userId, status, comment) => {
  return TicketHistory.query().insert({
    ticket_id: ticketId,
    user_id: userId,
    status,
    comment,
  });
};

const allowUser = async (currentUser, ticketId) => {
  const result = await Ticket.query().findById(ticketId);
  const { id, role } = currentUser;

  if (!result) {
    return false;
  } else {
    const ticketRequester = result?.requester;
    const ticketAssignee = result?.assignee;

    return (
      role === "admin" ||
      (role === "assignee" && ticketAssignee === id) ||
      ticketRequester === id
    );
  }
};

module.exports = {
  insertTicketHistory,
  allowUser,
};
