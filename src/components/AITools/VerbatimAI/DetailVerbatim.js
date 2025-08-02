import { getAudioVerbatim } from "@/services/assesor-ai.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button, message, Table, Space, Modal } from "antd";
import {
  transribeAudioVerbatim,
  textToJson,
} from "@/services/assesor-ai.services";
import { useState } from "react";

function AudioPlayer({ src }) {
  return (
    <div>
      <audio controls>
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

const ModalPercakapan = ({ json, onClose, open }) => {
  return (
    <Modal
      centered
      open={open}
      onCancel={onClose}
      footer={null}
      title="Percakapan Wawancara"
      width={900}
      style={{ top: 20 }}
    >
      <>
        {json && (
          <div
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              padding: "16px",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {json.map((item) => (
                <div
                  key={item.index}
                  style={{
                    display: "flex",
                    justifyContent:
                      item.role === "asesor" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      backgroundColor:
                        item.role === "asesor" ? "#1890ff" : "#f5f5f5",
                      color: item.role === "asesor" ? "white" : "#262626",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                        color:
                          item.role === "asesor"
                            ? "rgba(255,255,255,0.8)"
                            : "#8c8c8c",
                      }}
                    >
                      {item.role === "asesor" ? "Asesor" : "Asesi"}
                    </div>
                    <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </Space>
          </div>
        )}
        {!json && (
          <div
            style={{ textAlign: "center", padding: "32px", color: "#8c8c8c" }}
          >
            Tidak ada data percakapan tersedia
          </div>
        )}
      </>
    </Modal>
  );
};

const TextToJsonButton = ({ audioId, sessionId }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading: isTextToJsoning } = useMutation({
    mutationFn: (data) => textToJson(data),
    onSuccess: () => {
      message.success("Berhasil mengubah teks menjadi JSON");
      queryClient.invalidateQueries({
        queryKey: ["get-audio-verbatim", sessionId],
      });
    },
    onError: () => {
      message.error("Gagal mengubah teks menjadi JSON");
    },
  });

  const handleTextToJson = () => {
    mutate({ id: sessionId, audioId });
  };

  return (
    <Button onClick={handleTextToJson} loading={isTextToJsoning}>
      Text to JSON
    </Button>
  );
};

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
  const [selectedJson, setSelectedJson] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = (json) => {
    setSelectedJson(json);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJson(null);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["get-audio-verbatim", id],
    queryFn: () => getAudioVerbatim(id),
    keepPreviousData: true,
  });

  const columns = [
    {
      title: "File path",
      dataIndex: "file_path",
    },
    {
      title: "File",
      dataIndex: "file_path",
      render: (text) => (
        <AudioPlayer src={`https://siasn.bkd.jatimprov.go.id:9000${text}`} />
      ),
    },

    {
      title: "Aksi",
      dataIndex: "aksi",
      render: (text, record) => (
        <Space>
          <TransribeButton audioId={record.id} sessionId={id} />
          <TextToJsonButton audioId={record.id} sessionId={id} />
        </Space>
      ),
    },
    {
      title: "Lihat Percakapan",
      dataIndex: "json_transkrip",
      render: (text, record) => {
        return (
          <Button
            type="link"
            onClick={() => handleShowModal(record?.json_transkrip)}
          >
            Lihat Percakapan
          </Button>
        );
      },
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
      <ModalPercakapan
        open={showModal}
        onClose={handleCloseModal}
        json={selectedJson}
      />
    </>
  );
};

export default DetailVerbatim;
