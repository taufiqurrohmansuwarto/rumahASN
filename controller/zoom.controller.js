const KJUR = require("jsrsasign");
const qs = require("qs");

const sdkKey = process.env.ZOOM_MEETING_SDK_KEY;
const sdkSecret = process.env.ZOOM_MEETING_SDK_SECRET;

const generateSignature = (meetingNumber, role = 0) => {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  const oHeader = { alg: "HS256", typ: "JWT" };

  const oPayload = {
    sdkKey,
    mn: meetingNumber,
    role,
    iat: iat,
    exp: exp,
    appKey: sdkKey,
    tokenExp: iat + 60 * 60 * 2,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);

  return signature;
};

module.exports.zoomIndex = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const result = await zoomFetcher.get("/users/me/meetings");

    res.json({ code: 200, message: "OK", result: result?.data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.liveMeetings = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;

    const result = await zoomFetcher.get("/users/me/meetings?type=live");
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
    const { id } = req.query;
    const token = generateSignature(id, 0);
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.getSignatureAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    const token = generateSignature(id, 1);
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.createMeeting = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const body = req.body;
    const result = await zoomFetcher.post("/users/me/meetings", body);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.adminListMeetings = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;

    const result = await zoomFetcher.get("/users/me/meetings");
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.adminDeleteMeeting = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const { id } = req.query;
    const result = await zoomFetcher.delete(`/meetings/${id}`);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
