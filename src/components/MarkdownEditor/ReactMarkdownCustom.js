import { Blockquote, Table, Title, Text, Image } from "@mantine/core";
import { Typography } from "antd";
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
          width: "100%",
          display: "block",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          clearfix: "both",
          overflow: "hidden"
        }}>
          <div style={{
            display: "inline-block",
            maxWidth: "100%",
            position: "relative"
          }}>
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
                zIndex: 2
              }}
              styles={{
                root: {
                  maxWidth: '100%',
                  display: 'block',
                  position: 'relative'
                },
                image: {
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.01)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 3
                  }
                },
                placeholder: {
                  backgroundColor: '#f1f3f4',
                  color: '#666',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }
              }}
              onClick={() => {
                if (props.src) {
                  window.open(props.src, '_blank', 'noopener,noreferrer');
                }
              }}
            />
          </div>
          {props.alt && (
            <div style={{
              marginTop: 8,
              width: "100%",
              position: "relative",
              zIndex: 1
            }}>
              <Text
                size="sm"
                color="dimmed"
                style={{
                  fontStyle: "italic",
                  lineHeight: 1.4,
                  textAlign: "center",
                  display: "block",
                  padding: "0 8px"
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
      // Auto-link URLs in paragraph text
      const processTextWithLinks = (children) => {
        if (typeof children === 'string') {
          // Very specific regex - support subdomains and common TLDs
          const urlRegex = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*|\b[a-zA-Z0-9.-]+\.(?:com|org|net|gov|edu|id|co\.id|go\.id)\b(?:\/[^\s]*)?)/gi;

          return children.split(urlRegex).map((part, index) => {
            const trimmedPart = part.trim();

            // Very strict validation - support subdomains
            const isValidUrl = (
              /^https?:\/\//i.test(trimmedPart) ||
              /^www\./i.test(trimmedPart) ||
              /^[a-zA-Z0-9.-]+\.(?:com|org|net|gov|edu|id|co\.id|go\.id)(?:\/|$)/i.test(trimmedPart)
            ) && !trimmedPart.includes(' ') && trimmedPart.length > 6;

            if (isValidUrl) {
              // Clean the URL and ensure it has protocol
              let url = trimmedPart;
              if (!url.startsWith('http')) {
                url = url.startsWith('www.') ? `https://${url}` : `https://${url}`;
              }

              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1890ff',
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderBottomColor = '#1890ff';
                    e.target.style.color = '#40a9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderBottomColor = 'transparent';
                    e.target.style.color = '#1890ff';
                  }}
                >
                  {trimmedPart}
                </a>
              );
            }
            return part;
          });
        }

        // Handle React children recursively
        if (Array.isArray(children)) {
          return children.map((child) => {
            if (typeof child === 'string') {
              return processTextWithLinks(child);
            }
            return child;
          });
        }

        return children;
      };

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
          {processTextWithLinks(props.children)}
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
    code({ inline, children }) {
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
