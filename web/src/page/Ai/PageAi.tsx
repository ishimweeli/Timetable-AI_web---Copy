import React from "react";
import Header from "@/component/Core/layout/Header.tsx";
import Sidebar from "@/component/Core/layout/Sidebar.tsx";
import { Users } from "lucide-react";

const PageAi = () => {
  return (
    <div className="flex h-screen bg-background-main">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-3xl font-bold">Ai</h1>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageAi;
