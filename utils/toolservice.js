import { cariSeluruhRekanKerja } from "@/utils/ai-utils";

export const executeToolCall = async (functionName, args) => {
  const { organization_id } = args?.user;

  try {
    const availableFunctions = {
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
