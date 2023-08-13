import { getSavedQuestions } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { List } from "antd";
import Link from "next/link";
import React, { useState } from "react";

function SavedQuestions() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery(
    ["saved-questions", query],
    () => getSavedQuestions(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  return (
    <>
      <List
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        pagination={{
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          onChange: (page) => {
            setQuery({
              ...query,
              page: page,
            });
          },
        }}
        renderItem={(item) => (
          <List.Item>
            <Link href={`/customers-tickets/${item?.ticket?.id}`}>
              {item?.ticket?.title}
            </Link>
          </List.Item>
        )}
      />
    </>
  );
}

export default SavedQuestions;
