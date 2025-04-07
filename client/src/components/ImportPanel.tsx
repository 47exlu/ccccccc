import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface ImportPanelProps {
  onImportStarted: (repositoryId: number) => void;
}

interface FormValues {
  repoUrl: string;
  destinationDir: string;
  installDependencies: boolean;
  setupNodeBackend: boolean;
  preserveStructure: boolean;
}

export function ImportPanel({ onImportStarted }: ImportPanelProps) {
  const { toast } = useToast();
  const [repoStatus, setRepoStatus] = React.useState<{
    valid: boolean;
    message: string;
    owner?: string;
    name?: string;
  } | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      repoUrl: "https://github.com/47exlu/adawdadaadaz/",
      destinationDir: "./my-project",
      installDependencies: true,
      setupNodeBackend: true,
      preserveStructure: true
    }
  });

  const repoUrl = watch("repoUrl");

  const validateMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch(`/api/validate-repo?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to validate repository");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setRepoStatus(data);
    },
    onError: (error) => {
      setRepoStatus({
        valid: false,
        message: error.message || "Invalid repository URL"
      });
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate repository",
        variant: "destructive"
      });
    }
  });

  const importMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/import", {
        repositoryUrl: data.repoUrl,
        destinationDir: data.destinationDir,
        installDependencies: data.installDependencies,
        setupNodeBackend: data.setupNodeBackend,
        preserveStructure: data.preserveStructure
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Started",
        description: "Repository import process has started successfully"
      });
      onImportStarted(data.repository.id);
    },
    onError: (error) => {
      toast({
        title: "Import Error",
        description: error.message || "Failed to start import process",
        variant: "destructive"
      });
    }
  });

  const validateRepository = () => {
    if (!repoUrl) {
      setRepoStatus({
        valid: false,
        message: "Please enter a repository URL"
      });
      return;
    }
    validateMutation.mutate(repoUrl);
  };

  const onSubmit = (data: FormValues) => {
    importMutation.mutate(data);
  };

  const handleReset = () => {
    reset();
    setRepoStatus(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Import Configuration</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Repository URL Input */}
        <div className="mb-4">
          <Label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Repository URL
          </Label>
          <div className="flex">
            <Input
              id="repoUrl"
              className="flex-grow rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/username/repository"
              {...register("repoUrl", { required: "Repository URL is required" })}
            />
            <Button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
              onClick={validateRepository}
              disabled={validateMutation.isPending}
            >
              {validateMutation.isPending ? "Validating..." : "Validate"}
            </Button>
          </div>
          {repoStatus && (
            <p className={`mt-1 text-sm ${repoStatus.valid ? 'text-green-600' : 'text-red-600'}`}>
              {repoStatus.valid ? '✓' : '✗'} {repoStatus.message}
            </p>
          )}
          {errors.repoUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.repoUrl.message}</p>
          )}
        </div>

        {/* Project Setup Options */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Setup Options</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Checkbox
                id="installDependencies"
                {...register("installDependencies")}
              />
              <Label
                htmlFor="installDependencies"
                className="ml-2 block text-sm text-gray-700"
              >
                Install dependencies automatically
              </Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox
                id="setupNodeBackend"
                {...register("setupNodeBackend")}
              />
              <Label
                htmlFor="setupNodeBackend"
                className="ml-2 block text-sm text-gray-700"
              >
                Configure Node.js backend
              </Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox
                id="preserveStructure"
                {...register("preserveStructure")}
              />
              <Label
                htmlFor="preserveStructure"
                className="ml-2 block text-sm text-gray-700"
              >
                Maintain original project structure
              </Label>
            </div>
          </div>
        </div>

        {/* Destination Directory */}
        <div className="mb-6">
          <Label htmlFor="destinationDir" className="block text-sm font-medium text-gray-700 mb-1">
            Destination Directory
          </Label>
          <div className="flex">
            <Input
              id="destinationDir"
              className="flex-grow rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="/path/to/directory"
              {...register("destinationDir", { required: "Destination directory is required" })}
            />
            <Button
              type="button"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r-md hover:bg-gray-300 transition-colors"
              onClick={() => toast({
                title: "Directory Browser",
                description: "Directory browser is not available in this demo",
              })}
            >
              Browse
            </Button>
          </div>
          {errors.destinationDir && (
            <p className="mt-1 text-sm text-red-600">{errors.destinationDir.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            type="submit"
            className="flex-grow bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? "Starting Import..." : "Start Import"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
