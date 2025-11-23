import { usersHistories } from "@/services/index";
import { formatDateFromNow, jenisRiwayat } from "@/utils/client-utils";
import { Avatar, Box, Flex, Stack, Text } from "@mantine/core";
import { IconFileText } from "@tabler/icons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, Empty } from "antd";
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
          <Text size="12px" c="dimmed" component="span">
            pada
          </Text>{" "}
          <Link href={`/customers-tickets/${item?.ticket?.id}`}>
            <Text
              size="12px"
              component="span"
              style={{
                color: "#6366F1",
                textDecoration: "underline",
              }}
            >
              {item?.ticket?.title}
            </Text>
          </Link>
        </>
      )}
    </>
  );
};

const HistoriesData = ({ data, loading, hasNextPage, fetchNextPage }) => {
  if (!data || data.length === 0) {
    return (
      <Box style={{ padding: "48px 24px", textAlign: "center" }}>
        <Empty
          description={
            <Text size="13px" c="dimmed">
              Belum ada aktivitas yang tercatat
            </Text>
          }
        />
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      {data.map((item) => (
        <Box
          key={item?.id}
          p="sm"
          style={{
            borderRadius: 6,
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            transition: "all 0.2s ease",
          }}
          sx={{
            "&:hover": {
              backgroundColor: "#F9FAFB",
            },
          }}
        >
          <Flex gap="sm" align="flex-start">
            <Avatar
              size={32}
              radius="md"
              style={{
                backgroundColor: "#EEF2FF",
                border: "1px solid #C7D2FE",
                flexShrink: 0,
              }}
            >
              <IconFileText size={14} style={{ color: "#6366F1" }} />
            </Avatar>

            <Stack spacing={2} style={{ flex: 1, minWidth: 0 }}>
              <Flex gap={4} align="center" wrap="wrap">
                <Text size="12px" fw={600}>
                  {jenisRiwayat(item?.action)}
                </Text>
                <LinkTicket item={item} />
              </Flex>
              <Text size="11px" c="dimmed">
                {formatDateFromNow(item?.created_at)}
              </Text>
            </Stack>
          </Flex>
        </Box>
      ))}

      {hasNextPage && (
        <Box style={{ textAlign: "center", paddingTop: 8 }}>
          <Button
            type="primary"
            onClick={() => fetchNextPage()}
            size="small"
            loading={loading}
          >
            Muat Lebih Banyak
          </Button>
        </Box>
      )}
    </Stack>
  );
};

function UserActivities() {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(["user-histories", 10], fetchItems, {
      getNextPageParam: (lastPage) => {
        if (lastPage.hasNextPage) return lastPage.page + 1;
        return false;
      },
      keepPreviousData: true,
    });

  return (
    <HistoriesData
      data={data?.pages?.flatMap((page) => page?.result)}
      loading={isLoading || isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

export default UserActivities;
