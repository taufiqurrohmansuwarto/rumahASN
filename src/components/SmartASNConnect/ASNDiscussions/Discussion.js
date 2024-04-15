import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { useState } from "react";

const Discussion = () => {
  const [votes, setVotes] = useState({ count1: 36, count2: 36, count3: 37 });

  const handleVote = (key, delta) => {
    setVotes((votes) => ({ ...votes, [key]: votes[key] + delta }));
  };

  return (
    <div style={{ padding: 16 }}>
      {[1, 2, 3].map((index) => (
        <Card key={index} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={<UpOutlined />}
              onClick={() => handleVote(`count${index}`, 1)}
            />
            <div style={{ margin: "0 8px" }}>{votes[`count${index}`]}</div>
            <Button
              type="text"
              icon={<DownOutlined />}
              onClick={() => handleVote(`count${index}`, -1)}
            />
            {/* Additional content here, such as the bar and the rest of the comment structure */}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Discussion;
