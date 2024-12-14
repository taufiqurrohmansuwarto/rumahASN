import { useAssistant } from "ai/react";
import { Spin } from "antd";
import { useSession } from "next-auth/react";

export default function FormTest() {
  const { data: session } = useSession();
  const { status, messages, input, submitMessage, handleInputChange } =
    useAssistant({
      api: "/helpdesk/api/assistant/test",
      body: {
        user: session?.user,
      },
    });

  return (
    <div>
      {JSON.stringify({ messages, status })}
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{`${m.role}: `}</strong>
          {m.role !== "data" && m.content}
          {m.role === "data" && (
            <>
              {m.data.description}
              <br />
              <pre className={"bg-gray-200"}>
                {JSON.stringify(m.data, null, 2)}
              </pre>
            </>
          )}
        </div>
      ))}

      {status === "in_progress" && <Spin />}

      <form onSubmit={submitMessage}>
        <input
          disabled={status !== "awaiting_message"}
          value={input}
          placeholder="What is the temperature in the living room?"
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
