'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Image } from 'lucide-react';
import { toast } from 'sonner';
import { 
  TarotCardInstruction,
  TarotCardInstructionFormData,
  TarotCardInstructionFormSchema,
  tarotInterpretationStyles
} from '@/types';
import { saveTarotCardInstruction } from '@/actions/tarotInstructionActions';

interface SimpleTarotInstructionFormProps {
  instruction?: TarotCardInstruction | null;
  onClose: () => void;
  onSave: () => void;
}

// Simple tarot deck data for form
const simpleTarotDeck = [
  { id: '0-fool', name: 'The Fool', suit: 'major' },
  { id: '1-magician', name: 'The Magician', suit: 'major' },
  { id: '2-high-priestess', name: 'The High Priestess', suit: 'major' },
  { id: '3-empress', name: 'The Empress', suit: 'major' },
  { id: '4-emperor', name: 'The Emperor', suit: 'major' },
  { id: '5-hierophant', name: 'The Hierophant', suit: 'major' },
  { id: '6-lovers', name: 'The Lovers', suit: 'major' },
  { id: '7-chariot', name: 'The Chariot', suit: 'major' },
  { id: '8-strength', name: 'Strength', suit: 'major' },
  { id: '9-hermit', name: 'The Hermit', suit: 'major' },
  { id: '10-wheel-of-fortune', name: 'Wheel of Fortune', suit: 'major' },
  { id: '11-justice', name: 'Justice', suit: 'major' },
  { id: '12-hanged-man', name: 'The Hanged Man', suit: 'major' },
  { id: '13-death', name: 'Death', suit: 'major' },
  { id: '14-temperance', name: 'Temperance', suit: 'major' },
  { id: '15-devil', name: 'The Devil', suit: 'major' },
  { id: '16-tower', name: 'The Tower', suit: 'major' },
  { id: '17-star', name: 'The Star', suit: 'major' },
  { id: '18-moon', name: 'The Moon', suit: 'major' },
  { id: '19-sun', name: 'The Sun', suit: 'major' },
  { id: '20-judgement', name: 'Judgement', suit: 'major' },
  { id: '21-world', name: 'The World', suit: 'major' },
  // Add some minor arcana examples
  { id: 'ace-wands', name: 'Ace of Wands', suit: 'wands' },
  { id: 'two-wands', name: 'Two of Wands', suit: 'wands' },
  { id: 'three-wands', name: 'Three of Wands', suit: 'wands' },
  { id: 'ace-cups', name: 'Ace of Cups', suit: 'cups' },
  { id: 'two-cups', name: 'Two of Cups', suit: 'cups' },
  { id: 'three-cups', name: 'Three of Cups', suit: 'cups' },
];

export function SimpleTarotInstructionForm({ instruction, onClose, onSave }: SimpleTarotInstructionFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const form = useForm<TarotCardInstructionFormData>({
    resolver: zodResolver(TarotCardInstructionFormSchema),
    defaultValues: {
      cardId: instruction?.cardId || '',
      interpretationMethod: instruction?.interpretationMethod || '전통 RWS (라이더-웨이트-스미스)',
      uprightInstruction: instruction?.uprightInstruction || '',
      reversedInstruction: instruction?.reversedInstruction || '',
      contextualHints: instruction?.contextualHints || '',
      combinationHints: instruction?.combinationHints || '',
    },
  });

  const watchedCardId = form.watch('cardId');

  useEffect(() => {
    if (watchedCardId) {
      const card = simpleTarotDeck.find(c => c.id === watchedCardId);
      setSelectedCard(card);
    }
  }, [watchedCardId]);

  const onSubmit = async (data: TarotCardInstructionFormData) => {
    try {
      setLoading(true);
      const result = await saveTarotCardInstruction(data, 'current-user', instruction?.id);
      
      if (result.success) {
        toast.success(result.message);
        onSave();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving instruction:', error);
      toast.error('지침 저장 중 오류가 발생했습니다.');
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {instruction ? '타로 카드 지침 편집' : '타로 카드 지침 추가'}
          </DialogTitle>
          <DialogDescription>
            타로 카드의 해석 지침을 생성하거나 편집합니다
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="cardId">타로 카드</Label>
              <Select
                value={form.watch('cardId')}
                onValueChange={(value) => form.setValue('cardId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="타로 카드를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {simpleTarotDeck.map((card) => (
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
              <Label htmlFor="interpretationMethod">해석 방법</Label>
              <Select
                value={form.watch('interpretationMethod')}
                onValueChange={(value) => form.setValue('interpretationMethod', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="해석 방법을 선택하세요" />
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
                <div className="text-sm">
                  <Badge 
                    variant="outline" 
                    className={`${getSuitBadgeColor(selectedCard.suit)} text-white`}
                  >
                    {selectedCard.suit}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="uprightInstruction">정방향 지침</Label>
              <Textarea
                id="uprightInstruction"
                {...form.register('uprightInstruction')}
                placeholder="정방향 카드 해석을 위한 지침을 입력하세요..."
                className="min-h-[120px]"
              />
              {form.formState.errors.uprightInstruction && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.uprightInstruction.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reversedInstruction">역방향 지침</Label>
              <Textarea
                id="reversedInstruction"
                {...form.register('reversedInstruction')}
                placeholder="역방향 카드 해석을 위한 지침을 입력하세요..."
                className="min-h-[120px]"
              />
              {form.formState.errors.reversedInstruction && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.reversedInstruction.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="contextualHints">상황별 힌트 (선택사항)</Label>
              <Textarea
                id="contextualHints"
                {...form.register('contextualHints')}
                placeholder="특정 상황에서 사용할 수 있는 힌트를 입력하세요..."
                className="min-h-[80px]"
              />
              {form.formState.errors.contextualHints && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.contextualHints.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="combinationHints">카드 조합 힌트 (선택사항)</Label>
              <Textarea
                id="combinationHints"
                {...form.register('combinationHints')}
                placeholder="다른 카드와 함께 나타날 때의 힌트를 입력하세요..."
                className="min-h-[80px]"
              />
              {form.formState.errors.combinationHints && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.combinationHints.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {instruction ? '업데이트' : '생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}