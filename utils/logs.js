const LogSIASN = require("@/models/log-siasn.model");
const LogBsre = require("@/models/log-bsre.model");

module.exports.createLogSIASN = async ({
  userId,
  type,
  siasnService,
  employeeNumber,
}) => {
  try {
    const result = await LogSIASN.query().insert({
      user_id: userId,
      type,
      siasn_service: siasnService,
      employee_number: employeeNumber,
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.createLogBsre = async ({
  userId,
  webinarParticipantId,
  log,
}) => {
  const result = await LogBsre.query().insert({
    user_id: userId,
    webinar_series_participate_id: webinarParticipantId,
    log,
  });
  return result;
};