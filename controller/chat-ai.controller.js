import { trim } from "lodash";
import OpenAI from "openai";
const SyncPegawai = require("@/models/sync-pegawai.model");

// create available function
const availableFunctions = {
  // Fungsi untuk mencari data karyawan
  search_employee: async (args) => {
    // const employeeNumber = trim(args.employee_number);
    // const name = trim(args.name);
    // const employee = SyncPegawai.query()
    //   .where((builder) => {
    //     if (employeeNumber) {
    //       builder.where("nip_master", "ilike", `%${employeeNumber}%`);
    //     }
    //     if (name) {
    //       builder.where("nama_master", "ilike", `%${name}%`);
    //     }
    //   })
    //   .first();

    // if (!employee) {
    //   throw new Error("Employee not found");
    // } else {
    //   return employee;
    // }
    return null;
  },

  // Fungsi untuk mengecek sisa cuti
  check_leave_balance: async (args) => {
    // Simulasi data cuti
    const leaveDB = {
      EMP001: {
        annual: 12,
        sick: 12,
        used_annual: 5,
        used_sick: 2,
      },
      EMP002: {
        annual: 12,
        sick: 12,
        used_annual: 3,
        used_sick: 1,
      },
    };

    const leaveData = leaveDB[args.employee_id];
    if (!leaveData) {
      throw new Error("Leave data not found");
    }
    return {
      remaining_annual: leaveData.annual - leaveData.used_annual,
      remaining_sick: leaveData.sick - leaveData.used_sick,
      total_annual: leaveData.annual,
      total_sick: leaveData.sick,
      used_annual: leaveData.used_annual,
      used_sick: leaveData.used_sick,
    };
  },

  // Fungsi untuk membuat pengajuan cuti
  submit_leave_request: async (args) => {
    // Simulasi pembuatan pengajuan cuti
    const leaveId = "LV" + Math.random().toString(36).substr(2, 9);
    return {
      leave_id: leaveId,
      employee_id: args.employee_id,
      type: args.leave_type,
      start_date: args.start_date,
      end_date: args.end_date,
      status: "Pending",
      submitted_at: new Date().toISOString(),
    };
  },
};

const waitForRunCompletion = async (threadId, runId) => {
  let runStatus;
  do {
    runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (runStatus.status === "failed") {
      throw new Error("Assistant run failed");
    }
    if (runStatus.status === "expired") {
      throw new Error("Assistant run expired");
    }
    if (
      runStatus.status !== "completed" &&
      runStatus.status !== "requires_action"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (
    runStatus.status !== "completed" &&
    runStatus.status !== "requires_action"
  );

  return runStatus;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getChat = async (req, res) => {
  try {
    const { threadId, message } = req.body;

    const currentThreadId =
      threadId ?? (await openai.beta.threads.create({})).id;
    console.log("currentThreadId", currentThreadId);

    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: process.env.ASSISTANT_ID,
    });

    let runStatus;
    do {
      runStatus = await waitForRunCompletion(currentThreadId, run.id);

      if (
        runStatus.status === "requires_action" &&
        runStatus.required_action?.type === "submit_tool_outputs"
      ) {
        const toolCalls =
          runStatus.required_action.submit_tool_outputs.tool_calls;

        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            let functionResult;
            if (functionName in availableFunctions) {
              try {
                functionResult = await availableFunctions[functionName](
                  functionArgs
                );
              } catch (error) {
                console.error(
                  `Error executing function ${functionName}:`,
                  error
                );
                functionResult = { error: error.message };
              }
            } else {
              functionResult = { error: `Function ${functionName} not found` };
            }

            return {
              tool_call_id: toolCall.id,
              output: JSON.stringify(functionResult),
            };
          })
        );

        runStatus = await openai.beta.threads.runs.submitToolOutputs(
          currentThreadId,
          run.id,
          { tool_outputs: toolOutputs }
        );
      }
    } while (runStatus.status !== "completed");

    const messages = await openai.beta.threads.messages.list(currentThreadId);
    const latestMessage = messages.data[0];

    return res.json({
      threadId: currentThreadId,
      message: {
        id: latestMessage.id,
        role: latestMessage.role,
        content: latestMessage.content[0].text.value,
      },
      status: "completed",
    });
  } catch (error) {
    console.error("Error in assistant:", error);
    return res.status(500).json({
      error: error.message || "An error occurred",
      status: "error",
    });
  }
};

module.exports = {
  getChat,
};
