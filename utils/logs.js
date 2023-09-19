const LogSIASN = require("@/models/log-siasn.model");

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
