import React, { useState, useEffect } from "react";
import { Anchor } from "antd";

const KnowledgeAnchorNavigation = ({
  showContent = true,
  showComments = true,
  showRelated = true,
  showAIMetadata = true,
  className = "",
  style = {},
}) => {
  const [targetOffset, setTargetOffset] = useState(100);

  useEffect(() => {
    // Set offset yang lebih konsisten untuk header fixed
    setTargetOffset(100);
  }, []);

  // Flat structure untuk menghindari sub-items hilang
  const anchorItems = [
    // Main Content Sections - Flat structure
    showContent && {
      key: "content-section",
      href: "#content-section",
      title: "Konten",
    },
    showContent && {
      key: "content-header",
      href: "#content-header",
      title: "Judul & Info",
    },
    showContent && {
      key: "content-author",
      href: "#content-author",
      title: "Penulis",
    },
    showContent && {
      key: "content-summary",
      href: "#content-summary",
      title: "Ringkasan",
    },
    showContent && {
      key: "content-body",
      href: "#content-body",
      title: "Isi Konten",
    },
    showContent && {
      key: "content-tags",
      href: "#content-tags",
      title: "Label & Status",
    },

    // Comments Section
    showComments && {
      key: "comments-section",
      href: "#comments-section",
      title: "Diskusi",
    },
    showComments && {
      key: "comments-form",
      href: "#comments-form",
      title: "Tulis Komentar",
    },
    showComments && {
      key: "comments-list",
      href: "#comments-list",
      title: "Daftar Komentar",
    },

    // Related Content Section
    showRelated && {
      key: "related-section",
      href: "#related-section",
      title: "Konten Terkait",
    },

    // AIMetadata Section
    showAIMetadata && {
      key: "aimetadata-section",
      href: "#aimetadata-section",
      title: "Metadata AI",
    },
  ].filter(Boolean);

  return (
    <div className={`knowledge-anchor-nav ${className}`} style={style}>
      <Anchor
        targetOffset={targetOffset}
        offsetTop={100}
        affix={true}
        showInkInFixed={true}
        replace={true}
        getContainer={() => window}
        items={anchorItems}
      />

      <style jsx global>{`
        .knowledge-anchor-nav .ant-anchor {
          padding: 0;
          background: transparent;
        }

        .knowledge-anchor-nav .ant-anchor-ink {
          width: 2px;
          background: #f0f0f0;
        }

        .knowledge-anchor-nav .ant-anchor-ink::before {
          width: 2px;
          background: #ff4500;
        }

        .knowledge-anchor-nav .ant-anchor-link {
          padding: 4px 0 4px 16px;
          line-height: 1.5;
          border: none;
        }

        .knowledge-anchor-nav .ant-anchor-link-title {
          color: #6b7280;
          font-size: 14px;
          transition: color 0.2s ease;
          display: block;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .knowledge-anchor-nav .ant-anchor-link-active > .ant-anchor-link-title {
          color: #ff4500 !important;
          font-weight: 600;
        }

        .knowledge-anchor-nav .ant-anchor-link:hover .ant-anchor-link-title {
          color: #ff4500;
        }

        /* Visual hierarchy for flat structure */
        .knowledge-anchor-nav
          .ant-anchor-link[href="#content-section"]
          .ant-anchor-link-title,
        .knowledge-anchor-nav
          .ant-anchor-link[href="#comments-section"]
          .ant-anchor-link-title,
        .knowledge-anchor-nav
          .ant-anchor-link[href="#related-section"]
          .ant-anchor-link-title {
          font-weight: 600;
          color: #374151;
          font-size: 15px;
          margin-top: 8px;
          margin-bottom: 4px;
        }

        .knowledge-anchor-nav
          .ant-anchor-link[href="#content-header"]
          .ant-anchor-link-title,
        .knowledge-anchor-nav
          .ant-anchor-link[href="#content-author"]
          .ant-anchor-link-title,
        .knowledge-anchor-nav
          .ant-anchor-link[href="#content-summary"]
          .ant-anchor-link-title,
        .knowledge-anchor-nav
          .ant-anchor-link[href="#content-body"]
          .ant-anchor-link-title,
        .knowledge-anchor-nav
          .ant-anchor-link[href="#content-tags"]
          .ant-anchor-link-title,
        .knowledge-anchor-nav
          .ant-anchor-link[href="#comments-form"]
          .ant-anchor-link-title,
        .knowledge-anchor-nav
          .ant-anchor-link[href="#comments-list"]
          .ant-anchor-link-title {
          padding-left: 12px;
          font-size: 13px;
          color: #9ca3af;
        }

        /* Hide on mobile */
        @media (max-width: 768px) {
          .knowledge-anchor-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default KnowledgeAnchorNavigation;
