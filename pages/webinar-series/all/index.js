import Layout from "@/components/Layout";
import WebinarUserLayout from "@/components/WebinarSeries/WebinarUserLayout";
import { allWebinars } from "@/services/webinar.services";
import { formatDateWebinar } from "@/utils/client-utils";
import {
  CalendarTwoTone,
  CheckCircleOutlined,
  ClockCircleTwoTone,
  StopOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  Button,
  Card,
  Col,
  Divider,
  FloatButton,
  Input,
  List,
  Row,
  Select,
  Tooltip,
  Typography,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import SearchWebinarByCode from "@/components/WebinarSeries/SearchWebinarByCode";
import useScrollRestoration from "@/hooks/useScrollRestoration";

function WebinarAll() {
  const router = useRouter();
  useScrollRestoration();

  const [query, setQuery] = useState(router?.query);

  const { data, isLoading, isFetching } = useQuery(
    ["webinar-series-all", query],
    () => allWebinars(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const handleSearch = (value) => {
    if (!value) {
      router.push({
        pathname: "/webinar-series/all",
      });

      setQuery({});
    } else {
      router.push({
        pathname: "/webinar-series/all",
        query: { ...query, search: value },
      });

      setQuery({ ...query, search: value });
    }
  };

  const handleSelect = (value) => {
    router.push({
      pathname: "/webinar-series/all",
      query: { ...query, sort: value },
    });

    setQuery({ ...query, sort: value });
  };

  const handleChangePage = (page) => {
    router.push({
      pathname: "/webinar-series/all",
      query: { ...query, page },
    });

    setQuery({ ...query, page });
  };

  const handleClick = (id) => {
    router.push(`/webinar-series/all/${id}/detail`);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Semua Webinar</title>
      </Head>
      <WebinarUserLayout title="Rumah ASN" content="Daftar Webinar">
        <FloatButton.BackTop />
        <Card>
          <SearchWebinarByCode />
          <Row
            gutter={{
              xs: 10,
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
            <Col md={5} xs={24}>
              <Select
                onChange={handleSelect}
                style={{
                  width: "100%",
                }}
                value={query?.sort || "tanggalTerdekat"}
                options={[
                  { label: "A-Z", value: "asc" },
                  { label: "Z-A", value: "desc" },
                  { label: "Tanggal Event", value: "tanggalEvent" },
                  { label: "Tanggal Terdekat", value: "tanggalTerdekat" },
                ]}
              />
            </Col>
          </Row>
          <List
            style={{
              marginTop: 24,
            }}
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
              current: router?.query?.page || 1,
              // position: ["bottomRight", "topRight"],
              defaultPageSize: 10,
              total: data?.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: handleChangePage,
            }}
            loading={isLoading || isFetching}
            dataSource={data?.data}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => handleClick(item?.id)}
                  cover={
                    <>
                      {item?.image_url && (
                        <Image
                          width={500}
                          height={180}
                          src={item?.image_url}
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
                      disabled={!item?.is_open}
                      onClick={() => handleClick(item?.id)}
                      icon={
                        item?.is_open ? (
                          <CheckCircleOutlined />
                        ) : (
                          <StopOutlined />
                        )
                      }
                      type="primary"
                      key="test"
                    >
                      {item?.is_open ? "Dibuka" : "Ditutup"}
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    description={
                      <>
                        <Stack>
                          <Tooltip title={item?.title} placement="bottomLeft">
                            <Typography.Text
                              ellipsis={{
                                rows: 2,
                              }}
                              type="secondary"
                            >
                              {item?.title}
                            </Typography.Text>
                          </Tooltip>

                          <Typography.Text type="secondary">
                            <CalendarTwoTone color="green" />{" "}
                            {formatDateWebinar(item?.start_date)} -{" "}
                            {formatDateWebinar(item?.end_date)}
                            <Divider type="vertical" />
                            <ClockCircleTwoTone /> {item?.hour} Jam Pelajaran
                          </Typography.Text>
                        </Stack>
                      </>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </WebinarUserLayout>
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
