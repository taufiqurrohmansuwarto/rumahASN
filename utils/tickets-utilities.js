const TicketHistory = require("../models/tickets_histories.model");

const Ticket = require("../models/tickets.model");
const TicketSubscriptions = require("../models/tickets_subscriptions.model");
const User = require("../models/users.model");
const Comment = require("../models/tickets_comments_customers.model");
const Notification = require("../models/notifications.model");
const { uniqBy } = require("lodash");

const commentReactionNotification = async ({ commentId, currentUserId }) => {
  const currentComement = await Comment.query().findById(commentId);
  const ticketId = currentComement?.ticket_id;
  const commentUserId = currentComement?.user_id;
  const currentUser = await User.query().findById(currentUserId);

  return await Notification.query().insert({
    from: currentUserId,
    title: "Reaksi pada komentar anda",
    content: `${currentUser?.name} telah memberikan reaksi pada komentar anda`,
    type: "comment_reaction",
    ticket_id: ticketId,
    to: commentUserId,
  });
};

const ticketNotification = async ({
  title,
  content,
  type,
  ticketId,
  currentUserId,
}) => {
  const currentTicket = await Ticket.query().findById(ticketId);

  let users = [];

  // all admins get notifications
  const admins = await User.query()
    .where({ current_role: "admin" })
    .select("custom_id as user_id");

  // assignee on ticket
  const assignee = await Ticket.query()
    .where({ id: ticketId })
    .select("assignee as user_id");

  // dan juga requester
  const requester = await Ticket.query()
    .where({ id: ticketId })
    .select("requester as user_id");

  users = [...admins, ...assignee, ...requester];

  if (currentTicket?.is_published) {
    // find the subscriptions
    const userSubscriptions = await TicketSubscriptions.query()
      .where({
        ticket_id: ticketId,
      })
      .select("user_id");
    users = [...users, ...userSubscriptions];
  }

  const sendNotifications = uniqBy(users, "user_id").map((user) => {
    return {
      from: currentUserId,
      title,
      content,
      type,
      ticket_id: ticketId,
      to: user.user_id,
    };
  });

  return await Notification.query().insert(sendNotifications);
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
  ticketNotification,
  commentReactionNotification,
};
