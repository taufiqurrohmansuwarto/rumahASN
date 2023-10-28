import {
  findMeeting,
  removeMeeting,
  updateMeeting,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Divider, Modal, Table, message } from "antd";
import { useRouter } from "next/router";

function CoachingMeetings() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { mutate: remove, isLoading: isLoadingRemove } = useMutation(
    (id) => removeMeeting(id),
    {}
  );

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateMeeting(data),
    {
      onSuccess: () => {
        message.success("Coaching Clinic telah direset");
        queryClient.invalidateQueries(["meetings"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["meetings"]);
      },
    }
  );

  const handleHapus = () => {};

  const handleReset = (row) => {
    const payload = {
      id: row?.id,
      data: {
        status: "upcoming",
      },
    };

    Modal.confirm({
      title: "Reset Coaching Clinic",
      content: "Apakah anda yakin ingin mereset coaching clinic ini?",
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk: async () => {
        await update(payload);
      },
    });
  };

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
      title: "Status",
      dataIndex: "status",
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
            <Divider type="vertical" />
            <a onClick={() => handleReset(row)}>Reset</a>
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
