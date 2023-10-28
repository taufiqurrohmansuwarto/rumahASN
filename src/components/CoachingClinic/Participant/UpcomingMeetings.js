import {
  cancelRequestMeeting,
  requestMeeting,
  upcomingMeetings,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Calendar,
  Divider,
  Modal,
  Table,
  Tooltip,
  message,
} from "antd";
import moment from "moment";
import { useState } from "react";

const CustomModal = ({ visible, onCancel, onOk, isLoading }) => {
  return <Modal></Modal>;
};

function UpcomingMeetings() {
  const [query, setQuery] = useState();

  const { data, isLoading } = useQuery(
    ["upcomingMeetings", query],
    () => upcomingMeetings(query),
    {}
  );

  const { mutateAsync: requestJoin, isLoading: isLoadingRequestJoin } =
    useMutation((data) => requestMeeting(data), {
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    });

  const { mutate: cancelJoin, isLoading: isLoadingCancelJoin } = useMutation(
    (data) => cancelRequestMeeting(data),
    {}
  );

  const handleRequest = (row) => {
    Modal.confirm({
      title: "Request",
      content: "Apakah anda yakin ingin request?",
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk: async () => {
        await requestJoin(row?.id);
      },
    });
  };

  const columns = [
    {
      title: "status",
      dataIndex: "status",
    },
    {
      title: "Peserta",
      dataIndex: "max_participants",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
    },
    {
      key: "aksi",
      title: "Aksi",
      render: (_, row) => {
        return (
          <>
            <a onClick={() => handleRequest(row)}>Request</a>
            <Divider type="vertical" />
          </>
        );
      },
    },
  ];

  return (
    <>
      <Calendar
        onPanelChange={(value) => {}}
        disabledDate={(value) => {
          const currentMonth = moment(value).format("YYYY-MM-DD");
          const findData = data?.filter(
            (item) =>
              moment(item?.start_date).format("YYYY-MM-DD") === currentMonth
          );
          if (findData?.length > 0) {
            return false;
          } else {
            return true;
          }
        }}
        onSelect={(value) => alert(JSON.stringify(value))}
        dateCellRender={(value) => {
          const currentMonth = moment(value).format("YYYY-MM-DD");
          const findData = data?.filter(
            (item) =>
              moment(item?.start_date).format("YYYY-MM-DD") === currentMonth
          );

          if (findData?.length > 0) {
            return (
              <>
                <Avatar.Group maxCount={3} size="small">
                  {findData?.map((item) => (
                    <Tooltip key={item?.id} title={item?.coach?.username}>
                      <Avatar src={item?.coach?.image} />
                    </Tooltip>
                  ))}
                </Avatar.Group>
              </>
            );
          } else {
            return null;
          }
        }}
      />
      {/* <Table
        columns={columns}
        rowKey={(row) => row?.id}
        dataSource={data}
        isLoading={isLoading}
      /> */}
    </>
  );
}

export default UpcomingMeetings;
