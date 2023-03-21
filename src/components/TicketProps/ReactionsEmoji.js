import { formatTooltipUsers } from "@/utils/client-utils";
import { Tag, Space, Tooltip, Typography } from "antd";
import { useSession } from "next-auth/react";
import React from "react";

function ReactionsEmoji({ reactions }) {
  const { data } = useSession();
  return (
    <>
      {reactions?.length > 0 && (
        <Space size="small">
          {reactions?.map((reaction) => (
            <div key={reaction?.reaction}>
              <Tooltip
                title={formatTooltipUsers(data?.user?.id, reaction?.users)}
              >
                <Tag>
                  <Typography.Text>{reaction?.total_users}</Typography.Text>
                  <Typography.Text>{reaction?.reaction}</Typography.Text>
                </Tag>
              </Tooltip>
            </div>
          ))}
        </Space>
      )}
    </>
  );
}

export default ReactionsEmoji;
