import { usersHistories } from "@/services/index";
import { formatDateFromNow, jenisRiwayat } from "@/utils/client-utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, List, Typography } from "antd";
import Link from "next/link";
import React from "react";

const fetchItems = async ({ pageParam = 1, queryKey }) => {
  const [_, limit] = queryKey;
  const response = await usersHistories({
    page: pageParam,
    limit: limit,
  });

  return response;
};

const LinkTicket = ({ item }) => {
  return (
    <>
      {item?.ticket && (
        <>
          {" "}
          <Typography.Text>pada pertanyaan dengan judul</Typography.Text>{" "}
          <Link href={`/customers-tickets/${item?.ticket?.id}`}>
            <a>{item?.ticket?.title}</a>
          </Link>
        </>
      )}
    </>
  );
};

const HistoriesData = ({ data, loading, hasNextPage, fetchNextPage }) => {
  return (
    <>
      <List
        renderItem={(item) => (
          <List.Item>
            {jenisRiwayat(item?.action)}
            <LinkTicket item={item} /> {formatDateFromNow(item?.created_at)}
          </List.Item>
        )}
        footer={
          hasNextPage && (
            <Button
              style={{
                textAlign: "center",
              }}
              onClick={() => fetchNextPage()}
            >
              Load More
            </Button>
          )
        }
        rowKey={(row) => row?.id}
        loading={loading}
        dataSource={data}
      />
    </>
  );
};

function UserActivities() {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    ["user-histories", 10],
    fetchItems,
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.hasNextPage) return lastPage.page + 1;
        return false;
      },
    }
  );
  return (
    <HistoriesData
      data={data?.pages?.flatMap((page) => page?.result)}
      loading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

export default UserActivities;
