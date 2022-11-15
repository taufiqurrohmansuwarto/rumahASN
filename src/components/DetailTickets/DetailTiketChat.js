import { Collapse } from "antd";
import React from "react";

function DetailTiketChat({ data }) {
  return (
    <Collapse>
      <Collapse.Panel header={data?.title}>
        <div dangerouslySetInnerHTML={{ __html: data?.content }} />
      </Collapse.Panel>
    </Collapse>
  );
}

export default DetailTiketChat;
