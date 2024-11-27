import { cariPejabat, cariSeluruhRekanKerja } from "@/utils/ai-utils";
import { getDataUtamaMaster } from "@/utils/master.utils";
import axios from "axios";
import { TemplateHandler } from "easy-template-x";
import { uploadFileUsulan } from "./index";

export const generateDocument = async (data, minio) => {
  try {
    const doc = await axios.get(
      "https://siasn.bkd.jatimprov.go.id:9000/public/docx-something.docx",
      {
        responseType: "arraybuffer",
      }
    );

    const template = new TemplateHandler();
    const result = await template.process(doc.data, data);

    // file must containt file size and mimetype
    const fileBuffer = Buffer.from(result, "utf-8");
    const fileMimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const fileSize = fileBuffer.length;

    const file = {
      buffer: fileBuffer,
      mimetype: fileMimeType,
      size: fileSize,
    };

    const filename = `testing.docx`;

    await uploadFileUsulan(minio, filename, file);
    return `https://siasn.bkd.jatimprov.go.id:9000/public/${filename}`;
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error("Failed to generate document");
  }
};

export const executeToolCall = async (functionName, args) => {
  const { organization_id, employee_number, fetcher, siasnRequest, minio } =
    args?.user;

  try {
    const availableFunctions = {
      get_peserta_spt: async ({ names }) => {
        try {
          const result = await cariSeluruhRekanKerja(organization_id);
          return result;
        } catch (error) {
          throw new Error("Failed to get peserta spt");
        }
      },
      get_pejabat: async () => {
        try {
          const result = await cariPejabat(organization_id);
          return result;
        } catch (error) {
          throw new Error("Failed to get pejabat");
        }
      },
      generate_document_spt: async ({ type, data }) => {
        try {
          console.log(data);
          const url = await generateDocument(data, minio);
          return {
            url,
          };
        } catch (error) {
          throw new Error("Failed to generate peserta spt");
        }
      },
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
