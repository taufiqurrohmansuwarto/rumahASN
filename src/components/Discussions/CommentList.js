import React from "react";
import { Tree, Avatar } from "antd";
import moment from "moment";

import { Comment } from "@ant-design/compatible";

// Data untuk contoh
const treeData = [
  {
    title: "UtterlyConfused93",
    key: "0",
    avatar: "https://joeschmoe.io/api/v1/random",
    content: "I already know where this comment section is going.",
    datetime: moment().subtract(6, "hours").fromNow(),
    children: [
      {
        title: "BillionTonsHyperbole",
        key: "0-0",
        avatar: "https://joeschmoe.io/api/v1/random",
        content: "Yup, straight to hell.",
        datetime: moment().subtract(5, "hours").fromNow(),
        children: [
          {
            title: "sregor0280",
            key: "0-0-0",
            avatar: "https://joeschmoe.io/api/v1/random",
            content:
              'NgI my first thought was "she\'s almost old enough for him to date!" But then I shut off the memes in my head and thought "dude is being real and allowing a fan to have a moment that\'s genuine"',
            datetime: moment().subtract(4, "hours").fromNow(),
          },
        ],
      },
    ],
  },
];

// Fungsi untuk render setiap node
const renderTreeNode = (node) => (
  <Comment
    author={<a href="/user">{node.title}</a>}
    avatar={<Avatar src={node.avatar} alt={node.title} />}
    content={<p>{node.content}</p>}
    datetime={node.datetime}
  />
);

const CommentList = () => {
  return (
    <Tree
      showLine={{ showLeafIcon: false }}
      defaultExpandAll
      treeData={treeData}
      titleRender={renderTreeNode}
    />
  );
};

export default CommentList;
