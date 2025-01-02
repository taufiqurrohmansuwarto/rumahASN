const UnorSiasn = require("@/models/ref-siasn-unor.model");
const UnorSimaster = require("@/models/sync-unor-master.model");
const RekonUnor = require("@/models/rekon/unor.model");

// unor siasn
export const getUnorSiasn = async () => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// unor simaster
export const getUnorSimaster = async () => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// rekon
export const getRekonUnor = async () => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
