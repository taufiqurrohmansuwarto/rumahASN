module.exports = (role) => async (req, res, next) => {
  try {
    const {} = req.user;
    next();
  } catch (error) {
    console.log(error);
  }
};
