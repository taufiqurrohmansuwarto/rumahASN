const SiasnEmployees = require("@/models/siasn-employees.model");
const SyncPegawai = require("@/models/sync-pegawai.model");
const { difference } = require("lodash");

const comparePegawai = async (req, res) => {
    try {
        const user = req.user;
        const opdId = user.organization_id;
        const fetcher = req?.clientCredentialsFetcher;

        const employees = await SyncPegawai.query().where('skpd_id', 'ilike', `${opdId}%`);
        const nipEmployeesMaster = employees.map((employee) => employee.nip_master);
        const siasnEmployees = await SiasnEmployees.query().whereIn(
          "nip_baru",
          nipEmployeesMaster
        );
        const nipEmployeesSiasn = siasnEmployees.map(siasnEmployee => siasnEmployee.nip_baru)

        const diff = difference(nipEmployeesMaster, nipEmployeesSiasn);

        const result = await fetcher.get(
          `/master-ws/pemprov/opd/${opdId}/employees`
        );

        const hasil = result?.data?.map((item) => {
            const currentEmployees = siasnEmployees.find(siasnEmployee => siasnEmployee?.nip_baru === item?.nip_master);
            console.log(currentEmployees)
        });

        res.json({
            pegawaiSimaster: employees.length,
            pegawaiSiAsn: siasnEmployees.length,
            diff,
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({code: 400, message: 'internal server error'})
    }
}

module.exports = {comparePegawai}