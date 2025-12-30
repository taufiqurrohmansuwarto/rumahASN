import { Blockquote, Table, Title, Text, Image, Code } from "@mantine/core";
import { memo, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// Static plugins arrays - defined outside component to prevent recreation
const REMARK_PLUGINS = [remarkGfm, remarkBreaks];
const REHYPE_PLUGINS = [rehypeRaw];

// Static styles - defined outside component to prevent recreation
const CONTAINER_STYLE = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

const LINK_STYLE = {
  color: "#228be6",
  textDecoration: "none",
  fontWeight: 500,
  transition: "color 0.15s ease",
};

const IMAGE_CONTAINER_STYLE = {
  margin: "16px 0",
  maxWidth: "100%",
  display: "block",
  textAlign: "center",
  overflow: "hidden",
};

const IMAGE_WRAPPER_STYLE = {
  display: "inline-block",
  maxWidth: "100%",
};

const IMAGE_STYLE = {
  maxWidth: "100%",
  width: "auto",
  height: "auto",
  maxHeight: "70vh",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  border: "1px solid #e9ecef",
  backgroundColor: "#f8f9fa",
  display: "block",
};

const IMAGE_STYLES_PROP = {
  root: {
    maxWidth: "100%",
    display: "block",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "70vh",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    display: "block",
    "&:hover": {
      transform: "scale(1.01)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  },
  placeholder: {
    backgroundColor: "#f1f3f4",
    color: "#666",
    minHeight: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const IMAGE_ALT_CONTAINER_STYLE = {
  marginTop: 8,
  width: "100%",
};

const IMAGE_ALT_TEXT_STYLE = {
  fontStyle: "italic",
  lineHeight: 1.4,
  textAlign: "center",
  display: "block",
  padding: "0 8px",
};

const BLOCKQUOTE_STYLE = {
  margin: "20px 0",
  padding: "16px 20px",
  backgroundColor: "rgba(34, 139, 230, 0.04)",
  borderRadius: "8px",
  border: "none",
};

const BLOCKQUOTE_STYLES_PROP = {
  root: {
    borderLeft: "3px solid #228be6",
    boxShadow: "none",
  },
};

const BLOCKQUOTE_TEXT_STYLE = {
  color: "#495057",
  lineHeight: 1.4,
  fontStyle: "italic",
};

const PARAGRAPH_STYLE = {
  margin: "0 0 8px 0",
  lineHeight: 1.4,
  fontSize: "14px",
  color: "#343a40",
};

const H1_STYLE = {
  margin: "32px 0 16px 0",
  fontWeight: 700,
  color: "#212529",
  letterSpacing: "-0.02em",
};

const H2_STYLE = {
  margin: "28px 0 14px 0",
  fontWeight: 600,
  color: "#212529",
  letterSpacing: "-0.01em",
};

const H3_STYLE = {
  margin: "24px 0 12px 0",
  fontWeight: 600,
  color: "#343a40",
};

const H4_STYLE = {
  margin: "20px 0 10px 0",
  fontWeight: 600,
  color: "#495057",
};

const H5_STYLE = {
  margin: "16px 0 8px 0",
  fontWeight: 600,
  color: "#495057",
};

const H6_STYLE = {
  margin: "14px 0 8px 0",
  color: "#868e96",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const INLINE_CODE_STYLE = {
  padding: "2px 6px",
  fontSize: "13px",
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  backgroundColor: "#f1f3f5",
  color: "#e64980",
  borderRadius: "4px",
};

const CODE_BLOCK_STYLE = {
  margin: "16px 0",
  padding: "16px",
  fontSize: "13px",
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  backgroundColor: "#1e1e1e",
  color: "#d4d4d4",
  borderRadius: "8px",
  lineHeight: 1.4,
  overflowX: "auto",
};

const PRE_STYLE = {
  margin: "16px 0",
  borderRadius: "8px",
  overflow: "hidden",
};

const TABLE_CONTAINER_STYLE = {
  margin: "20px 0",
  overflowX: "auto",
  borderRadius: "8px",
  border: "1px solid #e9ecef",
};

const TABLE_STYLE = {
  fontSize: "14px",
  minWidth: "100%",
};

const TABLE_STYLES_PROP = {
  root: {
    borderCollapse: "collapse",
  },
  thead: {
    backgroundColor: "#f8f9fa",
  },
  th: {
    fontWeight: 600,
    color: "#495057",
    padding: "12px 16px",
    borderBottom: "2px solid #dee2e6",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f3f5",
  },
};

const OL_STYLE = {
  margin: "4px 0",
  paddingLeft: "24px",
  lineHeight: 1.4,
  color: "#343a40",
};

const UL_STYLE = {
  margin: "4px 0",
  paddingLeft: "24px",
  lineHeight: 1.4,
  color: "#343a40",
  listStyleType: "disc",
};

const LI_STYLE = {
  margin: "2px 0",
  fontSize: "14px",
  paddingLeft: "4px",
  lineHeight: 1.4,
};

const HR_STYLE = {
  margin: "32px 0",
  height: "1px",
  background:
    "linear-gradient(90deg, transparent, #dee2e6 15%, #dee2e6 85%, transparent)",
  border: "none",
};

const STRONG_STYLE = {
  fontWeight: 600,
  color: "#212529",
};

const EM_STYLE = {
  fontStyle: "italic",
  color: "#495057",
};

const DEL_STYLE = {
  textDecoration: "line-through",
  color: "#868e96",
};

// URL regex - compiled once
const URL_REGEX =
  /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*|\b[a-zA-Z0-9.-]+\.(?:com|org|net|gov|edu|id|co\.id|go\.id)\b(?:\/[^\s]*)?)/gi;

// Helper function for processing text with links - defined outside component
const processTextWithLinks = (children) => {
  if (typeof children === "string") {
    return children.split(URL_REGEX).map((part, index) => {
      const trimmedPart = part.trim();

      const isValidUrl =
        (/^https?:\/\//i.test(trimmedPart) ||
          /^www\./i.test(trimmedPart) ||
          /^[a-zA-Z0-9.-]+\.(?:com|org|net|gov|edu|id|co\.id|go\.id)(?:\/|$)/i.test(
            trimmedPart
          )) &&
        !trimmedPart.includes(" ") &&
        trimmedPart.length > 6;

      if (isValidUrl) {
        let url = trimmedPart;
        if (!url.startsWith("http")) {
          url = url.startsWith("www.") ? `https://${url}` : `https://${url}`;
        }

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={LINK_STYLE}
          >
            {trimmedPart}
          </a>
        );
      }
      return part;
    });
  }

  if (Array.isArray(children)) {
    return children.map((child) => {
      if (typeof child === "string") {
        return processTextWithLinks(child);
      }
      return child;
    });
  }

  return children;
};

// Custom markdown processing function - defined outside component
const customMarkdown = (markdownSource) => {
  if (!markdownSource) return markdownSource;
  let md = markdownSource;
  md = markdownSource.replace(/```[\s\S]*?```/g, (m) =>
    m.replace(/\n/g, "\n ")
  );
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.replace(/(\n\s*[-*+])/g, "\n$1");
  md = md.replace(/(\n)/gm, "  \n");
  return md;
};

// Static components object - defined outside component to prevent recreation
const MARKDOWN_COMPONENTS = {
  a({ node, ...props }) {
    return (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        style={LINK_STYLE}
        onMouseEnter={(e) => {
          e.target.style.color = "#1971c2";
          e.target.style.textDecoration = "underline";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = "#228be6";
          e.target.style.textDecoration = "none";
        }}
      />
    );
  },
  img({ node, ...props }) {
    return (
      <div style={IMAGE_CONTAINER_STYLE}>
        <div style={IMAGE_WRAPPER_STYLE}>
          <Image
            src={props.src}
            alt={props.alt || "Image"}
            fit="contain"
            radius="md"
            withPlaceholder
            style={IMAGE_STYLE}
            styles={IMAGE_STYLES_PROP}
            onClick={() => {
              if (props.src) {
                window.open(props.src, "_blank", "noopener,noreferrer");
              }
            }}
          />
        </div>
        {props.alt && (
          <div style={IMAGE_ALT_CONTAINER_STYLE}>
            <Text size="sm" color="dimmed" style={IMAGE_ALT_TEXT_STYLE}>
              {props.alt}
            </Text>
          </div>
        )}
      </div>
    );
  },
  blockquote({ node, ...props }) {
    return (
      <Blockquote style={BLOCKQUOTE_STYLE} styles={BLOCKQUOTE_STYLES_PROP}>
        <Text size="sm" style={BLOCKQUOTE_TEXT_STYLE}>
          {props.children}
        </Text>
      </Blockquote>
    );
  },
  p({ node, ...props }) {
    return (
      <Text component="p" style={PARAGRAPH_STYLE}>
        {processTextWithLinks(props.children)}
      </Text>
    );
  },
  h1({ node, ...props }) {
    return <Title order={2} style={H1_STYLE} {...props} />;
  },
  h2({ node, ...props }) {
    return <Title order={3} style={H2_STYLE} {...props} />;
  },
  h3({ node, ...props }) {
    return <Title order={4} style={H3_STYLE} {...props} />;
  },
  h4({ node, ...props }) {
    return <Title order={5} style={H4_STYLE} {...props} />;
  },
  h5({ node, ...props }) {
    return <Title order={6} style={H5_STYLE} {...props} />;
  },
  h6({ node, ...props }) {
    return <Text fw={600} size="sm" style={H6_STYLE} {...props} />;
  },
  code({ inline, className, children }) {
    if (inline) {
      return <Code style={INLINE_CODE_STYLE}>{children}</Code>;
    }
    return (
      <Code block style={CODE_BLOCK_STYLE}>
        {children}
      </Code>
    );
  },
  pre({ node, ...props }) {
    return <div style={PRE_STYLE}>{props.children}</div>;
  },
  table({ node, ...props }) {
    return (
      <div style={TABLE_CONTAINER_STYLE}>
        <Table
          {...props}
          striped
          highlightOnHover
          withBorder={false}
          style={TABLE_STYLE}
          styles={TABLE_STYLES_PROP}
        />
      </div>
    );
  },
  ol({ node, ...props }) {
    return <ol style={OL_STYLE}>{props.children}</ol>;
  },
  ul({ node, ...props }) {
    return <ul style={UL_STYLE}>{props.children}</ul>;
  },
  li({ node, ...props }) {
    return <li style={LI_STYLE}>{props.children}</li>;
  },
  hr({ node, ...props }) {
    return <div style={HR_STYLE} {...props} />;
  },
  strong({ node, ...props }) {
    return <strong style={STRONG_STYLE} {...props} />;
  },
  em({ node, ...props }) {
    return <em style={EM_STYLE} {...props} />;
  },
  del({ node, ...props }) {
    return <del style={DEL_STYLE} {...props} />;
  },
};

function ReactMarkdownCustom({ children, withCustom = true }) {
  // Memoize processed markdown content
  const processedContent = useMemo(() => {
    return withCustom ? customMarkdown(children) : children;
  }, [children, withCustom]);

  return (
    <div style={CONTAINER_STYLE}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={MARKDOWN_COMPONENTS}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

export default memo(ReactMarkdownCustom);
