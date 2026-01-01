module.exports = async (req, res, next) => {
  try {
    const { status_kepegawaian } = req.user;

    const validStatusKepegawaian = [
      "PNS",
      "PPPK",
      "CPNS",
      "NON ASN",
      "PPPK PARUH WAKTU",
    ];
    const isAuthorized = validStatusKepegawaian.includes(status_kepegawaian);

    if (!isAuthorized) {
      return res.status(403).json({
        code: 403,
        message: "Akses ditolak. Status kepegawaian tidak valid.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
