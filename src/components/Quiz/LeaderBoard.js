import { getLeaderBoard } from "@/services/quiz.services";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, List, Space, Tag } from "antd";
import React from "react";

function LeaderBoard() {
  const { data, isLoading } = useQuery(
    ["leaderboard"],
    () => getLeaderBoard(),
    {}
  );
  return (
    <Card title="Leaderboard">
      <List
        dataSource={data}
        loading={isLoading}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <Tag color="green" key="score">
                {item?.score || 0} pts
              </Tag>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Space>
                  <span>{index + 1}</span>
                  <Avatar size="small" src={item?.user?.image} />
                </Space>
              }
              title={item?.user?.username}
              description={item?.user?.group}
            />
          </List.Item>
        )}
        rowKey={(row) => row?.customId}
      />
    </Card>
  );
}

export default LeaderBoard;
