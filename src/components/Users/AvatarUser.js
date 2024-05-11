import { getUserInformationDetail } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Popover, Spin } from "antd";
import React from "react";
import DetailUser from "./DetailUser";

const ContentInformation = ({ userId }) => {
  const { data, isLoading } = useQuery(
    ["user-info-detail", userId],
    () => getUserInformationDetail(userId),
    {}
  );

  return (
    <Spin spinning={isLoading}>
      <DetailUser user={data} />
    </Spin>
  );
};

function AvatarUser({ userId, ...props }) {
  return (
    <Popover
      overlayStyle={{
        width: 350,
      }}
      content={<ContentInformation userId={userId} />}
    >
      <Avatar {...props} />
    </Popover>
  );
}

export default AvatarUser;
