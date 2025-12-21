import { Blockquote, Table, Title, Text, Image, Code } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

function ReactMarkdownCustom({ children, withCustom = true }) {
  const components = {
    a({ node, ...props }) {
      return (
        <a
          {...props}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#228be6",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color 0.15s ease",
          }}
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
        <div
          style={{
            margin: "16px 0",
            width: "100%",
            display: "block",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            clearfix: "both",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-block",
              maxWidth: "100%",
              position: "relative",
            }}
          >
            <Image
              src={props.src}
              alt={props.alt || "Image"}
              fit="contain"
              radius="md"
              withPlaceholder
              style={{
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
                position: "relative",
                zIndex: 2,
              }}
              styles={{
                root: {
                  maxWidth: "100%",
                  display: "block",
                  position: "relative",
                },
                image: {
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  position: "relative",
                  "&:hover": {
                    transform: "scale(1.01)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    zIndex: 3,
                  },
                },
                placeholder: {
                  backgroundColor: "#f1f3f4",
                  color: "#666",
                  minHeight: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                },
              }}
              onClick={() => {
                if (props.src) {
                  window.open(props.src, "_blank", "noopener,noreferrer");
                }
              }}
            />
          </div>
          {props.alt && (
            <div
              style={{
                marginTop: 8,
                width: "100%",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Text
                size="sm"
                color="dimmed"
                style={{
                  fontStyle: "italic",
                  lineHeight: 1.4,
                  textAlign: "center",
                  display: "block",
                  padding: "0 8px",
                }}
              >
                {props.alt}
              </Text>
            </div>
          )}
        </div>
      );
    },
    blockquote({ node, ...props }) {
      return (
        <Blockquote
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            backgroundColor: "rgba(34, 139, 230, 0.04)",
            borderRadius: "8px",
            border: "none",
          }}
          styles={{
            root: {
              borderLeft: "3px solid #228be6",
              boxShadow: "none",
            },
          }}
        >
          <Text
            size="sm"
            style={{
              color: "#495057",
              lineHeight: 1.4,
              fontStyle: "italic",
            }}
          >
            {props.children}
          </Text>
        </Blockquote>
      );
    },
    p({ node, ...props }) {
      const processTextWithLinks = (children) => {
        if (typeof children === "string") {
          const urlRegex =
            /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*|\b[a-zA-Z0-9.-]+\.(?:com|org|net|gov|edu|id|co\.id|go\.id)\b(?:\/[^\s]*)?)/gi;

          return children.split(urlRegex).map((part, index) => {
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
                url = url.startsWith("www.")
                  ? `https://${url}`
                  : `https://${url}`;
              }

              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#228be6",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
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

      return (
        <Text
          component="p"
          style={{
            margin: "0 0 8px 0",
            lineHeight: 1.4,
            fontSize: "14px",
            color: "#343a40",
          }}
        >
          {processTextWithLinks(props.children)}
        </Text>
      );
    },
    h1({ node, ...props }) {
      return (
        <Title
          order={2}
          style={{
            margin: "32px 0 16px 0",
            fontWeight: 700,
            color: "#212529",
            letterSpacing: "-0.02em",
          }}
          {...props}
        />
      );
    },
    h2({ node, ...props }) {
      return (
        <Title
          order={3}
          style={{
            margin: "28px 0 14px 0",
            fontWeight: 600,
            color: "#212529",
            letterSpacing: "-0.01em",
          }}
          {...props}
        />
      );
    },
    h3({ node, ...props }) {
      return (
        <Title
          order={4}
          style={{
            margin: "24px 0 12px 0",
            fontWeight: 600,
            color: "#343a40",
          }}
          {...props}
        />
      );
    },
    h4({ node, ...props }) {
      return (
        <Title
          order={5}
          style={{
            margin: "20px 0 10px 0",
            fontWeight: 600,
            color: "#495057",
          }}
          {...props}
        />
      );
    },
    h5({ node, ...props }) {
      return (
        <Title
          order={6}
          style={{
            margin: "16px 0 8px 0",
            fontWeight: 600,
            color: "#495057",
          }}
          {...props}
        />
      );
    },
    h6({ node, ...props }) {
      return (
        <Text
          fw={600}
          size="sm"
          style={{
            margin: "14px 0 8px 0",
            color: "#868e96",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
          {...props}
        />
      );
    },
    code({ inline, className, children }) {
      if (inline) {
        return (
          <Code
            style={{
              padding: "2px 6px",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              backgroundColor: "#f1f3f5",
              color: "#e64980",
              borderRadius: "4px",
            }}
          >
            {children}
          </Code>
        );
      }

      return (
        <Code
          block
          style={{
            margin: "16px 0",
            padding: "16px",
            fontSize: "13px",
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            borderRadius: "8px",
            lineHeight: 1.4,
            overflowX: "auto",
          }}
        >
          {children}
        </Code>
      );
    },
    pre({ node, ...props }) {
      return (
        <div
          style={{
            margin: "16px 0",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {props.children}
        </div>
      );
    },
    table({ node, ...props }) {
      return (
        <div
          style={{
            margin: "20px 0",
            overflowX: "auto",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
          }}
        >
          <Table
            {...props}
            striped
            highlightOnHover
            withBorder={false}
            style={{
              fontSize: "14px",
              minWidth: "100%",
            }}
            styles={{
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
            }}
          />
        </div>
      );
    },
    ol({ node, ...props }) {
      return (
        <ol
          style={{
            margin: "4px 0",
            paddingLeft: "24px",
            lineHeight: 1.4,
            color: "#343a40",
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
            margin: "4px 0",
            paddingLeft: "24px",
            lineHeight: 1.4,
            color: "#343a40",
            listStyleType: "disc",
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
            margin: "2px 0",
            fontSize: "14px",
            paddingLeft: "4px",
            lineHeight: 1.4,
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
            margin: "32px 0",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, #dee2e6 15%, #dee2e6 85%, transparent)",
            border: "none",
          }}
          {...props}
        />
      );
    },
    strong({ node, ...props }) {
      return (
        <strong
          style={{
            fontWeight: 600,
            color: "#212529",
          }}
          {...props}
        />
      );
    },
    em({ node, ...props }) {
      return (
        <em
          style={{
            fontStyle: "italic",
            color: "#495057",
          }}
          {...props}
        />
      );
    },
    del({ node, ...props }) {
      return (
        <del
          style={{
            textDecoration: "line-through",
            color: "#868e96",
          }}
          {...props}
        />
      );
    },
  };

  const custom = (markdownSource) => {
    let md = markdownSource;
    md = markdownSource?.replace(/```[\s\S]*?```/g, (m) =>
      m?.replace(/\n/g, "\n ")
    );
    md = md?.replace(/\n{3,}/g, "\n\n");
    md = md?.replace(/(\n\s*[-*+])/g, "\n$1");
    md = md?.replace(/(\n)/gm, "  \n");
    return md;
  };

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {withCustom ? custom(children) : children}
      </ReactMarkdown>
    </div>
  );
}

export default ReactMarkdownCustom;
