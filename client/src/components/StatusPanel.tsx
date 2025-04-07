import React from "react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StatusPanelProps {
  repositoryId: number | null;
}

interface ImportStep {
  id: number;
  repositoryId: number;
  step: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  output?: string;
  timestamp: Date;
}

export function StatusPanel({ repositoryId }: StatusPanelProps) {
  const [outputLines, setOutputLines] = React.useState<string[]>([
    "Waiting for import to start...",
  ]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/repository", repositoryId],
    enabled: !!repositoryId,
    refetchInterval: repositoryId ? 2000 : false, // Poll every 2 seconds when an import is in progress
  });

  React.useEffect(() => {
    if (data?.steps) {
      const allOutput: string[] = [];
      data.steps.forEach((step: ImportStep) => {
        if (step.output) {
          const lines = step.output.split("\n");
          allOutput.push(...lines);
        }
      });
      
      if (allOutput.length > 0) {
        setOutputLines(allOutput);
      }
    }
  }, [data]);

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!data?.steps) return 0;
    
    const steps = data.steps as ImportStep[];
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => 
      s.status === "completed" || s.status === "skipped"
    ).length;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const progress = calculateProgress();
  
  // Generate file structure preview (simulated for demo)
  const fileStructure = [
    { path: "my-project/", isDirectory: true, level: 0 },
    { path: "node_modules/", isDirectory: true, level: 1 },
    { path: "public/", isDirectory: true, level: 1 },
    { path: "index.html", isDirectory: false, level: 2 },
    { path: "style.css", isDirectory: false, level: 2 },
    { path: "script.js", isDirectory: false, level: 2 },
    { path: "src/", isDirectory: true, level: 1 },
    { path: "components/", isDirectory: true, level: 2 },
    { path: "Component1.js", isDirectory: false, level: 3 },
    { path: "Component2.js", isDirectory: false, level: 3 },
    { path: "index.js", isDirectory: false, level: 2 },
    { path: "utils.js", isDirectory: false, level: 2 },
    { path: "package.json", isDirectory: false, level: 1 },
    { path: "package-lock.json", isDirectory: false, level: 1 },
    { path: "server.js", isDirectory: false, level: 1 },
    { path: "README.md", isDirectory: false, level: 1 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Import Status</h2>
      
      {/* Import Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <Progress value={progress} className="w-full" />
        
        <div className="mt-4 space-y-2">
          {data?.steps ? (
            (data.steps as ImportStep[]).map((step) => (
              <div key={step.id} className="flex items-center">
                <span className={`flex-shrink-0 h-5 w-5 ${
                  step.status === "completed" ? "text-green-500" : 
                  step.status === "in_progress" ? "text-blue-500 animate-pulse" :
                  step.status === "failed" ? "text-red-500" :
                  step.status === "skipped" ? "text-yellow-500" :
                  "text-gray-300"
                }`}>
                  {step.status === "completed" ? "✓" : 
                   step.status === "in_progress" ? "⟳" :
                   step.status === "failed" ? "✗" :
                   step.status === "skipped" ? "⚠" :
                   "○"}
                </span>
                <span className={`ml-2 text-sm ${
                  step.status === "pending" ? "text-gray-400" : "text-gray-600"
                }`}>
                  {step.step}
                  {step.status === "skipped" && " (skipped)"}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              {isLoading ? "Loading status..." : "No active import process"}
            </div>
          )}
        </div>
      </div>
      
      {/* Terminal Output */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Console Output</h3>
        <div className="bg-[#1E293B] text-[#E2E8F0] p-3 rounded-md h-64 overflow-y-auto font-mono text-sm">
          <ScrollArea className="h-full">
            {outputLines.map((line, idx) => (
              <div key={idx} className="mb-1">
                {line.includes("WARN") ? (
                  <span className="text-yellow-300">{line}</span>
                ) : line.includes("ERROR") ? (
                  <span className="text-red-300">{line}</span>
                ) : line.includes("+") || line.includes("success") ? (
                  <span className="text-green-300">{line}</span>
                ) : line.includes("Installing") ? (
                  <span className="text-blue-300">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
      
      {/* File Structure Preview */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Project Structure</h3>
        <div className="border border-gray-200 rounded-md p-3 h-56 overflow-y-auto text-sm font-mono">
          <ScrollArea className="h-full">
            {fileStructure.map((item, idx) => (
              <div key={idx} className={`pl-${item.level * 4}`}>
                {item.isDirectory ? (
                  <span>📁 {item.path}</span>
                ) : (
                  <span>📄 {item.path}</span>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
