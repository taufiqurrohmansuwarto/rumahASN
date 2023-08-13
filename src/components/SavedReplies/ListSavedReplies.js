import { deleteSavedReplies, getSavedReplies } from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { List, message } from "antd";
import { truncate } from "lodash";
import { useRouter } from "next/router";

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
        message.success("Balasan disimpan berhasil dihapus");
      },
      onError: () => {
        message.error(
          "Gagal menghapus balasan disimpan, silahkan coba lagi nanti"
        );
      },
    }
  );

  const handleRemove = (id) => {
    if (!isLoadingRemove) {
      remove(id);
    }
  };

  const { data, isLoading } = useQuery(
    ["saved-replies"],
    () => getSavedReplies(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <List
      dataSource={data}
      size="small"
      rowKey={(row) => row?.id}
      loading={isLoading}
      renderItem={(item) => (
        <List.Item
          actions={[
            <a key="hapus" onClick={() => handleRemove(item?.id)}>
              Hapus
            </a>,
            <a key="edit" onClick={() => gotoEdit(item?.id)}>
              Edit
            </a>,
          ]}
        >
          <List.Item.Meta
            title={item?.name}
            description={truncate(item?.content)}
          />
        </List.Item>
      )}
    />
  );
}

export default ListSavedReplies;
