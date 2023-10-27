import {
  findMeeting,
  removeMeeting,
  updateMeeting,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Divider, Table } from "antd";
import { useRouter } from "next/router";

function CoachingMeetings() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { mutate: remove, isLoading: isLoadingRemove } = useMutation(
    (id) => removeMeeting(id),
    {}
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (id) => updateMeeting(id),
    {}
  );

  const handleHapus = () => {};

  const { data, isLoading } = useQuery(
    ["meetings", router?.query],
    () => findMeeting(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  const gotoDetail = (id) => {
    router.push(`/coaching-clinic-consultant/${id}/detail`);
  };

  const columns = [
    {
      title: "Judul",
      dataIndex: "title",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, row) => {
        return (
          <>
            <a onClick={() => gotoDetail(row?.id)}>Detail</a>
            <Divider type="vertical" />
            <a>Update</a>
            <Divider type="vertical" />
            <a>Hapus</a>
          </>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      loading={isLoading}
      rowKey={(row) => row?.id}
      dataSource={data?.data}
    />
  );
}

export default CoachingMeetings;
