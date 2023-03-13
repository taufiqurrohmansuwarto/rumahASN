const TicketHistory = require("../models/tickets_histories.model");

const insertTicketHistory = (ticketId, userId, status, comment) => {
  return TicketHistory.query().insert({
    ticket_id: ticketId,
    user_id: userId,
    status,
    comment,
  });
};

module.exports = {
  insertTicketHistory,
};
