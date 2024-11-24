import {
  Blockquote,
  Code,
  List,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { Image } from "antd";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

function ReactMarkdownCustom({ children, withCustom = true }) {
  const components = {
    a({ node, ...props }) {
      return <a {...props} target="_blank" />;
    },
    img({ node, ...props }) {
      return (
        <Image
          style={{
            maxWidth: "300px",
            width: "100%",
          }}
          alt={props.alt || "Image"}
          {...props}
        />
      );
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
      return <Title m={0} p={0} order={1} {...props} />;
    },
    h2({ node, ...props }) {
      return <Title m={0} p={0} order={2} {...props} />;
    },
    h3({ node, ...props }) {
      return <Title m={0} p={0} order={3} {...props} />;
    },
    h4({ node, ...props }) {
      return <Title m={0} p={0} order={4} {...props} />;
    },
    h5({ node, ...props }) {
      return <Title m={0} p={0} order={5} {...props} />;
    },
    h6({ node, ...props }) {
      return <Title m={0} p={0} order={6} {...props} />;
    },
    code({ node, inline, className, children, ...props }) {
      return <Code>{children}</Code>;
    },
    table({ node, ...props }) {
      return <Table {...props} />;
    },
    ol({ node, ...props }) {
      return (
        <ol
          style={{
            whiteSpace: "normal",
            overflowWrap: "break-word",
            wordWrap: "break-word",
          }}
        >
          {props.children}
        </ol>
      );
    },
    ul({ node, ...props }) {
      return (
        <ul
          style={{
            whiteSpace: "normal",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            margin: 0,
            paddingTop: 0,
          }}
        >
          {props.children}
        </ul>
      );
    },
    li({ node, ...props }) {
      return (
        <li
          style={{
            whiteSpace: "normal",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            margin: 0,
            paddingTop: 0,
          }}
        >
          {props.children}
        </li>
      );
    },
  };

  const custom = (markdownSource) => {
    let md = markdownSource;
    // Handle code blocks
    md = markdownSource.replace(/```[\s\S]*?```/g, (m) =>
      m.replace(/\n/g, "\n ")
    );
    // Mengurangi multiple newlines
    md = md.replace(/\n{3,}/g, "\n\n");
    // Handle list items agar tidak terlalu lebar spacing-nya
    md = md.replace(/(\n\s*[-*+])/g, "\n$1");
    // Add proper line endings
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
        {withCustom ? custom(children) : children}
      </ReactMarkdown>
    </Stack>
  );
}

export default ReactMarkdownCustom;
