import { chatHistoryService } from "@/utils/chatHistoryService";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAssistants = async (req, res) => {
  try {
    const { data } = await openai.beta.assistants.list();
    const result = data?.map((item) => ({
      ...item,
      label: item.name,
      key: item.id,
    }));
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

export const userThreads = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { assistantId } = req?.query;
    const result = await chatHistoryService.getUserThreads(
      customId,
      assistantId
    );

    const threads = result?.map((item) => ({
      ...item,
      label: item.title,
      key: item.id,
    }));

    res.json(threads);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

export const userThreadMessages = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { threadId } = req?.query;
    const result = await chatHistoryService.getThreadMessages(
      customId,
      threadId
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};
