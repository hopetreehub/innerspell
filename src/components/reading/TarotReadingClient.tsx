
// src/components/reading/TarotReadingClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


import type {
  TarotCard as TarotCardType,
  TarotInterpretationMethod,
  SpreadConfiguration,
  InterpretationStyleInfo,
  SavedReadingCard,
} from '@/types';
import { tarotInterpretationStyles, tarotSpreads } from '@/types';
import { tarotDeck as allTarotCards } from '@/lib/tarot-data';

// back.png를 제외한 실제 타로 카드만 필터링
const allCards = allTarotCards.filter(card => 
  !card.id.includes('back') && 
  !card.imageSrc?.includes('back.png') &&
  !card.name?.toLowerCase().includes('back')
);
import { generateTarotInterpretation } from '@/ai/flows/generate-tarot-interpretation';
import { recordTarotUsage } from '@/actions/usageStatsActions';
import { useAuth } from '@/context/AuthContext';

// 🔧 클라이언트 스프레드 ID를 타로 지침 시스템 ID로 매핑
const spreadIdMapping: Record<string, string> = {
  'single-spark': 'single-card',
  'trinity-view': 'trinity-view', // 수정: 매핑 제거하여 원래 ID 사용
  'pentagram-insight': 'situation-action-outcome',
  'seven-stars-path': 'relationship-spread',
  'nine-realms-journey': 'cross-spread',
  'celtic-cross-wisdom': 'celtic-cross'
};

// 🔧 클라이언트 해석 스타일을 타로 지침 시스템 ID로 매핑
const styleIdMapping: Record<string, string> = {
  '전통 RWS (라이더-웨이트-스미스)': 'traditional-rws',
  '토트 기반 심층 분석': 'thoth-crowley',
  '심리학적 원형 탐구': 'psychological-jungian',
  '영적 성장과 자기 성찰': 'spiritual-growth-reflection', // 수정: 올바른 ID로 변경
  '실질적 행동 지침': 'therapeutic-counseling',
  '내면의 그림자 작업': 'elemental-seasonal'
};
import { saveUserReading } from '@/actions/readingActions';
import { shareReadingClient } from '@/lib/firebase/client-share';
import { ShareGuideDialog } from './ShareGuideDialog';


import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Loader2,
  Shuffle,
  Layers,
  BookOpenText,
  Save,
  Share2,
} from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion, useAnimation, LayoutGroup } from 'framer-motion';

type ReadingStage =
  | 'setup'
  | 'deck_ready'
  | 'shuffling'
  | 'shuffled'
  | 'spread_revealed'
  | 'cards_selected'
  | 'interpreting'
  | 'interpretation_ready';

import { TAROT_IMAGE_CONFIG, getTarotImagePath } from '@/config/tarot-images';

const CARD_BACK_IMAGE = TAROT_IMAGE_CONFIG.features.reading.cardBack;
const NUM_VISUAL_CARDS_IN_STACK = 20;
const N_ANIMATING_CARDS_FOR_SHUFFLE = 20;

const TARGET_CARD_HEIGHT_CLASS = "h-56";
const IMAGE_ORIGINAL_WIDTH = 512;
const IMAGE_ORIGINAL_HEIGHT = 819;
const CARD_IMAGE_SIZES = "110px";

const SignUpPrompt = () => (
  <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center animate-fade-in">
    <h4 className="font-headline text-lg text-primary">더 깊이 있는 해석을 원시나요?</h4>
    <p className="text-sm text-foreground/80 mt-1 mb-3">무료로 회원가입하고 전체 해석과 조언, 그리고 리딩 기록 저장 기능까지 모두 이용해보세요!</p>
    <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button asChild className="w-full sm:w-auto">
            <Link href="/sign-up?redirect=/reading">무료 회원가입</Link>
        </Button>
        <Button variant="ghost" asChild className="w-full sm:w-auto">
            <Link href="/sign-in?redirect=/reading">로그인</Link>
        </Button>
    </div>
  </div>
);


export function TarotReadingClient() {
  const { user } = useAuth();
  const [question, setQuestion] = useState<string>('');
  const [selectedSpread, setSelectedSpread] = useState<SpreadConfiguration>(
    tarotSpreads[1], // Default to Trinity View (3 cards)
  );
  const [interpretationMethod, setInterpretationMethod] =
    useState<TarotInterpretationMethod>(tarotInterpretationStyles[0].id);

  const [deck, setDeck] = useState<TarotCardType[]>([]);
  const [revealedSpreadCards, setRevealedSpreadCards] = useState<TarotCardType[]>([]);
  const [selectedCardsForReading, setSelectedCardsForReading] = useState<
    TarotCardType[]
  >([]);

  const [interpretation, setInterpretation] = useState<string>('');
  const [displayedInterpretation, setDisplayedInterpretation] =
    useState<string>('');
  const [stage, setStage] = useState<ReadingStage>('setup');
  const [isInterpretationDialogOpen, setIsInterpretationDialogOpen] = useState(false);
  const [isSavingReading, setIsSavingReading] = useState(false);
  const [readingJustSaved, setReadingJustSaved] = useState(false);
  const [isSharingReading, setIsSharingReading] = useState(false);
  const [shareGuideOpen, setShareGuideOpen] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');


  const { toast } = useToast();
  const spreadContainerRef = useRef<HTMLDivElement>(null);

  // Create animation controls for each card in the visual stack
  const visualCardAnimControls = [
    useAnimation(), useAnimation(), useAnimation(), useAnimation(), useAnimation(),
    useAnimation(), useAnimation(), useAnimation(), useAnimation(), useAnimation(),
    useAnimation(), useAnimation(), useAnimation(), useAnimation(), useAnimation(),
    useAnimation(), useAnimation(), useAnimation(), useAnimation(), useAnimation(),
  ];
  const [isShufflingAnimationActive, setIsShufflingAnimationActive] =
    useState(false);

  useEffect(() => {
    setDeck([...allCards].sort(() => 0.5 - Math.random()));
    setStage('deck_ready');
    setReadingJustSaved(false);
    visualCardAnimControls.forEach((controls, i) => {
      controls.start(
        {
          x: 0,
          y: 0,
          zIndex: NUM_VISUAL_CARDS_IN_STACK - i,
          rotate: 0,
          opacity: 1,
        },
        { duration: 0 },
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetReadingState = () => {
    setStage('deck_ready');
    setRevealedSpreadCards([]);
    setSelectedCardsForReading([]);
    setInterpretation('');
    setDisplayedInterpretation('');
    setIsInterpretationDialogOpen(false);
    setReadingJustSaved(false);
    setIsSharingReading(false);
    visualCardAnimControls.forEach((controls, i) => {
      controls.start({ x: 0, y: 0, zIndex: NUM_VISUAL_CARDS_IN_STACK - i, rotate: 0, opacity: 1 }, { duration: 0 });
    });
  }

  const handleShuffle = async () => {
    if (isShufflingAnimationActive) return;

    setIsShufflingAnimationActive(true);
    setStage('shuffling');
    setReadingJustSaved(false);
    setIsSharingReading(false);
    setRevealedSpreadCards([]);
    setSelectedCardsForReading([]);
    setInterpretation('');
    setDisplayedInterpretation('');
    setIsInterpretationDialogOpen(false);

    const SHUFFLE_REPETITIONS = 2; // Two shuffles: one left-first, one right-first
    const pileSpacing = 120;
    const cardOffsetY = 2;
    const shufflePileCardRotation = -8;

    const animatingControls = visualCardAnimControls.slice(0, N_ANIMATING_CARDS_FOR_SHUFFLE);

    for (let k = 0; k < SHUFFLE_REPETITIONS; k++) {
      // First shuffle is left-first, second is right-first
      const leftFirst = k === 0;
      
      const leftPileAnimatingIndices: number[] = [];
      const rightPileAnimatingIndices: number[] = [];

      for (let i = 0; i < N_ANIMATING_CARDS_FOR_SHUFFLE; i++) {
        if (i % 2 === 0) leftPileAnimatingIndices.push(i);
        else rightPileAnimatingIndices.push(i);
      }

      const splitPromises: Promise<any>[] = [];
      leftPileAnimatingIndices.forEach((controlIndex, pileOrder) => {
        splitPromises.push(
          animatingControls[controlIndex].start({
            x: -pileSpacing,
            y: pileOrder * cardOffsetY,
            rotate: shufflePileCardRotation,
            zIndex: NUM_VISUAL_CARDS_IN_STACK + pileOrder,
            transition: { duration: 0.2, ease: 'easeOut', delay: pileOrder * 0.03 },
          }),
        );
      });
      rightPileAnimatingIndices.forEach((controlIndex, pileOrder) => {
        splitPromises.push(
          animatingControls[controlIndex].start({
            x: pileSpacing,
            y: pileOrder * cardOffsetY,
            rotate: -shufflePileCardRotation,
            zIndex: NUM_VISUAL_CARDS_IN_STACK + pileOrder,
            transition: { duration: 0.2, ease: 'easeOut', delay: pileOrder * 0.03 + 0.015 },
          }),
        );
      });
      await Promise.all(splitPromises);
      await new Promise((r) => setTimeout(r, 100)); // a brief pause between splitting and merging

      const interleaveOrderDefinition: number[] = [];
      const maxPileLength = Math.max(leftPileAnimatingIndices.length, rightPileAnimatingIndices.length);
      for (let i = 0; i < maxPileLength; i++) {
        if (leftFirst) {
            if (leftPileAnimatingIndices[i] !== undefined) interleaveOrderDefinition.push(leftPileAnimatingIndices[i]);
            if (rightPileAnimatingIndices[i] !== undefined) interleaveOrderDefinition.push(rightPileAnimatingIndices[i]);
        } else {
            if (rightPileAnimatingIndices[i] !== undefined) interleaveOrderDefinition.push(rightPileAnimatingIndices[i]);
            if (leftPileAnimatingIndices[i] !== undefined) interleaveOrderDefinition.push(leftPileAnimatingIndices[i]);
        }
      }

      for (let i = 0; i < interleaveOrderDefinition.length; i++) {
        const controlIndex = interleaveOrderDefinition[i];
        await animatingControls[controlIndex].start({
          x: 0 + i * 0.2,
          y: 0 + i * -0.2,
          rotate: 0,
          zIndex: NUM_VISUAL_CARDS_IN_STACK * 2 + i,
          transition: { duration: 0.08, ease: 'easeIn' },
        });
      }
      
      if (k < SHUFFLE_REPETITIONS - 1) {
          // A brief pause before the next shuffle repetition
          await new Promise((r) => setTimeout(r, 150));
      }
    }
    
    // Only set the deck after all shuffle animations are done
    setDeck([...allCards].sort(() => 0.5 - Math.random()));
    setStage('shuffled');

    // Final reset of all visual cards to a neat stack
    visualCardAnimControls.forEach((controls, i) => {
      controls.start({
        x: i * 0.2,
        y: i * -0.2,
        zIndex: NUM_VISUAL_CARDS_IN_STACK - i,
        rotate: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      });
    });

    setIsShufflingAnimationActive(false);

    toast({
      title: '덱 섞기 완료',
      description: '카드가 섞였습니다. 이제 카드를 펼쳐보세요.',
    });
  };

  const handleRevealSpread = () => {
    if (deck.length === 0) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '덱에 카드가 없습니다. 다시 섞어주세요.',
      });
      return;
    }

    const drawnPool = deck.map((card) => ({
      ...card,
      isFaceUp: false,
      isReversed: Math.random() > 0.5
    }));

    setRevealedSpreadCards(drawnPool);
    setSelectedCardsForReading([]);
    setInterpretation('');
    setDisplayedInterpretation('');
    setIsInterpretationDialogOpen(false);
    setReadingJustSaved(false);
    setStage('spread_revealed');
  };

  const handleCardSelectFromSpread = (clickedSpreadCard: TarotCardType) => {
     const cardAlreadySelected = selectedCardsForReading.find(
      (c) => c.id === clickedSpreadCard.id && c.isReversed === clickedSpreadCard.isReversed
    );

    let newSelectedCards: TarotCardType[];

    if (cardAlreadySelected) {
      newSelectedCards = selectedCardsForReading.filter(
        (c) => !(c.id === clickedSpreadCard.id && c.isReversed === clickedSpreadCard.isReversed)
      );
    } else {
      if (selectedCardsForReading.length >= selectedSpread.numCards) {
        toast({
          description: `최대 ${selectedSpread.numCards}장까지 선택할 수 있습니다.`,
        });
        return;
      }
      const originalCardData = allCards.find(c => c.id === clickedSpreadCard.id);
      if (!originalCardData) {
        toast({ variant: 'destructive', title: '오류', description: '선택한 카드를 찾을 수 없습니다.'});
        return;
      }
      const cardToAdd = {
        ...originalCardData,
        isReversed: clickedSpreadCard.isReversed,
        isFaceUp: true,
      };
      newSelectedCards = [...selectedCardsForReading, cardToAdd];
    }

    setSelectedCardsForReading(newSelectedCards);

    setStage(
      newSelectedCards.length === selectedSpread.numCards
        ? 'cards_selected'
        : 'spread_revealed',
    );
  };


  const handleGetInterpretation = async () => {
    if (!question.trim()) {
      toast({
        variant: 'destructive',
        title: '질문 필요',
        description: '해석을 받기 전에 질문을 입력해주세요.',
      });
      return;
    }
    if (selectedCardsForReading.length !== selectedSpread.numCards) {
      toast({
        variant: 'destructive',
        title: '카드 부족',
        description: `스프레드에 필요한 ${selectedSpread.numCards}장의 카드를 모두 선택해주세요.`,
      });
      return;
    }

    setStage('interpreting');
    setDisplayedInterpretation('');
    setIsInterpretationDialogOpen(true);
    setReadingJustSaved(false);


    const cardInterpretationsText = selectedCardsForReading
      .map((card, index) => {
        const orientation = card.isReversed ? '역방향' : '정방향';
        let meaning = card.isReversed
          ? card.meaningReversed
          : card.meaningUpright;
        
        // [의미] 플레이스홀더를 실제 기본 해석으로 대체
        if (meaning.includes('[의미]')) {
          if (card.isReversed) {
            meaning = `${card.name}의 역방향은 일반적으로 정방향 의미의 차단, 과잉, 또는 반대를 나타냅니다. 이 카드는 도전과 성장의 기회를 제시합니다.`;
          } else {
            meaning = `${card.name}는 ${card.suit ? card.suit + ' 수트의 ' : ''}에너지와 특성을 나타냅니다. 이 카드는 현재 상황에서 중요한 메시지를 전달하고 있습니다.`;
          }
        }
        
        const positionName = selectedSpread.positions?.[index] ? ` (${selectedSpread.positions[index]})` : '';
        return `${index + 1}. ${card.name}${positionName} (${orientation}): ${meaning.substring(0,100)}...`;
      })
      .join('\n');

    try {
      // 🔧 지침 시스템 ID 매핑
      const mappedSpreadId = spreadIdMapping[selectedSpread.id] || selectedSpread.id;
      const mappedStyleId = styleIdMapping[interpretationMethod] || interpretationMethod;
      
      console.log('[TAROT] Using guideline IDs:', {
        clientSpreadId: selectedSpread.id,
        mappedSpreadId,
        clientStyleId: interpretationMethod,
        mappedStyleId
      });

      const result = await generateTarotInterpretation({
        question: `${question} (해석 스타일: ${interpretationMethod})`,
        cardSpread: selectedSpread.name,
        cardInterpretations: cardInterpretationsText,
        isGuestUser: !user,
        spreadId: mappedSpreadId,
        styleId: mappedStyleId,
      });
      
      // Check if result is valid
      if (!result || typeof result.interpretation !== 'string') {
        console.error('[TAROT] Invalid result from generateTarotInterpretation:', result);
        throw new Error('AI 해석 응답이 올바르지 않습니다.');
      }
      
      setInterpretation(result.interpretation);
      setStage('interpretation_ready');
      
      // 사용 기록 저장 (로그인한 사용자만)
      if (user && result.interpretation) {
        try {
          await recordTarotUsage(user.uid, {
            question: question,
            spread: selectedSpread.name,
            interpretation: result.interpretation.substring(0, 200) // 첫 200자만 저장
          });
          console.log('[TAROT] Usage recorded for user:', user.uid);
        } catch (error) {
          console.warn('[TAROT] Failed to record usage:', error);
        }
      }
    } catch (error) {
      console.error('해석 생성 오류:', error);
      // Show actual error message for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        variant: 'destructive',
        title: 'AI 해석 오류',
        description: errorMessage,
      });
      setStage('cards_selected');
    }
  };

  useEffect(() => {
    if (interpretation && stage === 'interpretation_ready' && isInterpretationDialogOpen) {
      let index = 0;
      setDisplayedInterpretation('');
      const intervalId = setInterval(() => {
        if (index < interpretation.length) {
          setDisplayedInterpretation((prev) => prev + interpretation[index]);
          index++;
        } else {
          clearInterval(intervalId);
        }
      }, 25);
      return () => clearInterval(intervalId);
    }
  }, [interpretation, stage, isInterpretationDialogOpen]);


  const handleSaveReading = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: '로그인 필요', description: '리딩을 저장하려면 먼저 로그인해주세요.' });
      return;
    }
    if (!interpretation || selectedCardsForReading.length === 0 || !question.trim()) {
      toast({ variant: 'destructive', title: '저장 오류', description: '저장할 해석 내용, 선택된 카드, 또는 질문이 없습니다.' });
      return;
    }

    // ✅ Real Firebase enabled - no need to check for mock mode anymore

    setIsSavingReading(true);
    
    try {
      const drawnCardsToSave = selectedCardsForReading.map((card, index) => ({
        id: card.id,
        isReversed: !!card.isReversed,
        position: selectedSpread.positions?.[index] || `카드 ${index + 1}`,
      }));

      console.log('📤 저장 요청 데이터:', {
        userId: user.uid,
        question: question.substring(0, 50) + '...',
        spreadName: selectedSpread.name,
        spreadNumCards: selectedSpread.numCards,
        drawnCardsCount: drawnCardsToSave.length,
        interpretationLength: interpretation.length
      });

      // 🔧 개선: 서버 액션 사용으로 보안 강화
      const result = await saveUserReading({
        userId: user.uid,
        question: question,
        spreadName: selectedSpread.name,
        spreadNumCards: selectedSpread.numCards,
        drawnCards: drawnCardsToSave,
        interpretationText: interpretation,
      });

      if (!result) {
        throw new Error('저장 함수가 결과를 반환하지 않았습니다.');
      }

      if (result.success) {
        toast({ 
          title: '저장 완료', 
          description: `리딩 기록이 성공적으로 저장되었습니다. (ID: ${result.readingId?.substring(0, 8) || 'unknown'})`,
          duration: 5000
        });
        setReadingJustSaved(true);
        
        // 🎨 UX 개선: 5초 후 자동으로 새 리딩 준비 상태로 초기화
        setTimeout(() => {
          setReadingJustSaved(false);
        }, 5000);
      } else {
        // 🔧 개선: 서버 액션 에러 처리 개선
        let errorMessage = '리딩 저장 중 알 수 없는 오류가 발생했습니다.';
        
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (typeof result.error === 'object' && result.error) {
          // 유효성 검사 에러 객체 처리
          const errorDetails = Object.values(result.error).flat().join(', ');
          errorMessage = `입력 오류: ${errorDetails}`;
        }
        
        console.error('🚨 서버 액션 저장 실패:', result.error);
        
        toast({ 
          variant: 'destructive', 
          title: '저장 실패', 
          description: errorMessage,
          duration: 9000,
        });
      }
    } catch (error) {
      console.error('🚨 저장 중 예외 발생:', error);
      toast({ 
        variant: 'destructive', 
        title: '저장 오류', 
        description: error instanceof Error ? error.message : '리딩 저장 중 예상치 못한 오류가 발생했습니다.',
        duration: 9000,
      });
    } finally {
      setIsSavingReading(false);
    }
  };

  const handleShareReading = async () => {
    if (!interpretation || selectedCardsForReading.length === 0 || !question.trim()) {
      toast({ 
        variant: 'destructive', 
        title: '공유 오류', 
        description: '공유할 해석 내용, 선택된 카드, 또는 질문이 없습니다.' 
      });
      return;
    }

    // ✅ Real Firebase enabled - no need to check for mock mode anymore

    setIsSharingReading(true);

    try {
      // Create shareable reading data
      const shareData = {
        question: question,
        spreadName: selectedSpread.name,
        spreadNumCards: selectedSpread.numCards,
        drawnCards: selectedCardsForReading.map((card, index) => ({
          id: card.id,
          isReversed: !!card.isReversed,
          position: selectedSpread.positions?.[index] || `카드 ${index + 1}`,
        })),
        interpretationText: interpretation,
        timestamp: new Date().toISOString(),
      };

      // 클라이언트에서 직접 공유 링크 생성
      const result = await shareReadingClient(shareData);
      
      if (result.success && result.shareUrl) {
        // Copy the share URL to clipboard
        await navigator.clipboard.writeText(result.shareUrl);
        
        // Store share URL and open guide dialog
        setCurrentShareUrl(result.shareUrl);
        setShareGuideOpen(true);
        
        toast({
          title: '공유 링크 생성됨',
          description: '공유 가이드를 확인해주세요!',
          duration: 3000,
        });
      } else {
        throw new Error(result.error || 'Failed to create share link');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        variant: 'destructive',
        title: '공유 실패',
        description: '리딩 공유 중 오류가 발생했습니다.',
      });
    }

    setIsSharingReading(false);
  };

  const cardStack = (
    <div
      className={`relative mx-auto ${TARGET_CARD_HEIGHT_CLASS} cursor-pointer group mb-6`}
      style={{ aspectRatio: `${IMAGE_ORIGINAL_WIDTH} / ${IMAGE_ORIGINAL_HEIGHT}` }}
      onClick={
        (stage === 'deck_ready' || stage === 'shuffled') &&
        !isShufflingAnimationActive
          ? handleShuffle
          : undefined
      }
      aria-disabled={isShufflingAnimationActive || stage === 'interpreting'}
      aria-busy={isShufflingAnimationActive || stage === 'shuffling'}
      aria-label={isShufflingAnimationActive || stage === 'shuffling' ? "카드를 섞는 중" : (stage === 'deck_ready' || stage === 'shuffled' ? "카드 덱, 클릭하여 섞기" : "카드 덱")}
    >
      {visualCardAnimControls.map((controls, i) => (
        <motion.div
          key={`visual-card-${i}`}
          className={`absolute top-0 left-0 h-full w-full overflow-hidden`}
          animate={controls}
          initial={{
            x: 0,
            y: 0,
            zIndex: NUM_VISUAL_CARDS_IN_STACK - i,
            opacity: 1,
            rotate: 0,
          }}
        >
          <Image
            src={CARD_BACK_IMAGE}
            alt="카드 뒷면 뭉치"
            width={IMAGE_ORIGINAL_WIDTH}
            height={IMAGE_ORIGINAL_HEIGHT}
            className="h-full w-auto object-contain"
            sizes={CARD_IMAGE_SIZES}
            priority={i < N_ANIMATING_CARDS_FOR_SHUFFLE}
          />
        </motion.div>
      ))}
      {(stage === 'deck_ready' || stage === 'shuffled') &&
        !isShufflingAnimationActive && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
            <p className="text-xl font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
              덱 (섞기)
            </p>
          </div>
        )}
    </div>
  );

  const displayableRevealedCards = revealedSpreadCards.filter(
    rc => !selectedCardsForReading.some(sc => sc.id === rc.id && sc.isReversed === rc.isReversed)
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">
            타로 리딩 설정
          </CardTitle>
          <CardDescription>
            리딩 환경을 설정하고 질문을 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="question"
              className="text-lg font-semibold text-foreground/90"
            >
              당신의 질문:
            </Label>
            <Textarea
              id="question"
              placeholder="카드에게 무엇을 묻고 싶나요? 예: 저의 현재 연애운은 어떤가요?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] bg-background/70 text-base"
              disabled={isShufflingAnimationActive || stage === 'shuffling' || stage === 'interpreting'}
              aria-disabled={isShufflingAnimationActive || stage === 'shuffling' || stage === 'interpreting'}
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="spread-type"
                className="text-lg font-semibold text-foreground/90"
              >
                타로 스프레드:
              </Label>
              <Select
                value={selectedSpread.id}
                onValueChange={(value) => {
                  const newSpread =
                    tarotSpreads.find((s) => s.id === value) ||
                    tarotSpreads[0];
                  setSelectedSpread(newSpread);
                  resetReadingState();
                }}
                disabled={isShufflingAnimationActive || stage === 'shuffling' || stage === 'interpreting'}
                aria-disabled={isShufflingAnimationActive || stage === 'shuffling' || stage === 'interpreting'}
              >
                <SelectTrigger id="spread-type" className="h-12 text-base" aria-label="타로 스프레드 종류 선택">
                  <SelectValue placeholder="스프레드 선택" />
                </SelectTrigger>
                <SelectContent>
                  {tarotSpreads.map((spread) => (
                    <SelectItem key={spread.id} value={spread.id}>
                      {spread.name} ({spread.numCards}장)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="interpretation-method"
                className="text-lg font-semibold text-foreground/90"
              >
                해석 스타일:
              </Label>
              <Select
                value={interpretationMethod}
                onValueChange={(value) =>
                  setInterpretationMethod(value as TarotInterpretationMethod)
                }
                disabled={isShufflingAnimationActive || stage === 'shuffling' || stage === 'interpreting'}
                aria-disabled={isShufflingAnimationActive || stage === 'shuffling' || stage === 'interpreting'}
              >
                <SelectTrigger
                  id="interpretation-method"
                  className="h-12 text-base"
                  aria-label="타로 해석 스타일 선택"
                >
                  <SelectValue placeholder="해석 스타일 선택" />
                </SelectTrigger>
                <SelectContent>
                  {tarotInterpretationStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id} className="py-2">
                      <div className="whitespace-normal">
                        <span className="font-medium">{style.name}:</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">{style.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">
            리딩 진행
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 p-6 md:p-8 min-h-[400px]">

          {(stage === 'deck_ready' || stage === 'shuffled' || stage === 'shuffling') && revealedSpreadCards.length === 0 && selectedCardsForReading.length === 0 && (
            <>
              {cardStack}
              <div className="flex flex-col items-center justify-around gap-4 sm:flex-row w-full">
                <Button
                  onClick={handleShuffle}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  disabled={isShufflingAnimationActive}
                  aria-disabled={isShufflingAnimationActive}
                  aria-label={isShufflingAnimationActive || stage === 'shuffling' ? '카드를 섞는 중' : '카드 섞기'}
                >
                  {isShufflingAnimationActive || stage === 'shuffling' ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Shuffle className="mr-2 h-5 w-5" />
                  )}
                  {isShufflingAnimationActive || stage === 'shuffling'
                    ? '섞는 중...'
                    : '카드 섞기'}
                </Button>
                <Button
                  onClick={handleRevealSpread}
                  disabled={isShufflingAnimationActive || stage !== 'shuffled'}
                  aria-disabled={isShufflingAnimationActive || stage !== 'shuffled'}
                  aria-label={isShufflingAnimationActive || stage !== 'shuffled' ? '카드 펼치기 비활성화됨' : '카드 펼치기'}
                  className="w-full sm:w-auto"
                >
                  <Layers className="mr-2 h-5 w-5" />
                  카드 펼치기
                </Button>
              </div>
            </>
          )}

          {stage === 'spread_revealed' && (
            <>
              <div className="w-full text-center mb-4">
                <h3 className="font-headline text-xl text-primary">
                  펼쳐진 카드 ({selectedCardsForReading.length}/{selectedSpread.numCards} 선택됨)
                </h3>
                <p className="text-sm text-muted-foreground" id="spread-instruction">
                  {selectedSpread.description} 카드를 클릭하여 ${selectedSpread.numCards}장 선택하세요.
                </p>
              </div>
              <div
                ref={spreadContainerRef}
                className="flex items-center overflow-x-auto p-2 w-full scrollbar-thin scrollbar-thumb-muted scrollbar-track-background"
                role="group"
                aria-labelledby="spread-instruction"
              >
                <div className="flex space-x-[-128px]" style={{ paddingRight: '128px' }}>
                  <AnimatePresence>
                    {displayableRevealedCards.map((cardInSpread, index) => (
                        <motion.div
                          key={cardInSpread.id + (cardInSpread.isReversed ? '-rev-spread' : '-upr-spread')}
                          role="button"
                          tabIndex={0}
                          aria-label={`펼쳐진 ${index + 1}번째 카드 선택 (${cardInSpread.name})`}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardSelectFromSpread(cardInSpread); }}
                          layoutId={cardInSpread.id + (cardInSpread.isReversed ? '-rev-layout' : '-upr-layout')}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: 40,
                            scale: 0.8,
                            transition: { duration: 0.2, ease: "easeIn" },
                          }}
                          transition={{ duration: 0.25, delay: index * 0.03 }}
                          onClick={() => handleCardSelectFromSpread(cardInSpread)}
                          className={`${TARGET_CARD_HEIGHT_CLASS} shrink-0 cursor-pointer transform transition-all duration-200 hover:scale-125 hover:z-30 hover:translate-y-[-12px] focus:outline-none`}
                          style={{ aspectRatio: `${IMAGE_ORIGINAL_WIDTH} / ${IMAGE_ORIGINAL_HEIGHT}` }}
                        >
                          <motion.div
                            className={`relative h-full w-full overflow-hidden transition-all duration-200 ease-in-out`}
                          >
                            <Image
                              src={getTarotImagePath('reading', cardInSpread.id, !cardInSpread.isFaceUp)}
                              alt={`${cardInSpread.name} (${cardInSpread.isReversed ? '역방향' : '정방향'})`}
                              width={IMAGE_ORIGINAL_WIDTH}
                              height={IMAGE_ORIGINAL_HEIGHT}
                              className={`h-full w-auto object-contain ${cardInSpread.isFaceUp && cardInSpread.isReversed ? 'rotate-180 transform' : ''}`}
                              sizes={CARD_IMAGE_SIZES}
                              priority={index < 10}
                            />
                          </motion.div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
               {selectedCardsForReading.length > 0 && selectedCardsForReading.length < selectedSpread.numCards && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCardsForReading([]);
                    const drawnPool = deck.map((card) => ({ ...card, isFaceUp: false, isReversed: Math.random() > 0.5 }));
                    setRevealedSpreadCards(drawnPool);
                    setStage('spread_revealed');
                  }}
                  className="mt-4"
                  aria-label="선택한 카드 모두 초기화"
                >
                  선택 초기화
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {(stage === 'cards_selected' || stage === 'interpreting' || stage === 'interpretation_ready' || (stage === 'spread_revealed' && selectedCardsForReading.length > 0) ) && (
        <Card className="animate-fade-in mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">
              선택된 카드 ({selectedCardsForReading.length}/
              {selectedSpread.numCards})
            </CardTitle>
            <CardDescription>
              {stage === 'cards_selected' ? "아래 카드들을 바탕으로 AI 해석을 진행합니다." : "카드를 선택하고 있습니다..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LayoutGroup>
              <div className="flex flex-wrap justify-center gap-3 min-h-[calc(theme(space.60)_+_theme(space.3))]" role="list" aria-label="선택된 카드 목록">
                <AnimatePresence>
                  {selectedCardsForReading.map((card, index) => (
                    <motion.div
                      key={card.id + (card.isReversed ? '-rev-selected' : '-upr-selected')}
                      role="listitem"
                      layoutId={card.id + (card.isReversed ? '-rev-layout' : '-upr-layout')}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                      exit={{ opacity: 0, scale: 0.8, transition: {duration: 0.2} }}
                      className={`${TARGET_CARD_HEIGHT_CLASS}`}
                      style={{ aspectRatio: `${IMAGE_ORIGINAL_WIDTH} / ${IMAGE_ORIGINAL_HEIGHT}`, border: 'none', outline: 'none', boxShadow: 'none' }}
                      aria-label={`${index + 1}번째 선택된 카드: ${card.name} (${card.isReversed ? '역방향' : '정방향'})`}
                    >
                      <motion.div
                        className={`relative h-full w-full`}
                        initial={{ rotateY: card.isFaceUp ? 0 : 180 }}
                        animate={{ rotateY: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <div style={{ backfaceVisibility: 'hidden' }}>
                           <Image
                            src={getTarotImagePath('reading', card.id, false)}
                            alt={`${card.name} (${card.isReversed ? '역방향' : '정방향'})`}
                            width={IMAGE_ORIGINAL_WIDTH}
                            height={IMAGE_ORIGINAL_HEIGHT}
                            className={`h-full w-full object-cover ${card.isReversed ? 'rotate-180 transform' : ''}`}
                            style={{ border: 'none', outline: 'none' }}
                            data-ai-hint={card.dataAiHint}
                            sizes={CARD_IMAGE_SIZES}
                            priority={index < 3}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          </CardContent>
           {(stage === 'cards_selected' || stage === 'interpreting' || stage === 'interpretation_ready') && (
            <CardFooter className="mt-6 flex justify-center">
              <Button
                onClick={handleGetInterpretation}
                disabled={
                  isShufflingAnimationActive ||
                  stage === 'interpreting' ||
                  stage !== 'cards_selected'
                }
                aria-disabled={
                  isShufflingAnimationActive ||
                  stage === 'interpreting' ||
                  stage !== 'cards_selected'
                }
                className="bg-accent px-6 py-3 text-lg text-accent-foreground hover:bg-accent/90"
                aria-label={stage === 'interpreting' ? 'AI가 해석하는 중' : 'AI 해석 받기'}
              >
                {stage === 'interpreting' ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                {stage === 'interpreting' ? '해석 중...' : 'AI 해석 받기'}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {(stage === 'interpretation_ready' || (stage === 'interpreting' && interpretation)) && (
         <AlertDialog open={isInterpretationDialogOpen} onOpenChange={setIsInterpretationDialogOpen}>
            <AlertDialogContent className="max-w-3xl w-[95vw] md:w-[90vw] max-h-[85vh] flex flex-col">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline text-2xl text-primary flex items-center">
                  <Sparkles className="mr-2 h-6 w-6 text-accent" />
                  AI 타로 해석
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  질문: {question} ({selectedSpread.name})
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {stage === 'interpreting' && !displayedInterpretation && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                    <p className="ml-3 text-muted-foreground">AI가 지혜를 엮고 있습니다...</p>
                  </div>
                )}
                <div
                  className="prose dark:prose-invert prose-lg max-w-none 
                    prose-headings:font-headline prose-headings:text-accent 
                    prose-headings:text-xl sm:prose-headings:text-2xl 
                    prose-headings:mb-4 prose-headings:mt-6 
                    prose-p:text-foreground/90 dark:prose-p:text-white/90 
                    prose-p:leading-8 prose-p:mb-4
                    prose-strong:text-primary dark:prose-strong:text-white 
                    prose-strong:font-semibold
                    prose-ul:my-4 prose-ul:space-y-2
                    prose-li:text-foreground/90 dark:prose-li:text-white/90
                    prose-li:leading-7
                    [&>h1]:text-3xl [&>h1]:border-b [&>h1]:border-muted [&>h1]:pb-3
                    [&>h2]:text-2xl [&>h2]:mt-8 [&>h2]:mb-4
                    [&>h3]:text-xl [&>h3]:mt-6 [&>h3]:mb-3
                    [&>p:first-of-type]:text-lg [&>p:first-of-type]:font-medium
                    [&>blockquote]:border-l-4 [&>blockquote]:border-accent 
                    [&>blockquote]:pl-4 [&>blockquote]:italic 
                    [&>blockquote]:text-foreground/80 dark:[&>blockquote]:text-white/80"
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="first:mt-0">{children}</h1>,
                      h2: ({children}) => <h2 className="first:mt-0">{children}</h2>,
                      h3: ({children}) => <h3 className="first:mt-0">{children}</h3>,
                      p: ({children}) => <p className="text-justify">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6">{children}</ul>,
                      li: ({children}) => <li className="mb-1">{children}</li>,
                      strong: ({children}) => <strong className="font-bold text-primary">{children}</strong>,
                      em: ({children}) => <em className="text-accent">{children}</em>,
                    }}
                  >
                    {displayedInterpretation}
                  </ReactMarkdown>
                </div>
                {!user && stage === 'interpretation_ready' && <SignUpPrompt />}
              </div>
              <AlertDialogFooter className="mt-4 pt-4 border-t flex-col sm:flex-row gap-2">
                {stage === 'interpretation_ready' && (
                  <Button
                    variant="outline"
                    onClick={handleShareReading}
                    disabled={isSharingReading}
                    className="w-full sm:w-auto"
                  >
                    {isSharingReading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                    {isSharingReading ? '공유 중...' : '리딩 공유하기'}
                  </Button>
                )}
                {!user && stage === 'interpretation_ready' && (
                  <Button
                    variant="default"
                    onClick={() => {
                      toast({ 
                        title: '로그인 필요', 
                        description: '리딩을 저장하려면 로그인이 필요합니다.',
                        action: (
                          <Link href="/sign-in?redirect=/reading">
                            <Button variant="outline" size="sm">로그인하기</Button>
                          </Link>
                        )
                      });
                    }}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/80"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    이 리딩 저장하기
                  </Button>
                )}
                {user && !readingJustSaved && stage === 'interpretation_ready' && (
                   <Button
                    variant="default"
                    onClick={handleSaveReading}
                    disabled={isSavingReading}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/80"
                  >
                    {isSavingReading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSavingReading ? '저장 중...' : '이 리딩 저장하기'}
                  </Button>
                )}
                {readingJustSaved && (
                  <Button variant="ghost" disabled className="w-full sm:w-auto text-green-600">
                    저장 완료!
                  </Button>
                )}
                <AlertDialogCancel className="w-full sm:w-auto mt-0">닫기</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      )}

      {/* This card shows a button to reopen the dialog if it was closed */}
      {stage === 'interpretation_ready' && interpretation && !isInterpretationDialogOpen && (
        <Card className="animate-fade-in mt-8">
           <CardHeader>
            <CardTitle className="font-headline flex items-center text-2xl text-primary">
              <BookOpenText className="mr-2 h-6 w-6 text-accent" />
              AI 해석 준비 완료
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-muted-foreground">AI가 생성한 해석을 다시 보거나 저장할 수 있습니다.</p>
             <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsInterpretationDialogOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Sparkles className="mr-2 h-5 w-5" />
                    해석 다시 보기
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareReading}
                  disabled={isSharingReading}
                >
                  {isSharingReading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                  {isSharingReading ? '공유 중...' : '리딩 공유'}
                </Button>
                {/* 🎯 개선: 모든 사용자에게 저장 버튼 표시 */}
                {!readingJustSaved && (
                    <Button
                        variant="outline"
                        onClick={user ? handleSaveReading : () => {
                          toast({ 
                            title: '로그인 필요', 
                            description: '리딩을 저장하려면 로그인이 필요합니다.',
                            action: (
                              <Link href="/sign-in?redirect=/reading">
                                <Button variant="outline" size="sm">로그인하기</Button>
                              </Link>
                            )
                          });
                        }}
                        disabled={isSavingReading}
                    >
                        {isSavingReading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSavingReading ? '저장 중...' : '리딩 저장'}
                        {!user && <span className="ml-1 text-xs text-muted-foreground">(로그인 필요)</span>}
                    </Button>
                )}
                {readingJustSaved && (
                  <Button variant="ghost" disabled className="text-green-600">
                    <Save className="mr-2 h-4 w-4" />
                    저장 완료!
                  </Button>
                )}
             </div>
          </CardContent>
        </Card>
      )}

      {/* Share Guide Dialog */}
      <ShareGuideDialog 
        isOpen={shareGuideOpen}
        onClose={() => setShareGuideOpen(false)}
        shareUrl={currentShareUrl}
      />

    </div>
  );
}
// Cache bust: 1753534098
