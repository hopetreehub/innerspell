/**
 * 타로 스타일 추출 및 프롬프트 생성 서비스
 * 사용자 질문에서 스타일을 추출하고 적절한 프롬프트를 생성
 */

import { TAROT_STYLE_PROMPTS, SPREAD_DEPTH_GUIDELINES, getStyleSpreadPrompt } from '@/ai/prompts/tarot-style-prompts';
import { TarotInstructionsService } from '@/services/tarot-instructions-service';
import { TarotCardInstruction } from '@/types/tarot-instructions';

// 스타일 매핑 테이블
const STYLE_MAPPINGS = {
  // 한글 스타일명 -> 스타일 ID
  '고전적': 'traditional-rws',
  '전통': 'traditional-rws',
  '웨이트': 'traditional-rws',
  'RWS': 'traditional-rws',
  
  '토트': 'thoth-crowley',
  '크로울리': 'thoth-crowley',
  '텔레마': 'thoth-crowley',
  
  '심리학적': 'psychological-jungian',
  '융': 'psychological-jungian',
  '분석심리': 'psychological-jungian',
  
  '영적': 'spiritual-growth',
  '영성': 'spiritual-growth',
  '스피리추얼': 'spiritual-growth',
  
  '실용적': 'practical-action',
  '실질적': 'practical-action',
  '행동': 'practical-action',
  
  '그림자': 'shadow-work',
  '섀도우': 'shadow-work',
  '무의식': 'shadow-work',
  
  '현실적': 'realistic-insight',
  '직설적': 'realistic-insight',
  '리얼리스틱': 'realistic-insight'
};

// 스프레드 매핑 테이블
const SPREAD_MAPPINGS = {
  '1장': 'single-spark',
  '원카드': 'single-spark',
  '싱글': 'single-spark',
  
  '3장': 'trinity-view',
  '삼각': 'trinity-view',
  '과거현재미래': 'trinity-view',
  
  '5장': 'pentagram-insight',
  '오각별': 'pentagram-insight',
  '펜타그램': 'pentagram-insight',
  
  '7장': 'seven-stars-path',
  '일곱별': 'seven-stars-path',
  '세븐스타': 'seven-stars-path',
  
  '켈틱': 'celtic-cross-wisdom',
  '십자가': 'celtic-cross-wisdom',
  '10장': 'celtic-cross-wisdom'
};

export interface ExtractedStyle {
  styleId: string;
  styleName: string;
  cleanQuestion: string;
}

/**
 * 사용자 질문에서 스타일 추출
 */
export function extractStyleFromQuestion(question: string): ExtractedStyle {
  // 스타일 패턴 매칭: (해석 스타일: XXX) 또는 [스타일: XXX]
  const stylePattern = /[\(\[](?:해석\s*)?스타일\s*[:：]\s*([^\)\]]+)[\)\]]/i;
  const match = question.match(stylePattern);
  
  if (match) {
    const styleName = match[1].trim();
    const cleanQuestion = question.replace(stylePattern, '').trim();
    
    // 스타일명으로 스타일 ID 찾기
    for (const [key, value] of Object.entries(STYLE_MAPPINGS)) {
      if (styleName.includes(key) || key.includes(styleName)) {
        return {
          styleId: value,
          styleName: styleName,
          cleanQuestion
        };
      }
    }
  }
  
  // 기본값: 전통적 해석
  return {
    styleId: 'traditional-rws',
    styleName: '고전적',
    cleanQuestion: question
  };
}

/**
 * 스프레드 타입 추출
 */
export function extractSpreadType(spreadName: string): string {
  const normalizedSpread = spreadName.toLowerCase();
  
  for (const [key, value] of Object.entries(SPREAD_MAPPINGS)) {
    if (normalizedSpread.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // 기본값
  return 'trinity-view';
}

/**
 * 카드 정보에서 카드 ID 추출
 */
export function extractCardIds(cardInterpretations: string): string[] {
  const cardIds: string[] = [];
  
  // 카드 이름 패턴 매칭
  const lines = cardInterpretations.split('\n');
  for (const line of lines) {
    // "1. The Fool (정방향)" 또는 "The Fool (정방향)" 형태 매칭
    const match = line.match(/(?:^\d+\.\s*)?([^(]+)\s*\(/);
    if (match) {
      const cardName = match[1].trim();
      
      // 위치 정보 제거 (예: "과거: The Fool" -> "The Fool")
      const cleanCardName = cardName.split(':').pop()?.trim() || cardName;
      
      // 카드 이름을 ID로 변환 (예: "The Fool" -> "0-fool")
      // Major Arcana
      const majorArcanaMap: Record<string, string> = {
        'The Fool': '0-fool',
        'The Magician': '1-magician',
        'The High Priestess': '2-high-priestess',
        'The Empress': '3-empress',
        'The Emperor': '4-emperor',
        'The Hierophant': '5-hierophant',
        'The Lovers': '6-lovers',
        'The Chariot': '7-chariot',
        'Strength': '8-strength',
        'The Hermit': '9-hermit',
        'Wheel of Fortune': '10-wheel-of-fortune',
        'Justice': '11-justice',
        'The Hanged Man': '12-hanged-man',
        'Death': '13-death',
        'Temperance': '14-temperance',
        'The Devil': '15-devil',
        'The Tower': '16-tower',
        'The Star': '17-star',
        'The Moon': '18-moon',
        'The Sun': '19-sun',
        'Judgement': '20-judgement',
        'The World': '21-world'
      };
      
      // Check if it's a Major Arcana card
      if (majorArcanaMap[cleanCardName]) {
        cardIds.push(majorArcanaMap[cleanCardName]);
      } else {
        // Minor Arcana - extract suit and rank
        const suitMatch = cleanCardName.match(/(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King) of (Wands|Cups|Swords|Pentacles)/i);
        if (suitMatch) {
          const rank = suitMatch[1].toLowerCase();
          const suit = suitMatch[2].toLowerCase();
          cardIds.push(`${rank}-of-${suit}`);
        }
      }
    }
  }
  
  return cardIds;
}

/**
 * 스타일과 카드별 지침을 결합한 프롬프트 생성
 */
export async function generateStyledPrompt(
  styleId: string,
  spreadId: string,
  cardIds: string[],
  question: string,
  cardInterpretations: string
): Promise<string> {
  // 기본 스타일 프롬프트 가져오기
  const basePrompt = getStyleSpreadPrompt(styleId, spreadId);
  
  // 카드별 지침 가져오기 (스타일에 맞는 지침만)
  const cardInstructions: string[] = [];
  
  try {
    for (const cardId of cardIds) {
      const instruction = await TarotInstructionsService.getInstruction(cardId, styleId);
      if (instruction) {
        cardInstructions.push(formatCardInstruction(instruction));
      }
    }
  } catch (error) {
    console.error('Failed to load card instructions:', error);
  }
  
  // 최종 프롬프트 조합
  return `${basePrompt}

🎯 질문: ${question}
📖 스프레드: ${spreadId}
🎴 뽑힌 카드들: 
${cardInterpretations}

${cardInstructions.length > 0 ? `
💡 카드별 해석 지침:
${cardInstructions.join('\n\n')}
` : ''}

다음 형식으로 해석을 제공하세요:

## 🌟 전체 메시지
이번 리딩의 핵심 메시지와 전반적인 에너지

## 📖 카드별 해석
각 카드의 위치와 의미에 따른 상세 해석

## 💫 종합 조언
카드들의 메시지를 종합한 구체적이고 실행 가능한 조언

## 🔮 마무리
희망적이고 격려하는 메시지로 마무리

⚠️ 중요: 선택된 "${styleId}" 스타일의 고유한 특성이 명확히 드러나도록 해석하세요.`;
}

/**
 * 카드 지침을 읽기 쉬운 형태로 포맷
 */
function formatCardInstruction(instruction: TarotCardInstruction): string {
  return `### ${instruction.cardId}
- 정방향: ${instruction.uprightInstruction}
- 역방향: ${instruction.reversedInstruction}
- 키워드: ${instruction.keywords.join(', ')}
${instruction.customPromptAddition ? `- 특별 지침: ${instruction.customPromptAddition}` : ''}`;
}

/**
 * 스타일 목록 가져오기
 */
export function getAvailableStyles() {
  return Object.entries(TAROT_STYLE_PROMPTS).map(([id, prompt]) => {
    // 프롬프트에서 스타일명 추출
    const nameMatch = prompt.match(/당신은\s+(.+?)입니다/);
    const name = nameMatch ? nameMatch[1] : id;
    
    return {
      id,
      name,
      description: prompt.split('\n')[0]
    };
  });
}