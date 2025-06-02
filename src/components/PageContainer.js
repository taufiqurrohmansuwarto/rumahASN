import React, { forwardRef } from "react";
import { PageContainer as AntdPageContainer } from "@ant-design/pro-layout";

const PageContainer = forwardRef(({ children, style, ...props }, ref) => {
  const combinedStyle = {
    fontFamily: "Google Sans, Roboto, Arial, sans-serif",
    ...style,
  };

  return (
    <AntdPageContainer ref={ref} style={combinedStyle} {...props}>
      {children}
    </AntdPageContainer>
  );
});

PageContainer.displayName = "PageContainer";

export default PageContainer;
