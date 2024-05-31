import React from "react";

const ActiveTabContext = React.createContext({
  activeTab: "data-utama",
  setActiveTab: () => {},
});

function ActiveTabProvider({ children }) {
  const [activeTab, setActiveTab] = React.useState("data-utama");

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
}

function useActiveTab() {
  const context = React.useContext(ActiveTabContext);
  if (!context) {
    throw new Error("useActiveTab must be used within an ActiveTabProvider");
  }
  return context;
}

export { ActiveTabProvider, useActiveTab };
