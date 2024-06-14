import { asnConnectGetNotifications } from "@/services/socmed.services";
import { serializeCommentText } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, List } from "antd";
import React, { useState } from "react";

function SocmedNotifications() {
  const [query, setQuery] = useState({ page: 1 });

  const { data, isLoading } = useQuery(
    ["asn-connect-notifications", query],
    () => asnConnectGetNotifications(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  return (
    <Card>
      <Button type="primary" onClick={() => setQuery({ ...query, page: 1 })}>
        Mark as Read
      </Button>
      <List
        pagination={{
          current: query?.page,
          onChange: (page) => setQuery({ ...query, page }),
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        renderItem={(item) => (
          <List.Item>{serializeCommentText(item)}</List.Item>
        )}
        rowKey={(row) => row?.id}
        dataSource={data?.results}
      />
    </Card>
  );
}

export default SocmedNotifications;
