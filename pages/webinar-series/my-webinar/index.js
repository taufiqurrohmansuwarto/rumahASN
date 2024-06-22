import Layout from "@/components/Layout";
import WebinarUserLayout from "@/components/WebinarSeries/WebinarUserLayout";
import { webinarUser } from "@/services/webinar.services";
import { formatDateWebinar } from "@/utils/client-utils";
import {
  CalendarTwoTone,
  ClockCircleTwoTone,
  SearchOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Divider,
  FloatButton,
  Input,
  List,
  Row,
  Tooltip,
  Typography,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import useScrollRestoration from "@/hooks/useScrollRestoration";

function MyWebinar() {
  const router = useRouter();
  useScrollRestoration();

  const [query, setQuery] = useState(router?.query);
  const { data, isLoading, isFetching } = useQuery(
    ["webinar-user", query],
    () => webinarUser(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const handleSearch = (value) => {
    if (!value) {
      router.push({
        pathname: `/webinar-series/my-webinar`,
      });

      setQuery({});
    } else {
      router.push({
        pathname: `/webinar-series/my-webinar`,
        query: {
          ...query,
          search: value,
        },
      });

      setQuery({
        ...query,
        search: value,
      });
    }
  };

  const handleChangePage = (page) => {
    router.push({
      pathname: "/webinar-series/my-webinar",
      query: {
        ...query,
        page: page,
      },
    });

    setQuery({
      ...query,
      page: page,
    });
  };

  const gotoDetail = (id) =>
    router.push(`/webinar-series/my-webinar/${id}/detail`);

  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Saya</title>
      </Head>
      <FloatButton.BackTop />
      <WebinarUserLayout
        title="Rumah ASN"
        content="Webinar Saya"
        active="my-webinar"
        loading={isLoading}
      >
        <Card>
          <Row
            gutter={{
              xs: 8,
              sm: 8,
              md: 8,
              lg: 8,
              xl: 8,
              xxl: 8,
            }}
          >
            <Col md={12} xs={24}>
              <Input.Search
                allowClear
                defaultValue={query?.search}
                onSearch={handleSearch}
                placeholder="Cari Webinar"
              />
            </Col>
          </Row>
          <List
            style={{
              marginTop: 24,
            }}
            dataSource={data?.data}
            rowKey={(row) => row?.id}
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 4,
              lg: 4,
              xl: 5,
              xxl: 5,
            }}
            pagination={{
              total: data?.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: handleChangePage,
            }}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => gotoDetail(item?.id)}
                  cover={
                    <>
                      {item?.webinar_series?.image_url && (
                        <Image
                          width={500}
                          height={300}
                          src={item?.webinar_series?.image_url}
                          alt="images"
                        />
                      )}
                    </>
                  }
                  actions={[
                    <Button
                      style={{
                        width: "90%",
                      }}
                      onClick={() => gotoDetail(item?.id)}
                      icon={<SearchOutlined />}
                      type="primary"
                      key="test"
                    >
                      Detail
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    description={
                      <Stack>
                        <Tooltip
                          title={item?.webinar_series?.title}
                          placement="bottomLeft"
                        >
                          <Typography.Text
                            ellipsis={{
                              rows: 2,
                            }}
                            type="secondary"
                          >
                            {item?.webinar_series?.title}
                          </Typography.Text>
                        </Tooltip>
                        <Typography.Text type="secondary">
                          <CalendarTwoTone color="green" />{" "}
                          {formatDateWebinar(item?.webinar_series?.start_date)}{" "}
                          - {formatDateWebinar(item?.webinar_series?.end_date)}
                          <Divider type="vertical" />
                          <ClockCircleTwoTone /> {
                            item?.webinar_series?.hour
                          }{" "}
                          Jam Pelajaran
                        </Typography.Text>
                      </Stack>
                    }
                  />
                </Card>
              </List.Item>
            )}
            loading={isLoading || isFetching}
          />
        </Card>
      </WebinarUserLayout>
    </>
  );
}

MyWebinar.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

MyWebinar.Auth = {
  action: "manage",
  subject: "tickets",
};

export default MyWebinar;
