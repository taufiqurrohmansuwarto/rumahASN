import { Group } from "@mantine/core";
import { Avatar, Typography } from "antd";

function CustomComment() {
  return (
    <div>
      <Group>
        <Avatar />
        <div>
          <div>
            <Typography.Text>Iput</Typography.Text>
          </div>
          <div>
            <Typography.Text>10 hari yang lalu</Typography.Text>
          </div>
        </div>
      </Group>
      <Typography.Text>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
        voluptates, quod, quia, voluptate quae voluptatem quibusdam quos
        accusantium quas dolorum quidem. Quisquam, quae. Quisquam, quae.
      </Typography.Text>
    </div>
  );
}

export default CustomComment;
