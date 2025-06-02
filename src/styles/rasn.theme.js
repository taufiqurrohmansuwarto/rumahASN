// config/antd-config.js
import { Grid } from "antd";
import id from "antd/locale/id_ID";
import { createStyles } from "antd-style";

// Global styles untuk komponen Ant Design
export const useGlobalStyle = createStyles(({ prefixCls, css, token }) => ({
  globalStyle: css`
    // Enhanced Typography untuk readability
    .${prefixCls}-typography {
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 0.5em;
        line-height: 1.3;
      }

      p {
        line-height: 1.6;
        color: #374151;
        margin-bottom: 1em;
      }

      .${prefixCls}-typography-copy {
        color: #6b7280;
      }
    }

    // Enhanced Table - Clean & Professional
    .${prefixCls}-table {
      .${prefixCls}-table-thead > tr > th {
        background: #f8fafc;
        border-bottom: 2px solid #e5e7eb;
        font-weight: 600;
        color: #374151;
        padding: 16px 20px;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        &:first-child {
          border-top-left-radius: 8px;
        }
        &:last-child {
          border-top-right-radius: 8px;
        }
      }

      .${prefixCls}-table-tbody > tr {
        transition: all 0.2s ease;

        &:hover {
          background: #fafbfc;
        }

        &:nth-child(even) {
          background: #fafafa;

          &:hover {
            background: #f3f4f6;
          }
        }

        > td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          color: #374151;
          vertical-align: middle;
        }
      }

      .${prefixCls}-table-container {
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .${prefixCls}-table-pagination {
        margin: 16px 0;

        .${prefixCls}-pagination-item {
          border-radius: 6px;
          border: 1px solid #e5e7eb;

          &:hover {
            border-color: #fa8c16;
            color: #fa8c16;
          }

          &.${prefixCls}-pagination-item-active {
            background: #fa8c16;
            border-color: #fa8c16;
          }
        }
      }
    }

    // Enhanced Form Components
    .${prefixCls}-input, .${prefixCls}-input-affix-wrapper {
      border-radius: 6px;
      border: 1.5px solid #e5e7eb;
      padding: 8px 12px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #cbd5e1;
      }

      &:focus,
      &.${prefixCls}-input-affix-wrapper-focused {
        border-color: #fa8c16;
        box-shadow: 0 0 0 3px rgba(250, 140, 22, 0.1);
      }
    }

    .${prefixCls}-select {
      .${prefixCls}-select-selector {
        border-radius: 6px;
        border: 1.5px solid #e5e7eb;
        transition: all 0.2s ease;

        &:hover {
          border-color: #cbd5e1;
        }
      }

      &.${prefixCls}-select-focused .${prefixCls}-select-selector {
        border-color: #fa8c16;
        box-shadow: 0 0 0 3px rgba(250, 140, 22, 0.1);
      }
    }

    .${prefixCls}-select-dropdown {
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;

      .${prefixCls}-select-item {
        padding: 8px 12px;
        border-radius: 4px;
        margin: 2px 6px;

        &:hover {
          background: #fef7f0;
          color: #fa8c16;
        }

        &.${prefixCls}-select-item-option-selected {
          background: #fa8c16;
          color: white;
          font-weight: 500;
        }
      }
    }

    // Enhanced Card Design
    .${prefixCls}-card {
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .${prefixCls}-card-head {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-bottom: 1px solid #e5e7eb;
        padding: 20px 24px;

        .${prefixCls}-card-head-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
      }

      .${prefixCls}-card-body {
        padding: 24px;
        color: #374151;
        line-height: 1.6;
      }

      .${prefixCls}-card-actions {
        border-top: 1px solid #f1f5f9;
        background: #fafbfc;

        > li {
          margin: 12px 0;

          > span {
            color: #6b7280;
            transition: color 0.2s ease;

            &:hover {
              color: #fa8c16;
            }
          }
        }
      }
    }

    // Enhanced Tag System
    .${prefixCls}-tag {
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      border: none;

      // Default tag
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      color: #3730a3;

      &.${prefixCls}-tag-success {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        color: #166534;
      }

      &.${prefixCls}-tag-warning {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #a16207;
      }

      &.${prefixCls}-tag-error {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #b91c1c;
      }

      &.${prefixCls}-tag-processing {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        color: #1e40af;
      }
    }

    // Enhanced Modal
    .${prefixCls}-modal {
      .${prefixCls}-modal-content {
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
      }

      .${prefixCls}-modal-header {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-bottom: 1px solid #e5e7eb;
        padding: 20px 24px;
        border-radius: 12px 12px 0 0;

        .${prefixCls}-modal-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 18px;
        }
      }

      .${prefixCls}-modal-body {
        padding: 24px;
        color: #374151;
        line-height: 1.6;
      }

      .${prefixCls}-modal-footer {
        border-top: 1px solid #f1f5f9;
        padding: 16px 24px;
        background: #fafbfc;
        border-radius: 0 0 12px 12px;
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

    // Enhanced Menu
    .${prefixCls}-menu {
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: #ffffff;

      .${prefixCls}-menu-item {
        margin: 4px 8px;
        border-radius: 6px;
        color: #374151;

        &:hover {
          background: #fef7f0;
          color: #fa8c16;
        }

        &.${prefixCls}-menu-item-selected {
          background: #fa8c16;
          color: white;
          font-weight: 500;
        }
      }

      .${prefixCls}-menu-submenu-title {
        margin: 4px 8px;
        border-radius: 6px;
        color: #374151;

        &:hover {
          background: #fef7f0;
          color: #fa8c16;
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

    // Enhanced Form Labels & Validation
    .${prefixCls}-form {
      .${prefixCls}-form-item-label > label {
        font-weight: 500;
        color: #374151;
        font-size: 14px;
      }

      .${prefixCls}-form-item-explain-error {
        color: #dc2626;
        font-size: 12px;
        margin-top: 4px;
      }

      .${prefixCls}-form-item-has-error {
        .${prefixCls}-input,
          .${prefixCls}-input-affix-wrapper,
          .${prefixCls}-select
          .${prefixCls}-select-selector {
          border-color: #dc2626;

          &:focus,
          &.${prefixCls}-input-affix-wrapper-focused,
            &.${prefixCls}-select-focused {
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
          }
        }
      }
    }

    // Enhanced Steps
    .${prefixCls}-steps {
      .${prefixCls}-steps-item-process .${prefixCls}-steps-item-icon {
        background: #fa8c16;
        border-color: #fa8c16;
      }

      .${prefixCls}-steps-item-finish .${prefixCls}-steps-item-icon {
        background: #22c55e;
        border-color: #22c55e;
      }

      .${prefixCls}-steps-item-title {
        font-weight: 500;
        color: #374151;
      }

      .${prefixCls}-steps-item-description {
        color: #6b7280;
        font-size: 13px;
      }
    }

    // Enhanced Tabs
    .${prefixCls}-tabs {
      .${prefixCls}-tabs-tab {
        padding: 12px 16px;
        color: #6b7280;
        font-weight: 500;

        &:hover {
          color: #fa8c16;
        }

        &.${prefixCls}-tabs-tab-active {
          color: #fa8c16;
          font-weight: 600;
        }
      }

      .${prefixCls}-tabs-ink-bar {
        background: #fa8c16;
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

// Button styles
export const useButtonStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      > span {
        position: relative;
      }

      &::before {
        content: "";
        background: linear-gradient(135deg, #d4380d, #fa8c16);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: inherit;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      &:hover::before {
        opacity: 0.9;
        box-shadow: 0 4px 8px rgba(212, 56, 13, 0.4);
        transform: translateY(-1px);
      }

      &:active::before {
        transform: scale(0.98);
        box-shadow: 0 1px 2px rgba(212, 56, 13, 0.3);
      }

      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at center,
          rgba(255, 255, 255, 0.3) 0%,
          transparent 100%
        );
        opacity: 0;
        transition: opacity 0.3s;
        border-radius: inherit;
      }

      &:active::after {
        opacity: 1;
        animation: ripple 0.6s ease-out;
      }

      @keyframes ripple {
        from {
          transform: scale(0);
          opacity: 1;
        }
        to {
          transform: scale(2);
          opacity: 0;
        }
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

// Enhanced theme configuration
export const useThemeConfig = () => {
  const breakPoint = Grid.useBreakpoint();
  return {
    components: {
      Card: {
        paddingLG: breakPoint.xs ? 16 : 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      },
      Button: {
        borderRadius: 6,
        fontWeight: 500,
        controlHeight: 36,
        controlHeightLG: 44,
        controlHeightSM: 28,
      },
      Input: {
        borderRadius: 6,
        paddingInline: 12,
        paddingBlock: 8,
        controlHeight: 36,
        controlHeightLG: 44,
        controlHeightSM: 28,
      },
      Select: {
        borderRadius: 6,
        controlHeight: 36,
        controlHeightLG: 44,
        controlHeightSM: 28,
      },
      Table: {
        borderRadius: 8,
        headerBg: "#f8fafc",
        headerColor: "#374151",
        cellPaddingBlock: 16,
        cellPaddingInline: 20,
      },
      Tag: {
        borderRadius: 16,
        paddingInline: 12,
        paddingBlock: 4,
        fontWeight: 500,
        fontSize: 12,
      },
      Modal: {
        borderRadius: 12,
        headerBg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        footerBg: "#fafbfc",
      },
      Drawer: {
        headerBg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      },
      Form: {
        labelFontWeight: 500,
        labelColor: "#374151",
        verticalLabelPadding: "0 0 8px",
      },
      Menu: {
        borderRadius: 8,
        itemBorderRadius: 6,
        itemMarginBlock: 4,
        itemMarginInline: 8,
        colorItemBgHover: "#fef7f0",
        colorItemBgSelected: "#FA8C16",
        colorItemTextHover: "#FA8C16",
        colorItemTextSelected: "#ffffff",
      },
      Steps: {
        colorPrimary: "#FA8C16",
        colorSuccess: "#22c55e",
      },
      Tabs: {
        colorPrimaryActive: "#FA8C16",
        colorPrimaryHover: "#FA8C16",
        inkBarColor: "#FA8C16",
      },
      Alert: {
        borderRadius: 8,
      },
      Notification: {
        borderRadius: 8,
      },
      Message: {
        borderRadius: 8,
      },
    },
    token: {
      colorPrimary: "#FA8C16",
      colorSuccess: "#22c55e",
      colorWarning: "#f59e0b",
      colorError: "#dc2626",
      colorInfo: "#3b82f6",
      fontSize: 14,
      fontFamily: "Google Sans, Roboto, Arial, sans-serif",
      fontWeightStrong: 600,
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusXS: 4,
      borderRadiusSM: 6,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      lineHeight: 1.6,
      lineHeightLG: 1.6,
      lineHeightSM: 1.5,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      boxShadowSecondary: "0 4px 16px rgba(0, 0, 0, 0.1)",
      boxShadowTertiary: "0 8px 24px rgba(0, 0, 0, 0.12)",
      // Color palette untuk readability
      colorText: "#374151",
      colorTextSecondary: "#6b7280",
      colorTextTertiary: "#9ca3af",
      colorBgBase: "#ffffff",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#f8fafc",
      colorBorder: "#e5e7eb",
      colorBorderSecondary: "#f1f5f9",
      colorFill: "#f3f4f6",
      colorFillSecondary: "#f9fafb",
      // Interactive states
      controlItemBgHover: "#fef7f0",
      controlItemBgActive: "#FA8C16",
      controlItemBgActiveHover: "#f97316",
      // Focus states
      controlOutline: "rgba(250, 140, 22, 0.1)",
      controlOutlineWidth: 3,
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
