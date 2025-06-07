import { FloatButton, Tooltip } from "antd";
import { MessageOutlined, RobotOutlined } from "@ant-design/icons";

function FloatChatButton({ onClick }) {
  return (
    <>
      <Tooltip title="Tanya  BestieAI BKD" placement="left">
        <FloatButton
          icon={
            <img
              src="https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-rect-avatar.png"
              alt="bestie AI"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                objectFit: "cover",
              }}
            />
          }
          onClick={onClick}
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
            border: "none",
            boxShadow: "0 6px 20px rgba(255, 69, 0, 0.3)",
            bottom: "24px",
            right: "24px",
          }}
          className="float-chat-button"
        />
      </Tooltip>

      <style jsx global>{`
        .float-chat-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          backdrop-filter: blur(10px) !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
        }

        .float-chat-button:hover {
          transform: translateY(-3px) scale(1.05) !important;
          box-shadow: 0 8px 24px rgba(255, 69, 0, 0.4) !important;
          background: linear-gradient(
            135deg,
            #ff6b35 0%,
            #ff4500 100%
          ) !important;
        }

        .float-chat-button:active {
          transform: translateY(-1px) scale(1.02) !important;
          box-shadow: 0 4px 16px rgba(255, 69, 0, 0.5) !important;
        }

        .float-chat-button .ant-float-btn-icon {
          color: white !important;
          font-size: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .float-chat-button::before {
          content: "";
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(135deg, #ff4500, #ff6b35, #ff8c42);
          border-radius: 50%;
          z-index: -1;
          opacity: 0;
          animation: pulseRing 3s ease-in-out infinite 1s;
        }

        .float-chat-button:hover::before {
          opacity: 0.4;
          animation: pulseRing 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 6px 20px rgba(255, 69, 0, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 8px 28px rgba(255, 69, 0, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 6px 20px rgba(255, 69, 0, 0.3);
          }
        }

        .float-chat-button .ant-float-btn-body {
          background: transparent !important;
          border: none !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .float-chat-button {
            width: 44px !important;
            height: 44px !important;
            bottom: 20px !important;
            right: 20px !important;
          }

          .float-chat-button .ant-float-btn-icon img {
            width: 24px !important;
            height: 24px !important;
          }
        }

        /* Add subtle animation on mount */
        .float-chat-button {
          animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1),
            pulse 3s ease-in-out infinite 1s;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulseRing {
          0% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.15);
          }
          100% {
            opacity: 0;
            transform: scale(1.3);
          }
        }
      `}</style>
    </>
  );
}

export default FloatChatButton;
