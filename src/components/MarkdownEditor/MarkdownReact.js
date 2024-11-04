// components/ReactMarkdownCustom/index.js
import { Typography, Image, Card, Table } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";

const { Title, Text, Paragraph } = Typography;

const MARKDOWN_COMPONENTS = {
  a: ({ node, ...props }) => (
    <Text {...props} target="_blank" rel="noopener noreferrer" />
  ),
  img: ({ node, ...props }) => (
    <Image
      style={{
        maxWidth: "300px",
        width: "100%",
      }}
      alt={props.alt || "Image"}
      preview={true}
      {...props}
    />
  ),
  blockquote: ({ node, children }) => (
    <Card
      style={{
        backgroundColor: "#f5f5f5",
      }}
      bodyStyle={{
        padding: "12px",
      }}
    >
      <Text>{children}</Text>
    </Card>
  ),
  p: ({ children }) => <Paragraph>{children}</Paragraph>,
  h1: ({ children }) => <Title level={1}>{children}</Title>,
  h2: ({ children }) => <Title level={2}>{children}</Title>,
  h3: ({ children }) => <Title level={3}>{children}</Title>,
  h4: ({ children }) => <Title level={4}>{children}</Title>,
  h5: ({ children }) => <Title level={5}>{children}</Title>,
  h6: ({ children }) => <Title level={6}>{children}</Title>,
  a({ node, ...props }) {
    return <a {...props} target="_blank" />;
  },
  code: ({ children }) => (
    <Text code style={{ margin: "0 4px" }}>
      {children}
    </Text>
  ),
  table: (props) => (
    <Table
      {...props}
      size="small"
      style={{ marginBottom: "16px" }}
      pagination={false}
    />
  ),
  ul: ({ children }) => (
    <ul style={{ marginTop: 0, marginBottom: 0 }}>{children}</ul>
  ),
  li: ({ children }) => (
    <li style={{ marginTop: 0, marginBottom: 0, whiteSpace: "normal" }}>
      {children}
    </li>
  ),
};

const remarkMentions = () => {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!node.value.includes("@")) return;
      const matches = node.value.match(/@\w+/g);
      if (!matches) return;
      const newNodes = processMentions(node.value, matches);
      parent.children.splice(index, 1, ...newNodes);
    });
  };
};

const processMentions = (text, matches) => {
  const nodes = [];
  let lastIndex = 0;
  matches.forEach((match) => {
    const startPos = text.indexOf(match, lastIndex);
    const endPos = startPos + match.length;
    if (startPos > lastIndex) {
      nodes.push({
        type: "text",
        value: text.slice(lastIndex, startPos),
      });
    }
    nodes.push({
      type: "link",
      url: `/helpdesk/user/${match.slice(1)}`,
      title: null,
      children: [{ type: "text", value: match }],
    });
    lastIndex = endPos;
  });
  if (lastIndex < text.length) {
    nodes.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }
  return nodes;
};

const formatMarkdown = (markdownSource) => {
  if (!markdownSource) return "";
  let formatted = markdownSource;

  // Handle code blocks
  formatted = formatted.replace(/```[\s\S]*?```/g, (match) =>
    match.replace(/\n/g, "\n")
  );

  // Reduce multiple newlines to single
  formatted = formatted.replace(/\n{2,}/g, "\n");

  // Fix list item spacing
  formatted = formatted.replace(/(\n\s*[-*+])/g, "\n$1");

  return formatted;
};

function MarkdownReact({ children, withCustom = true }) {
  const content = withCustom ? formatMarkdown(children) : children;
  return (
    <Typography>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMentions]}
        rehypePlugins={[rehypeRaw]}
        components={MARKDOWN_COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </Typography>
  );
}

export default MarkdownReact;
