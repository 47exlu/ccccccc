import React from "react";
import { ImportPanel } from "@/components/ImportPanel";
import { StatusPanel } from "@/components/StatusPanel";
import { InfoCard, InfoItem, Instructions } from "@/components/InfoCard";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [activeRepositoryId, setActiveRepositoryId] = React.useState<number | null>(null);
  
  const { data } = useQuery({
    queryKey: ["/api/repository", activeRepositoryId],
    enabled: !!activeRepositoryId,
  });

  const handleImportStarted = (repositoryId: number) => {
    setActiveRepositoryId(repositoryId);
  };

  const setupInstructions = [
    { text: "Import completed to", code: "./my-project" },
    { text: "To start the server", code: "npm start" },
    { text: "For development mode", code: "npm run dev" },
    { text: "Access app at", code: "http://localhost:3000" },
    { text: "Read documentation at", code: "./README.md" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">GitHub Repository Importer</h1>
        <p className="text-gray-600">
          Import files from GitHub repositories and set up your project environment
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImportPanel onImportStarted={handleImportStarted} />
        <StatusPanel repositoryId={activeRepositoryId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <InfoCard title="Repository Information">
          {data?.repository ? (
            <>
              <InfoItem label="Name" value={data.repository.name} />
              <InfoItem label="Owner" value={data.repository.owner} />
              <InfoItem label="Branch" value={data.repository.branch || "main"} />
              <InfoItem 
                label="Last Commit" 
                value={data.repository.lastCommit || "Unknown"} 
              />
              <InfoItem 
                label="License" 
                value={data.repository.license || "Unknown"} 
              />
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No repository selected. Start an import to see details.
            </p>
          )}
        </InfoCard>
        
        <InfoCard title="Detected Dependencies">
          {data?.dependencies && data.dependencies.length > 0 ? (
            <>
              {data.dependencies.map((dep: any) => (
                <InfoItem 
                  key={dep.id} 
                  label={dep.name} 
                  value={dep.version} 
                />
              ))}
              <InfoItem 
                label="Dev Dependencies" 
                value={`${data.dependencies.filter((d: any) => d.isDev).length} packages`} 
              />
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No dependencies detected yet. Start an import to see details.
            </p>
          )}
        </InfoCard>
        
        <InfoCard title="Setup Instructions">
          <Instructions items={setupInstructions} />
        </InfoCard>
      </div>

      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>GitHub Repository Importer Tool © 2023</p>
      </footer>
    </div>
  );
}
