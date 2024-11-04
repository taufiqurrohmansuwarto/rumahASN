import { cariSeluruhRekanKerja } from "@/utils/ai-utils";
import { getDataUtamaMaster } from "@/utils/master.utils";

export const executeToolCall = async (functionName, args) => {
  const { organization_id, employee_number, fetcher, siasnRequest } =
    args?.user;

  try {
    const availableFunctions = {
      get_data_utama_siasn: async () => {
        try {
          const result = await getDataUtamaMaster(fetcher, employee_number);
          return result;
        } catch (error) {
          console.log(error);
          throw new Error("Failed to get data utama from SIASN");
        }
      },
      cari_usulan_siasn: async ({ tipe_usulan }) => {
        // tipe usulan harus kenaikan-pangkat, pemberhentian, skk, pg, dan pmk
        try {
          const url = `/siasn-ws/layanan/${tipe_usulan}/${employee_number}`;
          const result = await fetcher.get(url);
          const data = result?.data;
          if (!data) {
            return null;
          } else {
            return data;
          }
        } catch (error) {
          console.log(error);
          throw new Error("Failed to get usulan from SIASN");
        }
      },
      search_employee: async (query) => {
        // Your weather API implementation
        return [
          { id: 1, name: "John Doe", city: "Jakarta", country: "Indonesia" },
        ];
      },
      cari_peserta_spt: async ({ names }) => {
        const result = await cariSeluruhRekanKerja(organization_id);

        return result;
      },
    };

    if (!(functionName in availableFunctions)) {
      throw new Error(`Function ${functionName} not found`);
    }

    return await availableFunctions[functionName](args);
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
};
