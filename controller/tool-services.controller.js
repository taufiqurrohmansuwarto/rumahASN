const BotAssistantChatThreads = require("@/models/assistant_bot/chat-threads.model");
const BotAssistantMessages = require("@/models/assistant_bot/messages.model");
import { chatHistoryService } from "@/utils/chatHistoryService";
import axios from "axios";

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
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPejabat = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateDocumentSpt = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPegawai = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
