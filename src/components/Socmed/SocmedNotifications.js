import { asnConnectGetNotifications } from "@/services/socmed.services";
import { useQuery } from "@tanstack/react-query";
import { List } from "antd";
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
    <div>
      {JSON.stringify(data)}
      <List
        pagination={{
          current: query?.page,
          onChange: (page) => setQuery({ ...query, page }),
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        renderItem={(item) => <List.Item>yes</List.Item>}
        rowKey={(row) => row?.id}
        dataSource={data?.results}
      />
    </div>
  );
}

export default SocmedNotifications;
