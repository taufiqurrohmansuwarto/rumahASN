import { Blockquote, Code, Table, Text, Title } from "@mantine/core";
import { Image } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

function ReactMarkdownCustom({ children }) {
  const components = {
    a({ node, ...props }) {
      return <a {...props} target="_blank" />;
    },
    img({ node, ...props }) {
      return <Image height={200} alt={props.alt || "Image"} {...props} />;
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
      return <Code block>{children}</Code>;
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
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={components}
    >
      {custom(children)}
    </ReactMarkdown>
  );
}

export default ReactMarkdownCustom;
