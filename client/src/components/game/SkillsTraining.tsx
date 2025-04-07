import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progressbar';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Users, Star, Brain, BookOpen, Mic } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { toast } from 'sonner';

// Define interface for the skill
interface Skill {
  name: string;
  displayName: string;
  level: number;
  maxLevel: number;
  description: string;
  trainingCost: number;
}

// Extend the RapperGameStore interface
interface ExtendedRapperGameStore {
  skills?: Skill[];
  stats: {
    careerLevel: number;
    reputation: number;
    wealth: number;
    creativity: number;
    marketing: number;
    networking: number;
    fanLoyalty: number;
  };
  wealth: number;
  trainSkill: (skillName: string) => void;
  setScreen: (screen: string) => void;
}

export function SkillsTraining() {
  const { skills, stats, wealth, trainSkill, setScreen } = useRapperGame() as unknown as ExtendedRapperGameStore;
  const [selectedSkill, setSelectedSkill] = useState(skills?.[0]?.name || '');

  const handleTraining = () => {
    const skill = skills.find(s => s.name === selectedSkill);
    if (!skill) return;
    
    if (wealth < skill.trainingCost) {
      toast.error("You don't have enough money for this training.");
      return;
    }
    
    if (skill.level >= skill.maxLevel) {
      toast.error("This skill is already at maximum level.");
      return;
    }
    
    trainSkill(selectedSkill);
    toast.success(`${skill.displayName} skill improved to level ${skill.level + 1}!`);
  };

  // Get skill icon based on name
  const getSkillIcon = (skillName: string) => {
    switch (skillName) {
      case 'lyricalAbility':
        return <Mic className="h-6 w-6 text-purple-400" />;
      case 'production':
        return <Star className="h-6 w-6 text-amber-400" />;
      case 'businessAcumen':
        return <TrendingUp className="h-6 w-6 text-green-400" />;
      case 'stageCraft':
        return <BookOpen className="h-6 w-6 text-blue-400" />;
      case 'networking':
        return <Users className="h-6 w-6 text-pink-400" />;
      case 'creativity':
        return <Brain className="h-6 w-6 text-rose-400" />;
      default:
        return <Star className="h-6 w-6 text-gray-400" />;
    }
  };

  // Get related stat based on skill
  const getRelatedStat = (skillName: string) => {
    switch (skillName) {
      case 'lyricalAbility':
      case 'production':
      case 'creativity':
        return stats.creativity;
      case 'businessAcumen':
      case 'marketing':
        return stats.marketing;
      case 'stageCraft':
        return stats.fanLoyalty;
      case 'networking':
        return stats.networking;
      default:
        return 0;
    }
  };

  // Get benefit text based on skill
  const getSkillBenefit = (skillName: string) => {
    switch (skillName) {
      case 'lyricalAbility':
        return "Increases song quality and fan response";
      case 'production':
        return "Improves production quality and song performance";
      case 'businessAcumen':
        return "Increases revenue from streams and shows";
      case 'stageCraft':
        return "Better live performances and fan loyalty";
      case 'networking':
        return "More collaboration opportunities and industry connections";
      case 'creativity':
        return "Enhanced song innovation and viral potential";
      case 'marketing':
        return "Better promotion results and social media reach";
      default:
        return "Improves your overall performance";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900 to-blue-950 text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="mr-2 text-blue-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold">Skills Training</h1>
            <p className="text-sm text-gray-300">Improve your abilities to become a better artist</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="bg-transparent border-gray-600 hover:bg-gray-800"
          onClick={() => setScreen('career_dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Panel - Skills List */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-black/20 border-indigo-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-300">Available Skills</CardTitle>
              <CardDescription className="text-gray-400">Select a skill to train</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div 
                    key={skill.name}
                    className={`p-3 rounded-md cursor-pointer transition-colors flex items-center ${
                      selectedSkill === skill.name 
                        ? 'bg-indigo-900/70 border border-indigo-700' 
                        : 'bg-black/30 border border-transparent hover:bg-black/40'
                    }`}
                    onClick={() => setSelectedSkill(skill.name)}
                  >
                    {getSkillIcon(skill.name)}
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{skill.displayName}</h3>
                        <span className="text-xs bg-blue-900/60 px-2 py-0.5 rounded">
                          Lv. {skill.level}/{skill.maxLevel}
                        </span>
                      </div>
                      <ProgressBar
                        value={skill.level}
                        max={skill.maxLevel}
                        className="mt-1"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-indigo-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-300">Current Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatMoney(wealth)}</div>
              <p className="text-sm text-gray-400 mt-1">Available for training</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel - Training Details */}
        <div className="md:col-span-3">
          {selectedSkill && (
            <Card className="bg-black/20 border-indigo-800 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center">
                  {getSkillIcon(selectedSkill)}
                  <CardTitle className="ml-2 text-xl text-blue-300">
                    {skills.find(s => s.name === selectedSkill)?.displayName} Training
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-400 mt-1">
                  {skills.find(s => s.name === selectedSkill)?.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">CURRENT LEVEL</h3>
                    <div className="flex items-center">
                      <div className="text-4xl font-bold mr-3">
                        {skills.find(s => s.name === selectedSkill)?.level || 0}
                      </div>
                      <ProgressBar
                        value={skills.find(s => s.name === selectedSkill)?.level || 0}
                        max={skills.find(s => s.name === selectedSkill)?.maxLevel || 10}
                        className="flex-1"
                        size="md"
                      />
                      <div className="ml-3 text-lg font-medium">
                        {skills.find(s => s.name === selectedSkill)?.maxLevel || 10}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-indigo-900/50">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <Star className="h-4 w-4 mr-1 text-amber-400" />
                      BENEFITS
                    </h3>
                    <p className="text-gray-300">
                      {getSkillBenefit(selectedSkill)}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-indigo-900/50">
                      <h4 className="text-xs text-gray-400 mb-2">RELATED STAT</h4>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <ProgressBar
                            value={getRelatedStat(selectedSkill)}
                            max={100}
                            size="sm"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          {getRelatedStat(selectedSkill)}/100
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">TRAINING COST</h3>
                    <div className="text-2xl font-bold text-white">
                      {formatMoney(skills.find(s => s.name === selectedSkill)?.trainingCost || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-indigo-900/50 pt-4">
                <Button 
                  className="w-full bg-indigo-700 hover:bg-indigo-600 text-white"
                  onClick={handleTraining}
                  disabled={
                    (skills.find(s => s.name === selectedSkill)?.level || 0) >= 
                    (skills.find(s => s.name === selectedSkill)?.maxLevel || 10) ||
                    wealth < (skills.find(s => s.name === selectedSkill)?.trainingCost || 0)
                  }
                >
                  {(skills.find(s => s.name === selectedSkill)?.level || 0) >= 
                   (skills.find(s => s.name === selectedSkill)?.maxLevel || 10) ? 
                   'Mastered' : 'Train Skill'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}