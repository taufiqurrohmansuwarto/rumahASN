// config/antd-config.js
import { Grid } from "antd";
import { createStyles } from "antd-style";
import id from "antd/locale/id_ID";
import { useFontJakarta, useFontSourceSans3 } from "./fonts";

// Reddit authentic global styles
export const useGlobalStyle = createStyles(({ prefixCls, css, token }) => ({
  globalStyle: css`
    // Reddit-style Typography
    .${prefixCls}-typography {
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 600;
        color: #1c1c1c; // Reddit dark text
        margin-bottom: 0.5em;
        line-height: 1.3;
      }

      p {
        line-height: 1.6;
        color: #1c1c1c; // Reddit dark text
        margin-bottom: 1em;
      }

      .${prefixCls}-typography-copy {
        color: #878a8c; // Reddit gray
      }
    }

    // Reddit-style Table
    .${prefixCls}-table {
      .${prefixCls}-table-thead > tr > th {
        background: #f8f9fa; // Very light header
        border-bottom: 1px solid #edeff1; // Light border
        font-weight: 600;
        color: #1c1c1c; // Dark header text
        padding: 16px 20px;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        &:first-child {
          border-top-left-radius: 4px; // Reddit style
        }
        &:last-child {
          border-top-right-radius: 4px; // Reddit style
        }
      }

      .${prefixCls}-table-tbody > tr {
        transition: all 0.2s ease;

        &:hover {
          background: #f6f7f8; // Very light hover
        }

        &:nth-child(even) {
          background: #fafbfc; // Very light alternating

          &:hover {
            background: #f6f7f8; // Consistent hover
          }
        }

        > td {
          padding: 16px 20px;
          border-bottom: 1px solid #edeff1; // Light border
          color: #1c1c1c; // Dark text
          vertical-align: middle;
        }
      }

      .${prefixCls}-table-container {
        border-radius: 4px; // Reddit style
        border: 1px solid #edeff1; // Light border
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); // Minimal shadow
      }

      .${prefixCls}-table-pagination {
        margin: 16px 0;

        .${prefixCls}-pagination-item {
          border-radius: 4px; // Reddit style
          border: 1px solid #edeff1; // Light border

          &:hover {
            border-color: #ff4500; // Reddit orange
            color: #ff4500; // Reddit orange
          }

          &.${prefixCls}-pagination-item-active {
            background: #ff4500; // Reddit orange
            border-color: #ff4500; // Reddit orange
          }
        }
      }
    }

    // Reddit-style Form Components
    .${prefixCls}-input, .${prefixCls}-input-affix-wrapper {
      border-radius: 4px; // Reddit style
      border: 1px solid #edeff1; // Light border
      padding: 8px 12px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #878a8c; // Reddit gray
      }

      &:focus,
      &.${prefixCls}-input-affix-wrapper-focused {
        border-color: #ff4500; // Reddit orange
        box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2); // Orange outline
      }
    }

    .${prefixCls}-select {
      .${prefixCls}-select-selector {
        border-radius: 4px; // Reddit style
        border: 1px solid #edeff1; // Light border
        transition: all 0.2s ease;

        &:hover {
          border-color: #878a8c; // Reddit gray
        }
      }

      &.${prefixCls}-select-focused .${prefixCls}-select-selector {
        border-color: #ff4500; // Reddit orange
        box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2); // Orange outline
      }
    }

    .${prefixCls}-select-dropdown {
      border-radius: 4px; // Reddit style
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); // Minimal shadow
      border: 1px solid #edeff1; // Light border

      .${prefixCls}-select-item {
        padding: 8px 12px;
        border-radius: 4px; // Reddit style
        margin: 2px 6px;

        &:hover {
          background: #f6f7f8; // Very light hover
          color: #ff4500; // Reddit orange
        }

        &.${prefixCls}-select-item-option-selected {
          background: #ff4500; // Reddit orange
          color: white;
          font-weight: 500;
        }
      }
    }

    // Clean Card Design seperti gambar
    .${prefixCls}-card {
      border-radius: 8px; // Rounded seperti gambar
      border: 1px solid #e5e7eb; // Very light gray border
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // Very subtle shadow
      transition: all 0.3s ease;
      background: #ffffff; // Pure white

      &:hover {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08); // Gentle elevation
        border-color: #d1d5db; // Slightly darker border on hover
        transform: translateY(-1px);
      }

      .${prefixCls}-card-head {
        background: #ffffff; // Pure white header
        border-bottom: 1px solid #f3f4f6; // Very light divider
        padding: 20px 24px;

        .${prefixCls}-card-head-title {
          font-weight: 600;
          color: #1c1c1c; // Dark text
          font-size: 16px;
        }
      }

      .${prefixCls}-card-body {
        padding: 24px;
        color: #1c1c1c; // Dark text
        line-height: 1.6;
        background: #ffffff; // Pure white body
      }

      .${prefixCls}-card-actions {
        border-top: 1px solid #f3f4f6; // Very light divider
        background: #fafbfc; // Very subtle background

        > li {
          margin: 12px 0;

          > span {
            color: #6b7280; // Softer gray
            transition: color 0.2s ease;

            &:hover {
              color: #ff4500; // Reddit orange
            }
          }
        }
      }
    }

    // Reddit-style Tag System
    .${prefixCls}-tag {
      border-radius: 4px; // Reddit style
      padding: 2px 8px; // Smaller padding
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #edeff1; // Light border

      // Default tag - Reddit style
      background: #f6f7f8; // Very light background
      color: #878a8c; // Reddit gray

      &.${prefixCls}-tag-success {
        background: #e8f5e8; // Light green
        color: #46d160; // Reddit green
        border-color: #46d160;
      }

      &.${prefixCls}-tag-warning {
        background: #fff7e6; // Light orange
        color: #ffb000; // Reddit yellow
        border-color: #ffb000;
      }

      &.${prefixCls}-tag-error {
        background: #ffebee; // Light red
        color: #ea0027; // Reddit red
        border-color: #ea0027;
      }

      &.${prefixCls}-tag-processing {
        background: #e3f2fd; // Light blue
        color: #0079d3; // Reddit blue
        border-color: #0079d3;
      }
    }

    // Reddit-style Modal
    .${prefixCls}-modal {
      .${prefixCls}-modal-content {
        border-radius: 8px; // Slightly rounded for modals
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); // Clean shadow
        border: 1px solid #edeff1; // Light border
      }

      .${prefixCls}-modal-header {
        background: #ffffff; // White header
        border-bottom: 1px solid #edeff1; // Light border
        padding: 20px 24px;
        border-radius: 8px 8px 0 0;

        .${prefixCls}-modal-title {
          font-weight: 600;
          color: #1c1c1c; // Dark text
          font-size: 18px;
        }
      }

      .${prefixCls}-modal-body {
        padding: 24px;
        color: #1c1c1c; // Dark text
        line-height: 1.6;
      }

      .${prefixCls}-modal-footer {
        border-top: 1px solid #edeff1; // Light border
        padding: 16px 24px;
        background: #f8f9fa; // Very light background
        border-radius: 0 0 8px 8px;
      }
    }

    // Enhanced Message & Notification
    .${prefixCls}-message {
      .${prefixCls}-message-notice {
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

        .${prefixCls}-message-notice-content {
          padding: 12px 16px;
          font-weight: 500;
        }
      }
    }

    .${prefixCls}-notification {
      .${prefixCls}-notification-notice {
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border: 1px solid #e5e7eb;

        .${prefixCls}-notification-notice-message {
          font-weight: 600;
          color: #1f2937;
        }

        .${prefixCls}-notification-notice-description {
          color: #6b7280;
          line-height: 1.5;
        }
      }
    }

    // Reddit-style Menu
    .${prefixCls}-menu {
      border-radius: 0; // No radius for menu
      border: 1px solid #edeff1; // Light border
      background: #ffffff; // White background

      .${prefixCls}-menu-item {
        margin: 2px 4px; // Smaller margins
        border-radius: 4px; // Reddit style
        color: #878a8c; // Reddit gray

        &:hover {
          background: #f6f7f8; // Very light hover
          color: #1c1c1c; // Dark text on hover
        }

        &.${prefixCls}-menu-item-selected {
          background: #ff4500; // Orange background
          color: #1c1c1c; // Black text
          font-weight: 500;
        }
      }

      .${prefixCls}-menu-submenu-title {
        margin: 2px 4px; // Smaller margins
        border-radius: 4px; // Reddit style
        color: #878a8c; // Reddit gray

        &:hover {
          background: #f6f7f8; // Very light hover
          color: #ff4500; // Reddit orange
        }
      }
    }

    // Enhanced Drawer
    .${prefixCls}-drawer {
      .${prefixCls}-drawer-header {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-bottom: 1px solid #e5e7eb;
        padding: 20px 24px;

        .${prefixCls}-drawer-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
      }

      .${prefixCls}-drawer-body {
        padding: 24px;
        color: #374151;
      }
    }

    // Reddit-style Form Labels & Validation
    .${prefixCls}-form {
      .${prefixCls}-form-item-label > label {
        font-weight: 500;
        color: #1c1c1c; // Dark label text
        font-size: 14px;
      }

      .${prefixCls}-form-item-explain-error {
        color: #ea0027; // Reddit red
        font-size: 12px;
        margin-top: 4px;
      }

      .${prefixCls}-form-item-has-error {
        .${prefixCls}-input,
          .${prefixCls}-input-affix-wrapper,
          .${prefixCls}-select
          .${prefixCls}-select-selector {
          border-color: #ea0027; // Reddit red

          &:focus,
          &.${prefixCls}-input-affix-wrapper-focused,
            &.${prefixCls}-select-focused {
            border-color: #ea0027; // Reddit red
            box-shadow: 0 0 0 2px rgba(234, 0, 39, 0.2); // Red outline
          }
        }
      }
    }

    // Reddit-style Steps
    .${prefixCls}-steps {
      .${prefixCls}-steps-item-process .${prefixCls}-steps-item-icon {
        background: #ff4500; // Reddit orange
        border-color: #ff4500; // Reddit orange
      }

      .${prefixCls}-steps-item-finish .${prefixCls}-steps-item-icon {
        background: #46d160; // Reddit green
        border-color: #46d160; // Reddit green
      }

      .${prefixCls}-steps-item-title {
        font-weight: 500;
        color: #1c1c1c; // Dark text
      }

      .${prefixCls}-steps-item-description {
        color: #878a8c; // Reddit gray
        font-size: 13px;
      }
    }

    // Reddit-style Tabs
    .${prefixCls}-tabs {
      .${prefixCls}-tabs-tab {
        padding: 12px 16px;
        color: #878a8c; // Reddit gray
        font-weight: 500;

        &:hover {
          color: #ff4500; // Reddit orange
        }

        &.${prefixCls}-tabs-tab-active {
          background: #ff4500; // Orange background
          color: #1c1c1c; // Black text
          font-weight: 600;
          padding: 12px 16px;
          border-radius: 4px;
        }
      }

      .${prefixCls}-tabs-ink-bar {
        background: #ff4500; // Reddit orange
        height: 3px;
        border-radius: 2px;
      }

      .${prefixCls}-tabs-content-holder {
        padding: 20px 0;
      }
    }

    // Enhanced Breadcrumb
    .${prefixCls}-breadcrumb {
      .${prefixCls}-breadcrumb-link {
        color: #6b7280;
        transition: color 0.2s ease;

        &:hover {
          color: #fa8c16;
        }
      }

      .${prefixCls}-breadcrumb-separator {
        color: #9ca3af;
      }
    }

    // Enhanced Alert
    .${prefixCls}-alert {
      border-radius: 8px;
      border: 1px solid;

      &.${prefixCls}-alert-success {
        background: #f0fdf4;
        border-color: #bbf7d0;

        .${prefixCls}-alert-message {
          color: #166534;
        }
      }

      &.${prefixCls}-alert-warning {
        background: #fffbeb;
        border-color: #fde68a;

        .${prefixCls}-alert-message {
          color: #a16207;
        }
      }

      &.${prefixCls}-alert-error {
        background: #fef2f2;
        border-color: #fecaca;

        .${prefixCls}-alert-message {
          color: #b91c1c;
        }
      }

      &.${prefixCls}-alert-info {
        background: #eff6ff;
        border-color: #bfdbfe;

        .${prefixCls}-alert-message {
          color: #1e40af;
        }
      }
    }

    // Enhanced Tooltip
    .${prefixCls}-tooltip {
      .${prefixCls}-tooltip-inner {
        background: #1f2937;
        color: #ffffff;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .${prefixCls}-tooltip-arrow::before {
        background: #1f2937;
      }
    }

    // Enhanced Loading States
    .${prefixCls}-spin {
      .${prefixCls}-spin-dot {
        .${prefixCls}-spin-dot-item {
          background-color: #fa8c16;
        }
      }
    }

    // Enhanced Empty State
    .${prefixCls}-empty {
      .${prefixCls}-empty-description {
        color: #9ca3af;
        font-size: 14px;
      }
    }
  `,
}));

// Reddit-style Button styles dengan Ant Design rounded
export const useButtonStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    // Primary Button - Reddit Orange Gradient dengan Ant Design style
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      > span {
        position: relative;
        z-index: 1;
      }

      &::before {
        content: "";
        background: linear-gradient(
          135deg,
          #ff4500 0%,
          #ff6b35 50%,
          #ff4500 100%
        ); // Reddit orange gradient
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: inherit; // Mengikuti border-radius Ant Design
        box-shadow: 0 2px 8px rgba(255, 69, 0, 0.25); // Soft Reddit orange shadow
      }

      &:hover::before {
        background: linear-gradient(
          135deg,
          #e03d00 0%,
          #ff5722 50%,
          #e03d00 100%
        ); // Darker gradient on hover
        box-shadow: 0 4px 12px rgba(255, 69, 0, 0.35);
        transform: translateY(-2px);
      }

      &:active::before {
        background: linear-gradient(
          135deg,
          #cc3700 0%,
          #e64a19 50%,
          #cc3700 100%
        ); // Even darker on active
        transform: scale(0.98);
        box-shadow: 0 1px 4px rgba(255, 69, 0, 0.3);
      }

      &:focus::before {
        box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.2),
          0 2px 8px rgba(255, 69, 0, 0.25); // Orange focus ring
      }

      // Ripple effect untuk interaksi
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at center,
          rgba(255, 255, 255, 0.3) 0%,
          transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: inherit; // Mengikuti border-radius Ant Design
        pointer-events: none;
      }

      &:active::after {
        opacity: 1;
        animation: redditRipple 0.6s ease-out;
      }

      @keyframes redditRipple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    }

    // Default Button - Ant Design style dengan Reddit colors
    &.${prefixCls}-btn-default:not([disabled]) {
      background: #ffffff;
      border: 1px solid #edeff1; // Light border
      color: #1c1c1c; // Dark text
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: #f6f7f8; // Very light hover
        border-color: #ff4500; // Reddit orange border on hover
        color: #ff4500; // Reddit orange text on hover
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        background: #edeff1; // Light active
        border-color: #ff4500;
        transform: scale(0.98);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }

      &:focus {
        border-color: #ff4500; // Orange focus
        box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.2);
      }
    }

    // Text Button - Ant Design style dengan Reddit colors
    &.${prefixCls}-btn-text:not([disabled]) {
      color: #878a8c; // Reddit gray
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background: #f6f7f8; // Very light hover
        color: #ff4500; // Orange on hover
        transform: translateY(-1px);
      }

      &:active {
        background: #edeff1;
        color: #ff4500;
        transform: scale(0.95);
      }
    }

    // Link Button - Reddit blue dengan Ant Design style
    &.${prefixCls}-btn-link:not([disabled]) {
      color: #0079d3; // Reddit blue for links
      font-weight: 500;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        color: #0066b3; // Darker blue on hover
        text-decoration: underline;
        transform: translateY(-1px);
      }

      &:active {
        color: #004c85; // Even darker on active
        transform: scale(0.98);
      }
    }

    // Danger Button - Reddit red gradient dengan Ant Design style
    &.${prefixCls}-btn-dangerous:not([disabled]) {
      > span {
        position: relative;
        z-index: 1;
      }

      &::before {
        content: "";
        background: linear-gradient(
          135deg,
          #ea0027 0%,
          #ff1744 50%,
          #ea0027 100%
        ); // Reddit red gradient
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: inherit; // Mengikuti border-radius Ant Design
        box-shadow: 0 2px 8px rgba(234, 0, 39, 0.25);
      }

      &:hover::before {
        background: linear-gradient(
          135deg,
          #d10024 0%,
          #e91e63 50%,
          #d10024 100%
        );
        box-shadow: 0 4px 12px rgba(234, 0, 39, 0.35);
        transform: translateY(-2px);
      }

      &:active::before {
        background: linear-gradient(
          135deg,
          #b80020 0%,
          #c2185b 50%,
          #b80020 100%
        );
        transform: scale(0.98);
        box-shadow: 0 1px 4px rgba(234, 0, 39, 0.3);
      }

      &:focus::before {
        box-shadow: 0 0 0 3px rgba(234, 0, 39, 0.2),
          0 2px 8px rgba(234, 0, 39, 0.25);
      }
    }
  `,
}));

// Button configuration
export const useButtonConfig = () => {
  const { styles } = useButtonStyle();
  const { styles: globalStyles } = useGlobalStyle();
  return {
    className: `${styles.linearGradientButton} ${globalStyles.globalStyle}`,
  };
};

// Reddit authentic theme configuration
export const useThemeConfig = () => {
  const breakPoint = Grid.useBreakpoint();
  return {
    components: {
      Card: {
        paddingLG: breakPoint.xs ? 16 : 20,
        borderRadius: 8, // Slightly rounded seperti gambar
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", // Very subtle shadow seperti Reddit
        colorBg: "#FAFBFC", // Sedikit gelap dari putih murni
        colorBorder: "#E5E7EB", // Very light gray border seperti gambar
        colorBorderSecondary: "#F3F4F6", // Even lighter border
        headerBg: "#FFFFFF", // White header
        bodyBg: "#FFFFFF", // White body
      },
      Button: {
        borderRadius: 4, // Reddit style
        fontWeight: 500,
        controlHeight: 36,
        controlHeightLG: 44,
        controlHeightSM: 28,
        colorPrimary: "#FF4500", // Reddit orange
      },
      Input: {
        borderRadius: 4, // Reddit style
        paddingInline: 12,
        paddingBlock: 8,
        controlHeight: 36,
        controlHeightLG: 44,
        controlHeightSM: 28,
        colorBorder: "#EDEFF1", // Light border
        colorBorderHover: "#FF4500", // Orange hover
      },
      Select: {
        borderRadius: 4, // Reddit style
        controlHeight: 36,
        controlHeightLG: 44,
        controlHeightSM: 28,
        colorBorder: "#EDEFF1", // Light border
      },
      Table: {
        borderRadius: 4, // Reddit style
        headerBg: "#F8F9FA", // Very light header
        headerColor: "#1C1C1C", // Dark header text
        cellPaddingBlock: 16,
        cellPaddingInline: 20,
        colorBorder: "#EDEFF1", // Light borders
      },
      Tag: {
        borderRadius: 4, // Reddit style
        paddingInline: 8,
        paddingBlock: 2,
        fontWeight: 500,
        fontSize: 12,
      },
      Modal: {
        borderRadius: 8, // Slightly rounded untuk modal
        headerBg: "#FFFFFF", // White header
        footerBg: "#F8F9FA", // Light footer
        colorBorder: "#EDEFF1", // Light border
      },
      Drawer: {
        headerBg: "#FFFFFF", // White header
        colorBg: "#FFFFFF", // White background
      },
      Form: {
        labelFontWeight: 500,
        labelColor: "#1C1C1C", // Dark label
        verticalLabelPadding: "0 0 8px",
      },
      Menu: {
        borderRadius: 0, // No radius untuk menu
        itemBorderRadius: 4,
        itemMarginBlock: 2,
        itemMarginInline: 4,
        colorItemBgHover: "#F6F7F8", // Very light hover
        colorItemBgSelected: "#FF4500", // Orange background selected
        colorItemTextHover: "#1C1C1C", // Dark hover text
        colorItemTextSelected: "#1C1C1C", // Black selected text
        colorItemText: "#878A8C", // Reddit gray text
      },
      Steps: {
        colorPrimary: "#FF4500", // Reddit orange
        colorSuccess: "#46D160", // Reddit green
      },
      Tabs: {
        colorPrimaryActive: "#FF4500", // Reddit orange
        colorPrimaryHover: "#FF4500", // Reddit orange
        inkBarColor: "#FF4500", // Reddit orange
        colorTextActive: "#1C1C1C", // Black text for active
        colorBgActive: "#FF4500", // Orange background for active
      },
      Alert: {
        borderRadius: 4, // Reddit style
      },
      Notification: {
        borderRadius: 4, // Reddit style
      },
      Message: {
        borderRadius: 4, // Reddit style
      },
    },
    token: {
      // Reddit authentic colors
      colorPrimary: "#FF4500", // Reddit orange
      colorSuccess: "#46D160", // Reddit green
      colorWarning: "#FFB000", // Reddit warning yellow
      colorError: "#EA0027", // Reddit error red
      colorInfo: "#0079D3", // Reddit blue

      fontSize: 14,
      fontFamily: useFontJakarta(),
      fontWeightStrong: 600,

      // Border radius - Reddit style (minimal)
      borderRadius: 4,
      borderRadiusLG: 8,
      borderRadiusXS: 2,
      borderRadiusSM: 4,

      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      lineHeight: 1.6,
      lineHeightLG: 1.6,
      lineHeightSM: 1.5,

      // Reddit style shadows
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      boxShadowSecondary: "0 2px 6px rgba(0, 0, 0, 0.15)",
      boxShadowTertiary: "0 4px 12px rgba(0, 0, 0, 0.15)",

      // Reddit authentic color palette
      colorText: "#1C1C1C", // Reddit dark text
      colorTextSecondary: "#878A8C", // Reddit gray
      colorTextTertiary: "#A5A4A4", // Reddit light gray
      colorTextDescription: "#A5A4A4", // Reddit light gray

      // Background colors
      colorBgBase: "#FFFFFF", // White base
      colorBgContainer: "#FFFFFF", // White containers
      colorBgElevated: "#FFFFFF", // White elevated
      colorBgLayout: "#FFFFFF", // White layout

      // Border colors
      colorBorder: "#EDEFF1", // Reddit light border
      colorBorderSecondary: "#F6F7F8", // Very light border

      // Fill colors
      colorFill: "#F6F7F8", // Light fill
      colorFillSecondary: "#F8F9FA", // Very light fill

      // Interactive states - Reddit style
      controlItemBgHover: "#F6F7F8", // Light hover
      controlItemBgActive: "#FF4500", // Orange active
      controlItemBgActiveHover: "#E73C00", // Darker orange

      // Focus states - Reddit orange
      controlOutline: "rgba(255, 69, 0, 0.2)", // Orange outline
      controlOutlineWidth: 2,

      // Link colors
      colorLink: "#0079D3", // Reddit blue links (bukan orange)
      colorLinkHover: "#0066B3", // Darker blue hover
      colorLinkActive: "#004C85", // Even darker blue active
    },
  };
};

// Locale configuration
export const getLocaleConfig = () => {
  return id;
};

// Main hook untuk semua config
export const useAntdConfig = () => {
  const buttonConfig = useButtonConfig();
  const themeConfig = useThemeConfig();
  const localeConfig = getLocaleConfig();
  const { styles } = useGlobalStyle();

  return {
    button: buttonConfig,
    theme: themeConfig,
    locale: localeConfig,
    globalStyles: styles.globalStyle,
  };
};

// Export global style hook untuk digunakan di komponen utama
export const useGlobalStyles = () => {
  const { styles } = useGlobalStyle();
  return styles;
};

export const layoutToken = {
  // Reddit authentic colors - sangat terang dan clean
  bgLayout: "#FFFFFF", // Background utama putih bersih seperti Reddit asli
  colorPrimary: "#FF4500", // Reddit orange (official Reddit color)

  // App list styling
  colorBgAppListIconHover: "rgba(255,69,0,0.1)", // Light orange hover
  colorTextAppListIconHover: "#FF4500", // Reddit orange
  colorTextAppListIcon: "#878A8C", // Reddit gray untuk icons

  sider: {
    // Reddit authentic sidebar - sangat terang
    colorBgCollapsedButton: "#FF4500", // Reddit orange untuk tombol collapse
    colorTextCollapsedButtonHover: "#FFFFFF", // Putih saat hover
    colorTextCollapsedButton: "#FFFFFF", // Putih untuk teks tombol collapse
    colorMenuBackground: "#FFFFFF", // Background sidebar putih bersih
    colorBgMenuItemCollapsedElevated: "#F8F9FA", // Very light gray
    colorMenuItemDivider: "rgba(135,138,140,0.2)", // Subtle divider seperti Reddit
    colorBgMenuItemHover: "#F6F7F8", // Very light hover background
    colorBgMenuItemSelected: "#FF4500", // Orange background untuk selected
    colorTextMenuSelected: "#FFFFFF", // Black text untuk selected
    colorTextMenuItemHover: "#1C1C1C", // Dark text saat hover
    colorTextMenu: "#1C1C1C", // Lighter gray untuk secondary
    colorTextMenuSecondary: "#A5A4A4", // Lighter gray untuk secondary
    colorTextMenuTitle: "#1C1C1C", // Dark untuk menu title
    colorTextMenuActive: "#FFFFFF", // Black text untuk active
    colorTextSubMenuSelected: "#FFFFFF", // Black text untuk submenu selected
  },

  header: {
    // Reddit authentic header
    colorBgHeader: "#FFFFFF", // Header putih bersih
    colorBgRightActionsItemHover: "rgba(255,69,0,0.1)", // Light orange hover
    colorTextRightActionsItem: "#1C1C1C", // Gray untuk actions
    colorHeaderTitle: "#1C1C1C", // Dark untuk title
    colorBgMenuItemHover: "#F6F7F8", // Light hover
    colorBgMenuItemSelected: "#FF4500", // Orange background selected
    colorTextMenuSelected: "#FFFFFF", // Black text selected
    colorTextMenu: "#FFFFFF", // Gray menu text
    colorTextMenuSecondary: "#1C1C1C", // Light gray secondary
    colorTextMenuActive: "#1C1C1C", // Dark active text
  },

  // Content area - Reddit style
  content: {
    colorBg: "#FFFFFF", // Content area putih bersih
    colorText: "#1C1C1C", // Dark text untuk readability
    colorTextSecondary: "#1C1C1C", // Gray untuk secondary text
    colorBorder: "#EDEFF1", // Light border seperti Reddit
    colorBgElevated: "#FFFFFF", // Background untuk cards
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Subtle shadow
  },

  // Cards & Components
  card: {
    colorBg: "#FFFFFF", // Pure white background seperti gambar
    colorBorder: "#E5E7EB", // Very light gray border seperti gambar
    colorBorderHover: "#D1D5DB", // Slightly darker on hover
    colorText: "#1C1C1C", // Dark text
    colorTextSecondary: "#1C1C1C", // Softer gray secondary text
    colorTextTertiary: "#1C1C1C", // Even lighter gray
    borderRadius: "8px", // Rounded seperti gambar
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)", // Very subtle shadow
    boxShadowHover: "0 2px 4px rgba(0,0,0,0.08)", // Slight elevation on hover
  },

  // Footer - minimal styling
  footer: {
    colorBg: "#F8F9FA", // Very light gray
    colorText: "#1C1C1C", // Gray text
    colorTextSecondary: "#A5A4A4", // Lighter gray
    borderTop: "1px solid #EDEFF1", // Subtle border
  },
};
