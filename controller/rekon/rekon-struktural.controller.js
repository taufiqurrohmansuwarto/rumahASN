import { handleError } from "@/utils/helper/controller-helper";
import { dataUtama } from "@/utils/siasn-utils";

const SiasnEmployee = require("@/models/siasn-employees.model");

export const syncRekonStruktural = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const employees = await SiasnEmployee.query()
      .select("nip_baru")
      .where("jenis_jabatan_id", "=", "1")
      .whereNotNull("eselon_id");

    for (const employee of employees) {
      // Add delay of 2-3 seconds to avoid DDOS detection
      const delay = Math.floor(Math.random() * 1000) + 2000; // 2000-3000 ms
      await new Promise((resolve) => setTimeout(resolve, delay));

      const result = await dataUtama(request, employee.nip_baru);
      await SiasnEmployee.query()
        .where("nip_baru", "=", employee.nip_baru)
        .update({
          eselon_id: result.eselonId,
          eselon_level: result.eselonLevel,
        });
      console.log(`${employee.nip_baru} - ${result.eselonId}`);
    }

    res.json({ message: "success" });
  } catch (error) {
    handleError(res, error);
  }
};
