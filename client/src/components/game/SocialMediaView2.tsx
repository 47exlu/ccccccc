import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRapperGame } from "@/lib/stores/useRapperGame";
import { SocialMediaHub } from "./SocialMediaHub";
import { BeefSystem } from "./BeefSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SocialMediaView2() {
  const setScreen = useRapperGame(state => state.setScreen);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setScreen("career_dashboard")}
          className="mr-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Social Media & PR</h1>
      </div>
      
      <Tabs defaultValue="social">
        <TabsList className="mb-4">
          <TabsTrigger value="social">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="beefs">
            Beefs & Rivalries
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="social">
          <SocialMediaHub />
        </TabsContent>
        
        <TabsContent value="beefs">
          <BeefSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}