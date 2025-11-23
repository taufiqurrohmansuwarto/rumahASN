import { deleteSavedReplies, getSavedReplies } from "@/services/index";
import { Avatar, Box, Flex, Stack, Text } from "@mantine/core";
import { IconEdit, IconMessage, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Empty, message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { truncate } from "lodash";
import { useRouter } from "next/router";
import CreateSavedReplies from "./CreateSavedReplies";

function ListSavedReplies() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const gotoEdit = (id) => {
    router.push(`/settings/profile/saved-replies/${id}/edit`);
  };

  const { mutate: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => deleteSavedReplies(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("saved-replies");
        message.success("Template berhasil dihapus");
      },
      onError: () => {
        message.error("Gagal menghapus template");
      },
    }
  );

  const handleRemove = (id, name) => {
    Modal.confirm({
      title: "Hapus Template",
      icon: <ExclamationCircleOutlined />,
      content: `Hapus template "${name}"?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      centered: true,
      onOk() {
        if (!isLoadingRemove) {
          remove(id);
        }
      },
    });
  };

  const { data, isLoading } = useQuery(
    ["saved-replies"],
    () => getSavedReplies(),
    {
      refetchOnWindowFocus: false,
    }
  );

  if ((!data || data?.length === 0) && !isLoading) {
    return (
      <Stack spacing={8}>
        <Box style={{ padding: "48px 24px", textAlign: "center" }}>
          <Empty
            description={
              <Text size="13px" c="dimmed">
                Belum ada template balasan
              </Text>
            }
          />
        </Box>
        <CreateSavedReplies />
      </Stack>
    );
  }

  return (
    <Stack spacing={8}>
      <Stack spacing={4}>
        {data?.map((item) => (
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
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    flexShrink: 0,
                  }}
                >
                  <IconMessage size={14} style={{ color: "#EF4444" }} />
                </Avatar>

                <Stack spacing={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="12px" fw={600} lineClamp={1}>
                    {item?.name}
                  </Text>
                  <Text size="11px" c="dimmed" lineClamp={2}>
                    {truncate(item?.content, { length: 80 })}
                  </Text>
                </Stack>
              </Flex>

              <Flex gap={4} style={{ flexShrink: 0 }}>
                <Button
                  type="primary"
                  size="small"
                  icon={<IconEdit size={14} />}
                  onClick={() => gotoEdit(item?.id)}
                >
                  Edit
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<IconTrash size={14} />}
                  loading={isLoadingRemove}
                  onClick={() => handleRemove(item?.id, item?.name)}
                >
                  Hapus
                </Button>
              </Flex>
            </Flex>
          </Box>
        ))}
      </Stack>

      <CreateSavedReplies />
    </Stack>
  );
}

export default ListSavedReplies;
