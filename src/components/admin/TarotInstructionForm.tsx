'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Plus, X, Image, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  TarotCardInstruction,
  TarotCardInstructionFormData,
  TarotCardInstructionFormSchema
} from '@/types/tarot-instructions';
import { tarotInterpretationStyles } from '@/types/index';
import { tarotDeck } from '@/lib/tarot-data';
import { TarotInstructionsService } from '@/services/tarot-instructions-service';

interface TarotInstructionFormProps {
  instruction?: TarotCardInstruction | null;
  onClose: () => void;
  onSave: () => void;
}

export function TarotInstructionForm({ instruction, onClose, onSave }: TarotInstructionFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<TarotCardInstructionFormData>({
    resolver: zodResolver(TarotCardInstructionFormSchema),
    defaultValues: {
      cardId: '',
      interpretationMethod: 'traditional-rws',
      uprightInstruction: '',
      reversedInstruction: '',
      keywords: [],
      symbolism: {
        primary: [],
        secondary: []
      },
      numerology: '',
      astrology: '',
      element: '',
      chakra: '',
      archetype: '',
      shadow: '',
      advice: {
        general: '',
        love: '',
        career: '',
        spiritual: ''
      },
      questionPrompts: [],
      combinationNotes: {},
      customPromptAddition: '',
      isActive: true,
    },
  });

  // TODO: Fix TypeScript useFieldArray issues
  const keywordFields: any[] = [];
  const appendKeyword = (value: string) => {};
  const removeKeyword = (index: number) => {};
  
  const primarySymbolFields: any[] = [];
  const appendPrimarySymbol = (value: string) => {};
  const removePrimarySymbol = (index: number) => {};
  
  const secondarySymbolFields: any[] = [];
  const appendSecondarySymbol = (value: string) => {};
  const removeSecondarySymbol = (index: number) => {};
  
  const questionFields: any[] = [];
  const appendQuestion = (value: string) => {};
  const removeQuestion = (index: number) => {};

  const watchedCardId = form.watch('cardId');

  useEffect(() => {
    if (instruction) {
      form.reset({
        cardId: instruction.cardId,
        interpretationMethod: instruction.interpretationMethod,
        uprightInstruction: instruction.uprightInstruction,
        reversedInstruction: instruction.reversedInstruction,
        keywords: instruction.keywords || [],
        symbolism: instruction.symbolism || { primary: [], secondary: [] },
        numerology: instruction.numerology || '',
        astrology: instruction.astrology || '',
        element: instruction.element || '',
        chakra: instruction.chakra || '',
        archetype: instruction.archetype || '',
        shadow: instruction.shadow || '',
        advice: instruction.advice || { general: '', love: '', career: '', spiritual: '' },
        questionPrompts: instruction.questionPrompts || [],
        combinationNotes: instruction.combinationNotes || {},
        customPromptAddition: instruction.customPromptAddition || '',
        isActive: instruction.isActive,
      });
    }
  }, [instruction, form]);

  useEffect(() => {
    if (watchedCardId) {
      const card = tarotDeck.find(c => c.id === watchedCardId);
      setSelectedCard(card);
    }
  }, [watchedCardId]);

  const onSubmit = async (data: TarotCardInstructionFormData) => {
    try {
      setLoading(true);
      const result = await TarotInstructionsService.saveInstruction(
        data,
        'current-user', // TODO: Get from auth context
        instruction?.id
      );
      
      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Success' : 'Error',
        description: result.message
      });

      if (result.success) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving instruction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save instruction'
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {instruction ? 'Edit' : 'Add'} Tarot Card Instruction
          </DialogTitle>
          <DialogDescription>
            Create or edit interpretation instructions for a tarot card
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="cardId">Tarot Card</Label>
              <Select
                value={form.watch('cardId')}
                onValueChange={(value) => form.setValue('cardId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tarot card" />
                </SelectTrigger>
                <SelectContent>
                  {tarotDeck.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${getSuitBadgeColor(card.suit)} text-white text-xs`}
                        >
                          {card.suit}
                        </Badge>
                        {card.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.cardId && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.cardId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="interpretationMethod">Interpretation Method</Label>
              <Select
                value={form.watch('interpretationMethod')}
                onValueChange={(value) => form.setValue('interpretationMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interpretation method" />
                </SelectTrigger>
                <SelectContent>
                  {tarotInterpretationStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.interpretationMethod && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.interpretationMethod.message}
                </p>
              )}
            </div>
          </div>

          {selectedCard && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  {selectedCard.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Suit:</strong> {selectedCard.suit}
                  </div>
                  <div>
                    <strong>Number:</strong> {selectedCard.number || 'N/A'}
                  </div>
                  <div>
                    <strong>Element:</strong> {selectedCard.element || 'N/A'}
                  </div>
                  <div>
                    <strong>Astrology:</strong> {selectedCard.astrology || 'N/A'}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Keywords (Upright):</strong> {selectedCard.keywordsUpright.join(', ')}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Keywords (Reversed):</strong> {selectedCard.keywordsReversed.join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="symbolism">Symbolism</TabsTrigger>
              <TabsTrigger value="advice">Advice</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="uprightInstruction">Upright Instruction</Label>
                <Textarea
                  id="uprightInstruction"
                  {...form.register('uprightInstruction')}
                  placeholder="Instructions for upright card interpretation..."
                  className="min-h-[100px]"
                />
                {form.formState.errors.uprightInstruction && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.uprightInstruction.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="reversedInstruction">Reversed Instruction</Label>
                <Textarea
                  id="reversedInstruction"
                  {...form.register('reversedInstruction')}
                  placeholder="Instructions for reversed card interpretation..."
                  className="min-h-[100px]"
                />
                {form.formState.errors.reversedInstruction && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.reversedInstruction.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="space-y-2">
                  {keywordFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        {...form.register(`keywords.${index}` as const)}
                        placeholder="Enter keyword..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeKeyword(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendKeyword('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Keyword
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="symbolism" className="space-y-4">
              <div>
                <Label>Primary Symbolism</Label>
                <div className="space-y-2">
                  {primarySymbolFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        {...form.register(`symbolism.primary.${index}` as const)}
                        placeholder="Primary symbol..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePrimarySymbol(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPrimarySymbol('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Primary Symbol
                  </Button>
                </div>
              </div>

              <div>
                <Label>Secondary Symbolism</Label>
                <div className="space-y-2">
                  {secondarySymbolFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        {...form.register(`symbolism.secondary.${index}` as const)}
                        placeholder="Secondary symbol..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSecondarySymbol(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendSecondarySymbol('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Secondary Symbol
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numerology">Numerology</Label>
                  <Input
                    id="numerology"
                    {...form.register('numerology')}
                    placeholder="Numerological meaning..."
                  />
                </div>
                <div>
                  <Label htmlFor="astrology">Astrology</Label>
                  <Input
                    id="astrology"
                    {...form.register('astrology')}
                    placeholder="Astrological association..."
                  />
                </div>
                <div>
                  <Label htmlFor="element">Element</Label>
                  <Input
                    id="element"
                    {...form.register('element')}
                    placeholder="Elemental association..."
                  />
                </div>
                <div>
                  <Label htmlFor="chakra">Chakra</Label>
                  <Input
                    id="chakra"
                    {...form.register('chakra')}
                    placeholder="Chakra association..."
                  />
                </div>
                <div>
                  <Label htmlFor="archetype">Archetype</Label>
                  <Input
                    id="archetype"
                    {...form.register('archetype')}
                    placeholder="Jungian archetype..."
                  />
                </div>
                <div>
                  <Label htmlFor="shadow">Shadow</Label>
                  <Input
                    id="shadow"
                    {...form.register('shadow')}
                    placeholder="Shadow aspect..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advice" className="space-y-4">
              <div>
                <Label htmlFor="advice.general">General Advice</Label>
                <Textarea
                  id="advice.general"
                  {...form.register('advice.general')}
                  placeholder="General life advice..."
                />
              </div>
              <div>
                <Label htmlFor="advice.love">Love Advice</Label>
                <Textarea
                  id="advice.love"
                  {...form.register('advice.love')}
                  placeholder="Love and relationships advice..."
                />
              </div>
              <div>
                <Label htmlFor="advice.career">Career Advice</Label>
                <Textarea
                  id="advice.career"
                  {...form.register('advice.career')}
                  placeholder="Career and work advice..."
                />
              </div>
              <div>
                <Label htmlFor="advice.spiritual">Spiritual Advice</Label>
                <Textarea
                  id="advice.spiritual"
                  {...form.register('advice.spiritual')}
                  placeholder="Spiritual growth advice..."
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div>
                <Label>Question Prompts</Label>
                <div className="space-y-2">
                  {questionFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        {...form.register(`questionPrompts.${index}` as const)}
                        placeholder="Question to ask about this card..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendQuestion('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="customPromptAddition">Custom Prompt Addition</Label>
                <Textarea
                  id="customPromptAddition"
                  {...form.register('customPromptAddition')}
                  placeholder="Additional prompt text specific to this card..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch('isActive')}
                  onCheckedChange={(checked) => form.setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {instruction ? 'Update' : 'Create'} Instruction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}