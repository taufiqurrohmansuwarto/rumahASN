import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  allWebinars,
  registerWebinar,
  unregisterWebinar,
} from "@/services/webinar.services";
import {
  CloseOutlined,
  LoginOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Image,
  List,
  Modal,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const Daftar = ({ data }) => {
  const queryClient = useQueryClient();

  const { mutateAsync: register } = useMutation(
    (data) => registerWebinar(data),
    {
      onSuccess: () => {
        message.success("Berhasil mendaftar webinar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-all"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const { mutateAsync: unregister } = useMutation(
    (data) => unregisterWebinar(data),
    {
      onSuccess: () => {
        message.success("Berhasil batal mendaftar webinar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-all"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleUnregister = () => {
    Modal.confirm({
      title: "Batal Daftar Webinar",
      content: "Apakah anda yakin ingin batal mendaftar webinar ini?",
      onOk: async () => {
        await unregister(data?.id);
      },
      centered: true,
      onCancel: () => {},
    });
  };

  const handleClick = () => {
    Modal.confirm({
      title: "Daftar Webinar",
      content: "Apakah anda yakin ingin mendaftar webinar ini?",
      onOk: async () => {
        await register(data?.id);
      },
      centered: true,
      onCancel: () => {},
    });
  };

  return (
    <>
      {data?.is_registered ? (
        <Tooltip title="Batal Daftar Webinar">
          <CloseOutlined onClick={handleUnregister} />
        </Tooltip>
      ) : (
        <Tooltip title="Daftar Webinar">
          <LoginOutlined onClick={handleClick} disabled />
        </Tooltip>
      )}
    </>
  );
};

const GotoDetail = ({ data }) => {
  const router = useRouter();

  const gotoDetail = () => {
    router.push(`/webinar-series/all/${data?.id}/detail`);
  };

  return (
    <Tooltip title="Detail Webinar">
      <SearchOutlined onClick={gotoDetail} />
    </Tooltip>
  );
};

function WebinarAll() {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["webinar-series-all"],
    () => allWebinars(),
    {}
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Semua Webinar</title>
      </Head>
      <PageContainer title="Webinar Series" content="Daftar Semua webinar">
        <Card>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 5,
              lg: 5,
              xl: 6,
              xxl: 5,
            }}
            pagination={{
              total: data?.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            loading={isLoading}
            dataSource={data?.data}
            renderItem={(item) => (
              <List.Item>
                <Card
                  extra={
                    <Tag color={item?.is_registered ? "green" : "red"}>
                      {item?.is_registered
                        ? "Sudah Terdaftar"
                        : "Belum Terdaftar"}
                    </Tag>
                  }
                  cover={
                    <Image
                      src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                      alt="images"
                    />
                  }
                  actions={[
                    <Daftar data={item} key="daftar" />,
                    <GotoDetail data={item} key="detail" />,
                  ]}
                >
                  <Card.Meta
                    description={
                      <Typography.Text
                        ellipsis={{
                          rows: 1,
                        }}
                      >
                        {item?.description}
                      </Typography.Text>
                    }
                    title={
                      <Typography.Text
                        strong
                        ellipsis={{
                          rows: 1,
                        }}
                      >
                        {item?.title}
                      </Typography.Text>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </PageContainer>
    </>
  );
}

WebinarAll.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

WebinarAll.Auth = {
  action: "manage",
  subject: "tickets",
};

export default WebinarAll;
