import { Blockquote, Code, Stack, Table, Text, Title } from "@mantine/core";
import { Image } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { visit } from "unist-util-visit";
import rehypeRaw from "rehype-raw";

const remarkMentions = () => {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!node.value.includes("@")) return; // No mentions, skip

      const matches = node.value.match(/@\w+/g);
      if (matches) {
        const newNodes = [];
        let lastIndex = 0;

        matches.forEach((match) => {
          const startPos = node.value.indexOf(match, lastIndex);
          const endPos = startPos + match.length;

          // Text before the mention
          if (startPos > lastIndex) {
            newNodes.push({
              type: "text",
              value: node.value.slice(lastIndex, startPos),
            });
          }

          // The mention link
          newNodes.push({
            type: "link",
            url: `/helpdesk/user/${match.slice(1)}`, // Assuming username without '@'
            title: null,
            children: [{ type: "text", value: match }],
          });

          lastIndex = endPos;
        });

        // Text after the last mention
        if (lastIndex < node.value.length) {
          newNodes.push({ type: "text", value: node.value.slice(lastIndex) });
        }

        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
};

function ReactMarkdownCustom({ children }) {
  const components = {
    a({ node, ...props }) {
      return <a {...props} target="_blank" />;
    },
    img({ node, ...props }) {
      return <Image width="100%" alt={props.alt || "Image"} {...props} />;
    },
    blockquote({ node, ...props }) {
      return (
        <Blockquote
          style={{
            borderRadius: 4,
          }}
          fz={16}
          bg="#dce4f5"
        >
          <Text>{props.children}</Text>
        </Blockquote>
      );
    },
    p({ node, ...props }) {
      return <Text>{props.children}</Text>;
    },
    h1({ node, ...props }) {
      return <Title order={1} {...props} />;
    },
    h2({ node, ...props }) {
      return <Title order={2} {...props} />;
    },
    h3({ node, ...props }) {
      return <Title order={3} {...props} />;
    },
    h4({ node, ...props }) {
      return <Title order={4} {...props} />;
    },
    h5({ node, ...props }) {
      return <Title order={5} {...props} />;
    },
    h6({ node, ...props }) {
      return <Title order={6} {...props} />;
    },
    code({ node, inline, className, children, ...props }) {
      return <Code>{children}</Code>;
    },
    table({ node, ...props }) {
      return <Table {...props} />;
    },
  };

  const custom = (markdownSource) => {
    let md = markdownSource;
    md = markdownSource.replace(/```[\s\S]*?```/g, (m) =>
      m.replace(/\n/g, "\n ")
    );
    md = md.replace(/(?<=\n\n)(?![*-])\n/g, "&nbsp;\n ");
    md = md.replace(/(\n)/gm, "  \n");
    return md;
  };

  return (
    <Stack>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {custom(children)}
      </ReactMarkdown>
    </Stack>
  );
}

export default ReactMarkdownCustom;
