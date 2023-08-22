module.exports.getRwPendidikanMaster = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-pendidikan`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};
