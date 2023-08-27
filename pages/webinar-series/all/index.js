import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { allWebinars, registerWebinar } from "@/services/webinar.services";
import {
  DotChartOutlined,
  EditOutlined,
  LoginOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Image, List, Space, Tooltip, Typography, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const Daftar = ({ data }) => {
  const queryClient = useQueryClient();

  const { mutate: register, isLoading } = useMutation(
    (data) => registerWebinar(data),
    {
      onSuccess: () => {
        message.success("Berhasil mendaftar webinar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-all"]);
      },
    }
  );

  const handleClick = () => {
    register(data?.id);
  };

  return (
    <Tooltip title="Daftar Webinar">
      <LoginOutlined onClick={handleClick} disabled />
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
                cover={
                  <Image
                    src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                    alt="images"
                  />
                }
                actions={[
                  <Daftar data={item} key="daftar" />,
                  <SearchOutlined key="edit" />,
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
