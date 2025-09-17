import { DebugDatabase } from "@/components/DebugDatabase";
import { DashboardHeader } from "@/components/yam/Header";

const DebugPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <h1 className="sr-only">Debug Tools</h1>
      <DashboardHeader />
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <DebugDatabase />
      </main>
    </div>
  );
};

export default DebugPage;


