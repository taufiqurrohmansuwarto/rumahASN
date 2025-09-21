const { getProgressReport } = require("@/utils/master.utils");

export const getLaporanProgress = async (req, res) => {
  try {
    const { fetcher } = req;
    const result = await getProgressReport(fetcher, "123");
    res.json(result?.data);
  } catch (error) {
    console.log(error);
  }
};
