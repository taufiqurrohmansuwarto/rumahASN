import React from "react";
import { Tree, Avatar } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import "dayjs/locale/id";

import { Comment } from "@ant-design/compatible";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getComments } from "@/services/asn-connect-discussions.services";

// Data untuk contoh
const treeData = [
  {
    title: "UtterlyConfused93",
    key: "0",
    avatar: "https://joeschmoe.io/api/v1/random",
    content: "I already know where this comment section is going.",
    datetime: dayjs().subtract(6, "hours").fromNow(),
    children: [
      {
        title: "BillionTonsHyperbole",
        key: "0-0",
        avatar: "https://joeschmoe.io/api/v1/random",
        content: "Yup, straight to hell.",
        datetime: dayjs().subtract(5, "hours").fromNow(),
        children: [
          {
            title: "sregor0280",
            key: "0-0-0",
            avatar: "https://joeschmoe.io/api/v1/random",
            content:
              'NgI my first thought was "she\'s almost old enough for him to date!" But then I shut off the memes in my head and thought "dude is being real and allowing a fan to have a moment that\'s genuine"',
            datetime: dayjs().subtract(4, "hours").fromNow(),
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
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery(["asn-discussions-comment", id], () =>
    getComments(id)
  );

  return <div>Hello world</div>;
};

export default CommentList;
