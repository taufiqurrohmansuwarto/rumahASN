import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import { getRatingAdmin } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, List, Rate, Space, Typography } from "antd";
import { useRouter } from "next/router";
import React from "react";

function Ratings() {
  const router = useRouter();
  const { id } = router?.query;

  const { data, isLoading } = useQuery(
    ["webinar-series-ratings", id],
    () => getRatingAdmin(id),
    {}
  );

  return (
    <AdminLayoutDetailWebinar loading={isLoading} active="ratings">
      <Card>
        <List
          dataSource={data}
          rowKey={(row) => row?.id}
          loading={isLoading}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={item?.participant?.image} />}
                title={
                  <Space>
                    <Typography.Text type="secondary">
                      {item?.participant?.username}
                    </Typography.Text>
                    <Rate disabled value={item?.rating} />
                  </Space>
                }
                description={
                  <Typography.Text>{item?.comments}</Typography.Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </AdminLayoutDetailWebinar>
  );
}

Ratings.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Ratings.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Ratings;
