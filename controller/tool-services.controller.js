const BotAssistantChatThreads = require("@/models/assistant_bot/chat-threads.model");
const BotAssistantMessages = require("@/models/assistant_bot/messages.model");
import {
  cariPejabat,
  cariSeluruhRekanKerja,
  getPengguna,
} from "@/utils/ai-utils";
import { chatHistoryService } from "@/utils/chatHistoryService";
import { getDataUtamaMaster } from "@/utils/master.utils";
import {
  generateDocument,
  generateDocumentLupaAbsen,
  serializeDataUtama,
} from "@/utils/toolservice";
import axios from "axios";
const Minio = require("minio");
const minioConfig = {
  port: parseInt(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: process.env.MINIO_ENDPOINT,
};

const mc = new Minio.Client(minioConfig);

const fetchDataUsulan = async (fetcher, tipeUsulan, employeeNumber) => {
  const url = `/siasn-ws/layanan/${tipeUsulan}/${employeeNumber}`;
  const result = await fetcher.get(url);
  const response = result?.data;
  return response;
};

export const saveMessageAssistant = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = JSON.parse(data);
    await chatHistoryService.saveMessage(
      currentData?.threadId,
      currentData?.content,
      currentData?.role,
      currentData?.metadata,
      currentData?.user_id
    );

    res
      .status(200)
      .json({ success: true, message: "Message berhasil di simpan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveThreadAssistant = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = JSON.parse(data);

    const getThread = await BotAssistantChatThreads.query().findById(
      currentData?.id
    );

    if (!getThread) {
      const data = {
        id: currentData?.id,
        user_id: currentData?.user_id,
        title: currentData?.title,
        status: "active",
        assistant_id: currentData?.assistant_id,
      };

      await chatHistoryService.saveThread(
        data?.id,
        data?.user_id,
        data?.title,
        data?.assistant_id
      );
      return res
        .status(200)
        .json({ success: true, message: "Thread berhasil di simpan" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Thread sudah ada" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkUsulan = async (req, res) => {
  try {
    const data = req?.body;

    const currentData = JSON.parse(data);

    const accessToken = currentData?.accessToken;
    const employeeNumber = currentData?.employee_number;
    const tipeUsulan = currentData?.tipe_usulan;

    const fetcher = axios.create({
      baseURL: process.env.APIGATEWAY_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await fetchDataUsulan(fetcher, tipeUsulan, employeeNumber);

    res.json({
      success: true,
      message: "Usulan berhasil di cek",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAtasanLangsung = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPesertaSpt = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = JSON.parse(data);
    const result = await cariSeluruhRekanKerja(currentData?.organization_id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPejabat = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = JSON.parse(data);
    const organizationId = currentData?.organization_id;
    const result = await cariPejabat(organizationId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDataUtamaSiasn = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = JSON.parse(data);
    const fetcher = axios.create({
      baseURL: process.env.APIGATEWAY_URL,
      headers: {
        Authorization: `Bearer ${currentData?.accessToken}`,
      },
    });

    const result = await getDataUtamaMaster(
      fetcher,
      currentData?.employee_number
    );

    const resultJson = serializeDataUtama(result);

    res.json(resultJson);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateDocumentSpt = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = JSON.parse(data);
    const result = await generateDocument(currentData?.data, mc);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateDocLupaAbsen = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = JSON.parse(data);
    const parameter = currentData?.data;

    let promises = [];
    parameter?.dataLupaAbsen?.forEach((item) => {
      promises.push(
        generateDocumentLupaAbsen(
          mc,
          parameter?.tglPembuatan,
          parameter?.informasiPengguna,
          parameter?.informasiAtasan,
          item?.tanggal
        )
      );
    });

    const result = await Promise.all(promises);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDataPengguna = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = JSON.parse(data);
    const result = await getPengguna(currentData?.employee_number);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
