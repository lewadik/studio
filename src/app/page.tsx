import { FileManagement } from "@/components/file-management";
import { SshTerminal } from "@/components/ssh-terminal";
import { Server } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center h-16 px-6 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Server className="w-6 h-6" />
          <span className="text-lg font-semibold">Remote Hub</span>
        </div>
      </header>
      <main className="grid flex-1 min-h-0 md:grid-cols-2">
        <div className="relative flex flex-col h-full overflow-hidden border-r">
          <FileManagement />
        </div>
        <div className="relative flex-col hidden h-full overflow-hidden md:flex">
          <SshTerminal />
        </div>
      </main>
    </div>
  );
}
