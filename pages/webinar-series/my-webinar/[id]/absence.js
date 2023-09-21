import Layout from "@/components/Layout";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import {
  getAbsenceUsers,
  registerAbsence,
  unregisterAbsence,
} from "@/services/webinar.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, List, Modal, Tag, message } from "antd";
import { useRouter } from "next/router";
import moment from "moment";
import { Stack } from "@mantine/core";

const RegisterUnregister = ({
  data,
  id,
  register,
  isLoadingRegister,
  unregister,
  isLoadingUnregister,
}) => {
  const handleRegister = async (absenceId) => {
    const payload = {
      id,
      absenceId,
    };
    Modal.confirm({
      title: "Form Absensi",
      content: "Apakah anda yakin ingin melakukan absensi?",
      centered: true,
      onOk: async () => {
        await register(payload);
      },
    });
  };

  const handleUnregister = async (absenceId) => {
    const payload = {
      id,
      absenceId,
    };

    Modal.confirm({
      title: "Form Absensi",
      content: "Apakah anda yakin ingin membatalkan absensi?",
      centered: true,
      onOk: async () => {
        await unregister(payload);
      },
    });
  };

  return (
    <>
      <List
        dataSource={data}
        rowKey={(row) => row?.id}
        renderItem={(item) => (
          <List.Item
            actions={[
              <div key="button">
                {item?.current_user_absence ? (
                  <Button
                    danger
                    disabled={isLoadingUnregister}
                    loading={isLoadingUnregister}
                    onClick={async () => await handleUnregister(item?.id)}
                  >
                    Unregister
                  </Button>
                ) : (
                  <Button
                    onClick={async () => await handleRegister(item?.id)}
                    type="primary"
                    loading={isLoadingRegister}
                    disabled={isLoadingRegister}
                  >
                    Register
                  </Button>
                )}
              </div>,
            ]}
          >
            <List.Item.Meta
              title={`Absensi Hari ke ${item?.day}`}
              description={
                <>
                  <Stack>
                    <div>
                      {moment(item?.registration_open_at).format(
                        "DD-MM-YYYY hh:mm"
                      )}{" "}
                      {moment(item?.registration_close_at).format(
                        "DD-MM-YYYY hh:mm"
                      )}
                    </div>
                    <div>
                      <Tag color={item?.current_user_absence ? "green" : "red"}>
                        {item?.current_user_absence
                          ? "Registered"
                          : "Unregistered"}
                      </Tag>
                    </div>
                  </Stack>
                </>
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};

function WebinarAbsence() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { id } = router?.query;

  const { data, isLoading } = useQuery(["webinar-series-absences", id], () =>
    getAbsenceUsers(id)
  );

  const { mutateAsync: register, isLoading: isLoadingRegister } = useMutation(
    (data) => registerAbsence(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-absences", id]);
      },
      onError: () => {
        message.error("Gagal melakukan absensi");
      },
    }
  );

  const { mutateAsync: unregister, isLoading: isLoadingUnregister } =
    useMutation((data) => unregisterAbsence(data), {
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-absences", id]);
      },
      onError: () => {
        message.error("Gagal membatalkan absensi");
      },
    });

  return (
    <WebinarUserDetailLayout loading={isLoading} active="absence">
      <Card>
        <RegisterUnregister
          register={register}
          isLoadingRegister={isLoadingRegister}
          unregister={unregister}
          isLoadingUnregister={isLoadingUnregister}
          data={data}
          id={id}
        />
      </Card>
    </WebinarUserDetailLayout>
  );
}

WebinarAbsence.Auth = {
  action: "manage",
  subject: "tickets",
};

WebinarAbsence.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

export default WebinarAbsence;
