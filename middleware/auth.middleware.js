import { getSession } from "next-auth/react";
const User = require("../models/users.model");

const auth = async (req, res, next) => {
  try {
    const data = await getSession({ req });
    if (data) {
      const userId = data?.user?.id?.split("|")?.[1];
      const customId = data?.user?.id;

      const result = await User.query().where("custom_id", customId).first();
      req.user = {
        ...data?.user,
        userId: parseInt(userId),
        customId,
        current_role: result?.current_role,
      };

      next();
    } else {
      res.status(401).json({ code: 401, message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default auth;
