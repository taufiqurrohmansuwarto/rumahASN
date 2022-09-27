import axios from "axios";
import { getSession } from "next-auth/react";

const auth = async (req, res, next) => {
  try {
    const data = await getSession({ req });
    if (data) {
      const { accessToken: token } = data;
      const userId = data?.user?.id?.split("|")?.[1];
      const customId = data?.user?.id;

      req.user = {
        ...data?.user,
        userId: parseInt(userId),
        customId,
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
