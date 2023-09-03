import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  allWebinars,
  registerWebinar,
  unregisterWebinar,
} from "@/services/webinar.services";
import { formatDateFull } from "@/utils/client-utils";
import {
  CalendarTwoTone,
  CheckCircleTwoTone,
  CheckOutlined,
  ClockCircleFilled,
  ClockCircleTwoTone,
  CloseOutlined,
  LoginOutlined,
  PicCenterOutlined,
  SearchOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Divider,
  Image,
  Input,
  List,
  Modal,
  Row,
  Select,
  Tooltip,
  Typography,
  message,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

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

  const [query, setQuery] = useState(router?.query);

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

  const { data, isLoading } = useQuery(
    ["webinar-series-all", query],
    () => allWebinars(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const handleClick = (id) => {
    router.push(`/webinar-series/all/${id}/detail`);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Semua Webinar</title>
      </Head>
      <PageContainer title="Webinar Series" content="Daftar Semua webinar">
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
            <Col md={5}>
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
              lg: 5,
              xl: 5,
              xxl: 5,
            }}
            pagination={{
              total: data?.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: handleChangePage,
            }}
            loading={isLoading}
            dataSource={data?.data}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => handleClick(item?.id)}
                  cover={
                    <Image
                      preview={false}
                      src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                      alt="images"
                    />
                  }
                  actions={[
                    <Button
                      style={{
                        width: "90%",
                      }}
                      disabled={!item?.is_open}
                      onClick={() => handleClick(item?.id)}
                      icon={<SmileOutlined />}
                      type="primary"
                      key="test"
                    >
                      {item?.is_open
                        ? "Pendaftaran Dibuka"
                        : "Pendaftaran Ditutup"}
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    description={
                      <Stack>
                        <Tooltip
                          title={item?.description}
                          placement="bottomLeft"
                        >
                          <Typography.Text type="secondary">
                            {item?.title}
                          </Typography.Text>
                        </Tooltip>
                        <div
                          style={{
                            fontSize: 12,
                          }}
                        >
                          <CalendarTwoTone color="green" />{" "}
                          {formatDateFull(item?.start_date)} -{" "}
                          {formatDateFull(item?.end_date)}
                          <Divider type="vertical" />
                          <CheckCircleTwoTone /> Materi & Sertifikat
                        </div>
                      </Stack>
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
