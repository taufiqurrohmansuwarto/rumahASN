import { getAudioVerbatim } from "@/services/assesor-ai.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button, message, Table } from "antd";
import { transribeAudioVerbatim } from "@/services/assesor-ai.services";

const TransribeButton = ({ audioId, sessionId }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading: isTransribing } = useMutation({
    mutationFn: (data) => transribeAudioVerbatim(data),
    onSuccess: () => {
      message.success("Berhasil transribe audio");
      queryClient.invalidateQueries({
        queryKey: ["get-audio-verbatim", sessionId],
      });
    },
    onError: () => {
      message.error("Gagal transribe audio");
    },
  });

  const handleTransribe = () => {
    mutate({ id: sessionId, audioId });
  };

  return (
    <Button onClick={handleTransribe} loading={isTransribing}>
      Transribe
    </Button>
  );
};

const DetailVerbatim = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["get-audio-verbatim", id],
    queryFn: () => getAudioVerbatim(id),
    keepPreviousData: true,
  });

  const columns = [
    {
      title: "Nama File",
      dataIndex: "filename",
    },
    {
      title: "Aksi",
      dataIndex: "aksi",
      render: (text, record) => (
        <TransribeButton audioId={record.id} sessionId={id} />
      ),
    },
  ];

  return (
    <>
      <div>{id}</div>
      <Table
        pagination={false}
        dataSource={data}
        loading={isLoading}
        columns={columns}
      />
    </>
  );
};

export default DetailVerbatim;
