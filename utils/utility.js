const UserHistory = require("@/models/users-histories.model");

export const createHistory = async (
  userId,
  action,
  type,
  ticketId = null,
  ipAddress = null,
  userAgent = null
) => {
  try {
    await UserHistory.query().insert({
      user_id: userId,
      action,
      type,
      ticket_id: ticketId,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new Error("❌ cosineSimilarity: input bukan array");
  }
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
};
