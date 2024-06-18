import { formatDateSimple } from "@/utils/client-utils";
import { Avatar, Grid, Progress, Rating, Stack } from "@mantine/core";
import {
  Card,
  Col,
  Divider,
  FloatButton,
  List,
  Row,
  Space,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const DaftarUserRating = ({ data, loadingRating }) => {
  const router = useRouter();

  const handleChangePage = (page) => {
    router.push({
      query: {
        ...router?.query,
        page,
      },
    });
  };

  return (
    <>
      <List
        loading={loadingRating}
        size="small"
        pagination={{
          onChange: handleChangePage,
          size: "small",
          pageSize: data?.limit,
          current: parseInt(router?.query?.page) || 1,
          position: "both",
          showSizeChanger: false,
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} peserta`,
        }}
        dataSource={data?.data}
        rowKey={(row) => row?.id}
        renderItem={(item) => (
          <List.Item>
            <Row
              style={{
                width: "100%",
              }}
            >
              <Col md={12} xs={12}>
                <Stack spacing="xs">
                  <Rating value={item?.rating} readOnly />
                  <Avatar src={item?.participant?.image} size="sm" />
                  <Typography.Text strong>
                    {item?.participant?.username}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    {item?.participant?.info?.jabatan?.jabatan}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    {item?.participant?.info?.perangkat_daerah?.detail}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {formatDateSimple(item?.created_at)}
                  </Typography.Text>
                </Stack>
              </Col>
              <Col md={12} xs={12}>
                <Typography.Text srong>{item?.comments}</Typography.Text>
              </Col>
            </Row>
          </List.Item>
        )}
      />
    </>
  );
};

const DaftarRating = ({ data }) => {
  const router = useRouter();
  const [active, setActive] = useState(0);

  const handleActive = (value) => {
    if (value === active) {
      setActive(0);
      router.push({
        query: {
          id: router?.query?.id,
          page: 1,
        },
      });
    } else {
      router.push({
        query: {
          ...router?.query,
          page: 1,
          rating: value,
        },
      });
      setActive(value);
    }
  };

  return (
    <Space direction="vertical">
      {data?.map((d) => {
        return (
          <Space
            size="small"
            key={d?.rating}
            style={{
              cursor: "pointer",
              backgroundColor: active === d?.rating ? "yellow" : "#fff",
            }}
            onClick={() => handleActive(d?.rating)}
          >
            <Rating value={d?.rating} readOnly />
            <Progress w={200} value={d?.percentage} />
            <Typography.Text>{d?.total}</Typography.Text>
          </Space>
        );
      })}
    </Space>
  );
};

const ViewRatingComponent = ({ data }) => {
  return (
    <Grid
      gutter={{
        xs: 8,
        md: 16,
        lg: 24,
        xl: 32,
      }}
    >
      <Grid.Col md={6} xs={12}>
        <Typography.Title level={5}>Review Peserta & Rating</Typography.Title>
        <Stack>
          <Space>
            <Rating
              fractions={3}
              value={data?.aggregate?.averageRatings}
              readOnly
            />{" "}
            (
            <span
              style={{
                fontSize: 11,
              }}
            >
              {data?.aggregate?.averageRatings} out of 5
            </span>
            )
          </Space>
          <Typography.Text type="secondary">
            Berdasar dari {data?.aggregate?.totalUserRatings} orang peserta
          </Typography.Text>
        </Stack>
      </Grid.Col>
      <Grid.Col md={6} xs={12}>
        <DaftarRating data={data?.aggregate?.totalRatingPerValue} />
      </Grid.Col>
    </Grid>
  );
};

const WebinarRatings = ({ data, loadingRating }) => {
  return (
    <Card>
      <FloatButton.BackTop />
      <ViewRatingComponent data={data} />
      <Divider />
      <DaftarUserRating loadingRating={loadingRating} data={data?.data} />
    </Card>
  );
};

export default WebinarRatings;
