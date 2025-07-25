// using api key for check
export const checkApiKey = (req, res, next) => {
  const authHeaders = req.headers.authorization;

  if (!authHeaders) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const [type, token] = authHeaders.split(" ");
  if (type !== "Bearer" || token !== process.env.API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

// batasi akses berdasarkan origin
export const checkOrigin = (req, res, next) => {
  const referer = req.headers.referer;
  const allowedOrigin = process.env.ALLOWED_ORIGIN;

  if (!referer || !referer.startsWith(allowedOrigin)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  next();
};

export const checkRole = (req, res, next) => {
  const currentData = req?.body;
  const status_kepegawaian = currentData?.status_kepegawaian;

  const asn =
    status_kepegawaian === "PNS" ||
    status_kepegawaian === "PPPK" ||
    status_kepegawaian === "CPNS";

  if (!asn) {
    res.status(403).json({ success: false, message: "Forbidden" });
  } else {
    req.currentUser = currentData;
    next();
  }
};
