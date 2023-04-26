const User = require("@/models/users.model");
const Ticket = require("@/models/tickets.model");
const { trends3MonthAgo } = require("@/utils/query-utils");
const {
  agentsPerformances: agentsPerformancesQuery,
} = require("@/utils/query-utils");

const serializeTrends = (data) => {
  return data?.map((item) => ({
    ...item,
    bidang: item?.category_field?.label,
  }));
};

const agentsPerformances = async (req, res) => {
  try {
    const result = await agentsPerformancesQuery();
    res.json(result?.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const customersSatistactions = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const responsesTimes = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const trends = async (req, res) => {
  try {
    const hasil = await trends3MonthAgo();
    const data = hasil?.rows;
    res.json(serializeTrends(data));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  agentsPerformances,
  customersSatistactions,
  responsesTimes,
  trends,
};
