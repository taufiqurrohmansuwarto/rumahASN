const { createLogSIASN } = require("@/utils/logs");
const { createHukdis } = require("@/utils/siasn-utils");

const postHukdisByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const nip = req.query.nip;
    const pns = await dataUtama(fetcher, nip);

    const data = req?.body;
    const payload = { ...data, pnsOrangId: pns.id };
    await createHukdis(request, payload);

    await createLogSIASN({
      userId: req?.user?.customId,
      type: "create",
      siasnService: "hukuman-disiplin",
      employeeNumber: req?.query?.nip,
      request_data: JSON.stringify(payload),
    });

    res.json({
      message: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "internal server error",
    });
  }
};

module.exports = {
  postHukdisByNip,
};
