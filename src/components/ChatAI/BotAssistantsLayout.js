import { getAssistants } from "@/services/bot-ai.services";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Segmented } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

function BotAssistantsLayout({ children }) {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["assistants"],
    () => getAssistants(),
    {}
  );

  const [value, setValue] = useState(router.query?.assistantId || "");
  const handleChange = (value) => {
    setValue(value);
    router.push(`/asn-connect/asn-ai-chat/${value}/threads`);
  };

  return (
    <div>
      <Skeleton loading={isLoading}>
        <Segmented
          value={value}
          options={data?.map((item) => ({
            label: item.name,
            value: item.id,
          }))}
          onChange={handleChange}
        />
      </Skeleton>
      {children}
    </div>
  );
}

export default BotAssistantsLayout;
