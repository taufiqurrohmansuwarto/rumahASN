const TicketHistory = require("../models/tickets_histories.model");
const Ticket = require('@/models/tickets.model')

const insertTicketHistory = (ticketId, userId, status, comment) => {
  return TicketHistory.query().insert({
    ticket_id: ticketId,
    user_id: userId,
    status,
    comment,
  });
};

const allowUser = async (currentUser, ticketId){
  const result = await Ticket.query().findById(ticketId);
  const {id, role} = currentUser;

  

  if(!result){
    return false;
  } else {
     const ticketRequester = result?.requester;
     const ticketAssignee = result?.assignee
     
     return role === 'admin' || (role === 'assignee' && ticketAssignee === id) || (ticketRequester === id)
  }
}

module.exports = {
  insertTicketHistory,
  allowUser
};
