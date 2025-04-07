import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useSaveGame } from '@/lib/stores/useSaveGame';
import { useAudio } from '@/lib/stores/useAudio';
import { CalendarIcon, SaveIcon } from '@/assets/icons';

export function SaveLoadGame() {
  const { character, currentWeek, saveGame, loadGame, resetGame, setScreen } = useRapperGame();
  const { saves, loadSaves, deleteSave } = useSaveGame();
  const { playSuccess, playHit } = useAudio();
  
  const [saveName, setSaveName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [saveToDelete, setSaveToDelete] = useState<string | null>(null);
  
  // Load saved games when component mounts
  useEffect(() => {
    loadSaves();
  }, [loadSaves]);
  
  // Set default save name based on character and week
  useEffect(() => {
    if (character) {
      setSaveName(`${character.artistName} - Week ${currentWeek}`);
    } else {
      setSaveName(`New Career - Week ${currentWeek}`);
    }
  }, [character, currentWeek]);
  
  // Handle saving the game
  const handleSaveGame = () => {
    const name = saveName.trim() || `Career - Week ${currentWeek}`;
    saveGame(null, name);
    playSuccess();
    loadSaves(); // Reload the saves list
  };
  
  // Handle loading a game
  const handleLoadGame = (saveId: string) => {
    const save = saves.find(s => s.id === saveId);
    if (save) {
      loadGame(save.gameState);
      playSuccess();
      setScreen('career_dashboard');
    }
  };
  
  // Handle deleting a save
  const handleDeleteSave = () => {
    if (saveToDelete) {
      deleteSave(saveToDelete);
      playHit();
      setIsDeleteDialogOpen(false);
      setSaveToDelete(null);
    }
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (saveId: string) => {
    setSaveToDelete(saveId);
    setIsDeleteDialogOpen(true);
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Back to game button handler
  const handleBack = () => {
    if (character) {
      setScreen('career_dashboard');
    } else {
      setScreen('main_menu');
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <SaveIcon size={32} className="mr-3 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold">Save & Load Game</h1>
            <p className="text-sm text-gray-400">Manage your game saves</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="bg-transparent border-gray-600 hover:bg-gray-800"
          onClick={handleBack}
        >
          Back to Game
        </Button>
      </div>
      
      {/* Save Game Card */}
      {character && (
        <Card className="mb-6 bg-gradient-to-r from-amber-900/30 to-amber-900/10 border-amber-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <SaveIcon size={18} className="mr-2 text-amber-400" />
              Save Current Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="saveName">Save Name</Label>
              <Input 
                id="saveName"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter save name"
                className="bg-black/30 border-gray-700"
              />
              <div className="text-xs text-gray-400 mt-1">
                Current progress: {character.artistName}, Week {currentWeek}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
              onClick={handleSaveGame}
            >
              Save Game
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Load Game Card */}
      <Card className="bg-black/30 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CalendarIcon size={18} className="mr-2 text-blue-400" />
            Load Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          {saves.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              You don't have any saved games yet.
            </div>
          ) : (
            <div className="space-y-3">
              {saves.map(save => (
                <div 
                  key={save.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded bg-gray-900/60 border border-gray-800 hover:bg-gray-900/80 transition-colors"
                >
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium text-amber-400">{save.name}</h3>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(save.date)}
                    </div>
                    {save.gameState.character && (
                      <div className="text-sm mt-1">
                        <span className="text-gray-300">{save.gameState.character.artistName}</span>
                        <span className="text-gray-500"> • Week {save.gameState.currentWeek}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="bg-transparent border-gray-700 hover:bg-gray-800"
                      onClick={() => openDeleteDialog(save.id)}
                    >
                      Delete
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleLoadGame(save.id)}
                    >
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* New Game Button (only show if a character exists) */}
      {character && (
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            className="bg-transparent border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300"
            onClick={() => {
              if (window.confirm('Are you sure you want to start a new game? Your current progress will be lost unless saved.')) {
                resetGame();
                setScreen('main_menu');
              }
            }}
          >
            Start New Game
          </Button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">
            Are you sure you want to delete this save?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="bg-transparent border-gray-600 hover:bg-gray-800"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteSave}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
