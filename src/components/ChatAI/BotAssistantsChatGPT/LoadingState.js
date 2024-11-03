import React from "react";
import { Flex, Spin, Typography } from "antd";

export const LoadingState = ({ tip = "Loading..." }) => (
  <Flex
    vertical
    gap="middle"
    align="center"
    justify="center"
    style={{ height: "100%" }}
  >
    <Spin size="large" />
    <Typography.Text>{tip}</Typography.Text>
  </Flex>
);
