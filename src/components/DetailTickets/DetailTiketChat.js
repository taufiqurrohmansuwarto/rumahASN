import { Collapse } from "antd";
import React from "react";

function DetailTiketChat({ data }) {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Collapse.Panel>
        <div dangerouslySetInnerHTML={{ __html: data?.content }} />
      </Collapse.Panel>
    </Collapse>
  );
}

export default DetailTiketChat;
