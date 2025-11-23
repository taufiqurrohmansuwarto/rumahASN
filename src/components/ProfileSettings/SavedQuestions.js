import { getSavedQuestions } from "@/services/index";
import { Avatar, Box, Flex, Stack, Text } from "@mantine/core";
import { IconBookmark, IconEye } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Empty, Pagination } from "antd";
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

  const handlePageChange = (page) => {
    setQuery({
      ...query,
      page: page,
    });
  };

  if ((!data?.data || data?.data?.length === 0) && !isLoading) {
    return (
      <Box style={{ padding: "48px 24px", textAlign: "center" }}>
        <Empty
          description={
            <Text size="13px" c="dimmed">
              Belum ada pertanyaan yang disimpan
            </Text>
          }
        />
      </Box>
    );
  }

  return (
    <Stack spacing={8}>
      <Stack spacing={4}>
        {data?.data?.map((item) => (
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
            <Flex gap="sm" align="center" justify="space-between">
              <Flex gap="sm" align="flex-start" style={{ flex: 1, minWidth: 0 }}>
                <Avatar
                  size={32}
                  radius="md"
                  style={{
                    backgroundColor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    flexShrink: 0,
                  }}
                >
                  <IconBookmark size={14} style={{ color: "#F59E0B" }} />
                </Avatar>

                <Stack spacing={2} style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/customers-tickets/${item?.ticket?.id}`}>
                    <Text
                      size="12px"
                      fw={600}
                      style={{
                        color: "#1F2937",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                      lineClamp={1}
                    >
                      {item?.ticket?.title}
                    </Text>
                  </Link>
                  <Text size="11px" c="dimmed">
                    Disimpan
                  </Text>
                </Stack>
              </Flex>

              <Link href={`/customers-tickets/${item?.ticket?.id}`}>
                <Button type="primary" size="small" icon={<IconEye size={14} />}>
                  Lihat
                </Button>
              </Link>
            </Flex>
          </Box>
        ))}
      </Stack>

      {data?.total > query.limit && (
        <Flex justify="center" style={{ paddingTop: 8 }}>
          <Pagination
            current={query.page}
            total={data?.total}
            pageSize={query.limit}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} dari ${total} pertanyaan`
            }
            size="small"
          />
        </Flex>
      )}
    </Stack>
  );
}

export default SavedQuestions;
