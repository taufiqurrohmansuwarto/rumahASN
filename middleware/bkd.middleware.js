const onlyBkd = (req, res, next) => {
  const { user } = req;
  if (user?.organization_id?.toString()?.slice(0, 3) === "123") {
    next();
  } else {
    res.status(403).json({ code: 403, message: "Forbidden" });
  }
};

export default onlyBkd;
