const { grantLists } = require("@/utils/grants");
const ac = require("accesscontrol");

module.exports = async (req, res, next) => {
  try {
    const { app_role } = req?.user;
    const grants = await grantLists();
    const acInstance = new ac(grants);

    const permission = acInstance.can(app_role?.name).updateAny("seal");


    if (!permission?.granted) {
      res.status(403).json({ code: 403, message: "Forbidden" });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: error });
  }
};
