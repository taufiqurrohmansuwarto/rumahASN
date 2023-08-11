const UserHistory = require("@/models/users-histories.model");

export const createHistory = async (userId, action, type, ticketId = null) => {
  try {
    await UserHistory.query().insert({
      user_id: userId,
      action,
      type,
      ticket_id: ticketId,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
