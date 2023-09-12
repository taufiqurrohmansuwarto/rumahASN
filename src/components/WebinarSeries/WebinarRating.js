import { formatDateSimple } from "@/utils/client-utils";
import { Grid, Progress, Rating, Stack } from "@mantine/core";
import { Card, Divider, List, Space, Typography, Row, Col } from "antd";

const DaftarUserRating = ({ data }) => {
  return (
    <>
      <List
        dataSource={data}
        rowKey={(row) => row?.id}
        renderItem={(item) => (
          <List.Item>
            <Row
              style={{
                width: "100%",
              }}
            >
              <Col md={12} xs={12}>
                <Stack>
                  <Rating value={item?.rating} readOnly />
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
  return (
    <Stack>
      {data?.map((d) => {
        return (
          <Space key={d?.rating}>
            <Typography.Text type="secondary">
              {d?.rating} Bintang
            </Typography.Text>
            <Rating value={d?.rating} readOnly />
            <Progress w={200} value={d?.percentage} />
            <Typography.Text>{d?.total}</Typography.Text>
          </Space>
        );
      })}
    </Stack>
  );
};

const ViewRatingComponent = ({ data }) => {
  return (
    <Grid>
      <Grid.Col md={6} xs={12}>
        <Typography.Title level={5}>Review Peserta & Rating</Typography.Title>
        <Stack>
          <Space>
            <Rating value={data?.aggregate?.averageRatings} readOnly /> (
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

const WebinarRatings = ({ data }) => {
  return (
    <Card>
      <ViewRatingComponent data={data} />
      <Divider />
      <DaftarUserRating data={data?.data} />
    </Card>
  );
};

export default WebinarRatings;
