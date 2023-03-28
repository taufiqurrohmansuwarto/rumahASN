import { publikasiCasn } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card, List } from "antd";
import React, { useState } from "react";

function PublikasiCASN() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 4,
    search: "",
  });

  const { data, isLoading } = useQuery(
    ["publikasi-casn"],
    () => publikasiCasn(query),
    {}
  );

  return (
    <List
      loading={isLoading}
      dataSource={data?.results}
      renderItem={(item) => {
        return (
          <List.Item>
            <List.Item.Meta description={item?.judul} />
          </List.Item>
        );
      }}
    />
  );
}

export default PublikasiCASN;
