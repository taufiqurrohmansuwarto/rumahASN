import { Popover, Button } from "antd";
import { SimpleGrid, Text, Tabs } from "@mantine/core";
import { IconMoodSmile } from "@tabler/icons-react";

const EMOJI_CATEGORIES = {
  Sering: ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏", "💪", "🙏"],
  Wajah: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
  ],
  Gesture: [
    "👋",
    "🤚",
    "🖐",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
  ],
  Objek: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❤️‍🔥",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
  ],
};

const EmojiPicker = ({ onSelect, children }) => {
  const content = (
    <div style={{ width: 280 }}>
      <Tabs defaultValue="Sering">
        <Tabs.List>
          {Object.keys(EMOJI_CATEGORIES).map((cat) => (
            <Tabs.Tab key={cat} value={cat} size="xs">
              {cat}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {Object.entries(EMOJI_CATEGORIES).map(([cat, emojis]) => (
          <Tabs.Panel key={cat} value={cat} pt="xs">
            <SimpleGrid cols={8} spacing={2}>
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  type="text"
                  size="small"
                  onClick={() => onSelect?.(emoji)}
                >
                  <Text size="lg">{emoji}</Text>
                </Button>
              ))}
            </SimpleGrid>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="top">
      {children || (
        <Button type="text" size="small" icon={<IconMoodSmile size={18} />} />
      )}
    </Popover>
  );
};

export default EmojiPicker;
