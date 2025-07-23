'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  Settings,
  BookOpen,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  TarotCardInstruction,
  TarotInstructionFilter,
  TarotInstructionBatchOperation 
} from '@/types/tarot-instructions';
import { TarotCard, tarotInterpretationStyles } from '@/types/index';
import { tarotDeck } from '@/lib/tarot-data';
import { TarotInstructionsService } from '@/services/tarot-instructions-service';
import { TarotInstructionForm } from './TarotInstructionForm';
import { TarotInstructionTemplateManager } from './TarotInstructionTemplateManager';

interface TarotInstructionsManagementProps {
  className?: string;
}

export function TarotInstructionsManagement({ className }: TarotInstructionsManagementProps) {
  const [instructions, setInstructions] = useState<TarotCardInstruction[]>([]);
  const [filteredInstructions, setFilteredInstructions] = useState<TarotCardInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TarotInstructionFilter>({});
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [showInstructionForm, setShowInstructionForm] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<TarotCardInstruction | null>(null);
  const [stats, setStats] = useState({
    totalInstructions: 0,
    activeInstructions: 0,
    instructionsByMethod: {} as Record<string, number>,
    instructionsByCard: {} as Record<string, number>,
    completionPercentage: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadInstructions();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [instructions, filter]);

  const loadInstructions = async () => {
    try {
      setLoading(true);
      const data = await TarotInstructionsService.getInstructions();
      setInstructions(data);
    } catch (error) {
      console.error('Error loading instructions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load tarot instructions'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await TarotInstructionsService.getInstructionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = instructions;

    if (filter.cardId) {
      filtered = filtered.filter(i => i.cardId === filter.cardId);
    }

    if (filter.interpretationMethod) {
      filtered = filtered.filter(i => i.interpretationMethod === filter.interpretationMethod);
    }

    if (filter.isActive !== undefined) {
      filtered = filtered.filter(i => i.isActive === filter.isActive);
    }

    if (filter.suit) {
      const cardIds = tarotDeck.filter(card => card.suit === filter.suit).map(card => card.id);
      filtered = filtered.filter(i => cardIds.includes(i.cardId));
    }

    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase();
      filtered = filtered.filter(i => 
        i.uprightInstruction.toLowerCase().includes(searchText) ||
        i.reversedInstruction.toLowerCase().includes(searchText) ||
        i.keywords.some(keyword => keyword.toLowerCase().includes(searchText))
      );
    }

    setFilteredInstructions(filtered);
  };

  const handleDeleteInstruction = async (instructionId: string) => {
    if (!confirm('Are you sure you want to delete this instruction?')) return;

    try {
      const result = await TarotInstructionsService.deleteInstruction(instructionId);
      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Success' : 'Error',
        description: result.message
      });
      if (result.success) {
        await loadInstructions();
        await loadStats();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete instruction'
      });
    }
  };

  const handleBatchOperation = async (operation: TarotInstructionBatchOperation['operation']) => {
    if (selectedInstructions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one instruction'
      });
      return;
    }

    try {
      const result = await TarotInstructionsService.batchOperation(
        { 
          operation, 
          instructionIds: selectedInstructions,
          newInterpretationMethod: operation === 'update-method' ? 'traditional-rws' : undefined
        },
        'current-user' // TODO: Get from auth context
      );
      
      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Success' : 'Error',
        description: result.message
      });

      if (result.success) {
        setSelectedInstructions([]);
        await loadInstructions();
        await loadStats();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to perform batch operation'
      });
    }
  };

  const getCardById = (cardId: string): TarotCard | undefined => {
    return tarotDeck.find(card => card.id === cardId);
  };

  const handleInstructionSaved = () => {
    setShowInstructionForm(false);
    setEditingInstruction(null);
    loadInstructions();
    loadStats();
  };

  const getSuitBadgeColor = (suit: string) => {
    switch (suit) {
      case 'major': return 'bg-purple-500';
      case 'wands': return 'bg-red-500';
      case 'cups': return 'bg-blue-500';
      case 'swords': return 'bg-gray-500';
      case 'pentacles': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tarot Card Instructions</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplateManager(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                onClick={() => {
                  setEditingInstruction(null);
                  setShowInstructionForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Instruction
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search instructions..."
                    value={filter.searchText || ''}
                    onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
                    className="pl-10"
                  />
                </div>
                
                <Select
                  value={filter.interpretationMethod || 'all'}
                  onValueChange={(value) => 
                    setFilter({ 
                      ...filter, 
                      interpretationMethod: value === 'all' ? undefined : value 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {tarotInterpretationStyles.map(style => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.suit || 'all'}
                  onValueChange={(value) => 
                    setFilter({ 
                      ...filter, 
                      suit: value === 'all' ? undefined : value as any 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Suit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suits</SelectItem>
                    <SelectItem value="major">Major Arcana</SelectItem>
                    <SelectItem value="wands">Wands</SelectItem>
                    <SelectItem value="cups">Cups</SelectItem>
                    <SelectItem value="swords">Swords</SelectItem>
                    <SelectItem value="pentacles">Pentacles</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filter.isActive === undefined ? 'all' : filter.isActive.toString()}
                  onValueChange={(value) => 
                    setFilter({ 
                      ...filter, 
                      isActive: value === 'all' ? undefined : value === 'true' 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setFilter({})}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Batch Operations */}
          {selectedInstructions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedInstructions.length} instruction(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBatchOperation('activate')}
                    >
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBatchOperation('deactivate')}
                    >
                      Deactivate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBatchOperation('delete')}
                      className="text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions List */}
          <div className="grid gap-4">
            {filteredInstructions.map((instruction) => {
              const card = getCardById(instruction.cardId);
              return (
                <Card key={instruction.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedInstructions.includes(instruction.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedInstructions([...selectedInstructions, instruction.id]);
                            } else {
                              setSelectedInstructions(selectedInstructions.filter(id => id !== instruction.id));
                            }
                          }}
                        />
                        <div>
                          <CardTitle className="text-lg">
                            {card?.name || instruction.cardId}
                          </CardTitle>
                          <CardDescription>
                            {instruction.interpretationMethod}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${getSuitBadgeColor(card?.suit || 'major')} text-white`}
                        >
                          {card?.suit || 'Unknown'}
                        </Badge>
                        <Badge variant={instruction.isActive ? 'default' : 'secondary'}>
                          {instruction.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingInstruction(instruction);
                            setShowInstructionForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteInstruction(instruction.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Upright Instruction:</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {instruction.uprightInstruction}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Reversed Instruction:</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {instruction.reversedInstruction}
                        </p>
                      </div>
                      {instruction.keywords.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Keywords:</h4>
                          <div className="flex flex-wrap gap-1">
                            {instruction.keywords.slice(0, 5).map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {instruction.keywords.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{instruction.keywords.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredInstructions.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Instructions Found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {Object.keys(filter).length > 0 
                      ? 'No instructions match your current filters'
                      : 'Create your first tarot card instruction'
                    }
                  </p>
                  <Button onClick={() => setShowInstructionForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Instruction
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <TarotInstructionTemplateManager 
            onImportComplete={() => {
              loadInstructions();
              loadStats();
            }}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInstructions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeInstructions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionPercentage.toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(stats.instructionsByMethod).length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Instructions by Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.instructionsByMethod).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm">{method}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Cards by Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.instructionsByCard)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([cardId, count]) => {
                      const card = getCardById(cardId);
                      return (
                        <div key={cardId} className="flex items-center justify-between">
                          <span className="text-sm">{card?.name || cardId}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showInstructionForm && (
        <TarotInstructionForm
          instruction={editingInstruction}
          onClose={() => {
            setShowInstructionForm(false);
            setEditingInstruction(null);
          }}
          onSave={handleInstructionSaved}
        />
      )}

      {showTemplateManager && (
        <TarotInstructionTemplateManager
          onClose={() => setShowTemplateManager(false)}
          onImportComplete={() => {
            loadInstructions();
            loadStats();
          }}
        />
      )}
    </div>
  );
}