const authEdge = async (req, res, next) => {
  try {
    console.log("test");
    next();
  } catch (error) {
    console.log(error);
  }
};

export default authEdge;
