import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import {
  getAbsenceUsers,
  registerAbsence,
  unregisterAbsence,
} from "@/services/webinar.services";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, List, Modal, Tag, message, Breadcrumb } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

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
                    Batal Absen
                  </Button>
                ) : (
                  <Button
                    onClick={async () => await handleRegister(item?.id)}
                    type="primary"
                    loading={isLoadingRegister}
                    disabled={isLoadingRegister}
                  >
                    Absen
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
                      {dayjs(item?.registration_open_at).format(
                        "DD-MM-YYYY HH:mm"
                      )}
                      {" s/d "}
                      {dayjs(item?.registration_close_at).format(
                        "DD-MM-YYYY HH:mm"
                      )}
                    </div>
                    <div>
                      <Tag
                        icon={
                          item?.current_user_absence ? (
                            <CheckOutlined />
                          ) : (
                            <CloseOutlined />
                          )
                        }
                        color={item?.current_user_absence ? "green" : "red"}
                      >
                        {item?.current_user_absence
                          ? "SUDAH ABSEN"
                          : "BELUM ABSEN"}
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
      onError: (error) => {
        message.error(
          `Gagal melakukan absensi. ${JSON.stringify(
            error?.response?.data?.message
          )}`
        );
      },
    }
  );

  const { mutateAsync: unregister, isLoading: isLoadingUnregister } =
    useMutation((data) => unregisterAbsence(data), {
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-absences", id]);
      },
      onError: (error) => {
        message.error("Gagal membatalkan absensi");
      },
    });

  const breadcrumb = [
    {
      title: "Beranda",
      href: "/",
      isActive: true,
    },
    {
      title: "Daftar Webinar Saya",
      href: "/webinar-series/my-webinar",
      isActive: true,
    },
    {
      title: data?.webinar_series?.title || "Detail Webinar",
      isActive: false,
    },
  ];

  return (
    <PageContainer
      onBack={() => router.push(`/webinar-series/my-webinar`)}
      title="Presensi"
      breadcrumbRender={() => (
        <Breadcrumb>
          {breadcrumb.map((item) => (
            <Breadcrumb.Item key={item.title}>
              {item.isActive ? (
                <Link href={item.href}>{item.title}</Link>
              ) : (
                item.title
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      loading={isLoading}
    >
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
    </PageContainer>
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
