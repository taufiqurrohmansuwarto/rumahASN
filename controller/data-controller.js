// ini merupakan controller data untuk memangil microservcies
const getEmployees = async (req, res) => {
  try {
    const { fetcher } = req;
    let url = "/master/employees";
    if (req?.query?.search) {
      url = `/master/employees?search=${req?.query?.search}`;
    }
    const result = await fetcher.get(url);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const getDepartments = async (req, res) => {
  try {
    const { fetcher } = req;
    const result = await fetcher.get("/master/departments");
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  getEmployees,
  getDepartments,
};
