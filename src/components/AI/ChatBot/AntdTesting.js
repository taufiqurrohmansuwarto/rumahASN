import { AssistantAIServices } from "@/services/assistant-ai.services";
import { Button } from "antd";
import React from "react";

const contentChunks = ["He", "llo", ", w", "or", "ld!"];
function mockReadableStream() {
  const sseChunks = [];
  for (let i = 0; i < contentChunks.length; i++) {
    const sseEventPart = `event: message\ndata: {"id":"${i}","content":"${contentChunks[i]}"}\n\n`;
    sseChunks.push(sseEventPart);
  }
  return new ReadableStream({
    async start(controller) {
      for (const chunk of sseChunks) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        console.log(chunk);
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });
}

async function getMockStream() {
  try {
    const response = await AssistantAIServices.testChatCompletion();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            console.log(chunk);
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });
  } catch (error) {
    console.error("Error in mockStream:", error);
    throw error;
  }
}

function AntdTesting() {
  const [lines, setLines] = React.useState([]);
  //   const content = lines.map((line) => JSON?.parse(line.data).content).join("");
  const request = async () => {
    const response = await AssistantAIServices.testChatCompletion();

    for await (const chunk of response) {
      setLines((prev) => [...prev, chunk]);
    }
  };
  const mockStream = async () => {
    try {
      const response = await AssistantAIServices.testChatCompletion();
      response.data.on("data", (data) => {
        console.log(data);
      });
    } catch (error) {
      console.error("Error in mockStream:", error);
    }
  };

  const mockStream2 = async () => {
    await mockReadableStream();
  };

  return (
    <>
      <Button onClick={request}>Request</Button>
      <Button onClick={mockStream}>MockStream</Button>
      <Button onClick={mockStream2}>MockStream2</Button>
      <Button
        onClick={() => {
          // reset
          setLines([]);
        }}
      >
        Reset
      </Button>
      {JSON.stringify(lines?.join(""))}
      {/* <Bubble content={lines} /> */}
    </>
  );
}

export default AntdTesting;
