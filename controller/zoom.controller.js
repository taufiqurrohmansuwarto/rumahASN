module.exports.zoomIndex = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const result = await zoomFetcher.get("/users/me/meetings?type=live");

    res.json({ code: 200, message: "OK", result: result?.data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.listMeetings = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const result = await zoomFetcher.get("/users/me/meetings?type=upcoming");
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.createMeeting = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports.detailMeeting = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports.joinMeeting = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports.getSignature = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const meetingNumber = req?.query?.meetingNumber;
    const role = req?.query?.role;
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
