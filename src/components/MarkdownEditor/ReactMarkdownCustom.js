import { Blockquote, Table, Title, Text } from "@mantine/core";
import { Image, Typography } from "antd";
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
        <div style={{ 
          margin: "16px 0",
          textAlign: "center",
          width: "100%"
        }}>
          <Image
            style={{
              maxWidth: "100%",
              width: "auto",
              height: "auto",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
            }}
            alt={props.alt || "Image"}
            preview={{
              mask: "🔍 Klik untuk memperbesar"
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FmuBxCBfGOHD5BsYBqwOMAydmg+uAA4vMBhuCBwcuDBAYhAOXgRsAMbY2vvz9/W37rp7uru6erumqN6e9p6dfvz/9SQAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAZ9dPdnSxYwAAAABJRU5ErkJggg=="
            {...props}
          />
        </div>
      );
    },
    blockquote({ node, ...props }) {
      return (
        <Blockquote
          style={{
            borderRadius: 8,
            margin: "16px 0",
            backgroundColor: "#fafafa",
            border: "1px solid #e8e8e8"
          }}
          fz={14}
          styles={{
            root: {
              borderLeft: "3px solid #ff7a45",
              boxShadow: "none"
            }
          }}
        >
          <Typography.Text style={{ fontSize: "14px", lineHeight: "1.6", color: "#555" }}>
            {props.children}
          </Typography.Text>
        </Blockquote>
      );
    },
    p({ node, ...props }) {
      return (
        <Text
          style={{
            whiteSpace: "normal",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            marginBottom: "12px",
            lineHeight: "1.6",
            fontSize: "14px"
          }}
        >
          {props.children}
        </Text>
      );
    },
    h1({ node, ...props }) {
      return <Title mb="md" mt="lg" order={2} {...props} />;
    },
    h2({ node, ...props }) {
      return <Title mb="sm" mt="md" order={3} {...props} />;
    },
    h3({ node, ...props }) {
      return <Title mb="sm" mt="md" order={4} {...props} />;
    },
    h4({ node, ...props }) {
      return <Title mb="xs" mt="sm" order={5} {...props} />;
    },
    h5({ node, ...props }) {
      return <Title mb="xs" mt="sm" order={6} {...props} />;
    },
    h6({ node, ...props }) {
      return <Text mb="xs" mt="sm" weight={600} size="sm" {...props} />;
    },
    code({ node, inline, className, children, ...props }) {
      return (
        <Typography.Text
          code
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            backgroundColor: "#f6f8fa",
            padding: inline ? "2px 4px" : "8px 12px",
            borderRadius: "4px",
            fontSize: "13px",
            fontFamily: "Consolas, Monaco, 'Courier New', monospace"
          }}
        >
          {children}
        </Typography.Text>
      );
    },
    table({ node, ...props }) {
      return (
        <div style={{ margin: "16px 0", overflowX: "auto" }}>
          <Table 
            {...props} 
            style={{ 
              fontSize: "14px",
              width: "100%"
            }}
            striped
            highlightOnHover
          />
        </div>
      );
    },
    ol({ node, ...props }) {
      return (
        <ol
          style={{
            whiteSpace: "normal",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            margin: "8px 0",
            paddingLeft: "20px",
            lineHeight: "1.6"
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
            margin: "8px 0",
            paddingLeft: "20px",
            lineHeight: "1.6"
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
            margin: "4px 0",
            padding: 0,
            fontSize: "14px"
          }}
        >
          {props.children}
        </li>
      );
    },
    hr({ node, ...props }) {
      return (
        <div
          style={{
            margin: "24px 0",
            height: "1px",
            background: "linear-gradient(90deg, transparent, #e8e8e8 20%, #e8e8e8 80%, transparent)",
            border: "none"
          }}
          {...props}
        />
      );
    },
  };

  const custom = (markdownSource) => {
    let md = markdownSource;
    // Handle code blocks
    md = markdownSource?.replace(/```[\s\S]*?```/g, (m) =>
      m?.replace(/\n/g, "\n ")
    );
    // Mengurangi multiple newlines
    md = md?.replace(/\n{3,}/g, "\n\n");
    // Handle list items agar tidak terlalu lebar spacing-nya
    md = md?.replace(/(\n\s*[-*+])/g, "\n$1");
    // Add proper line endings
    md = md?.replace(/(\n)/gm, "  \n");
    return md;
  };

  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {withCustom ? custom(children) : children}
      </ReactMarkdown>
    </>
  );
}

export default ReactMarkdownCustom;
