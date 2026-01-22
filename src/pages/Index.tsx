import { useState } from "react";
import { SelectionPage } from "./Selection";
import { ChatLoginPage } from "./ChatLoginPage";
import { SupportLoginPage } from "./SupportLoginPage";

type Page = "selection" | "chat" | "support";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>("selection");

  return (
    <>
      {currentPage === "selection" && (
        <SelectionPage
          onSelectChat={() => setCurrentPage("chat")}
          onSelectSupport={() => setCurrentPage("support")}
        />
      )}
      {currentPage === "chat" && (
        <ChatLoginPage onBack={() => setCurrentPage("selection")} />
      )}
      {currentPage === "support" && (
        <SupportLoginPage onBack={() => setCurrentPage("selection")} />
      )}
    </>
  );
};

export default Index;
