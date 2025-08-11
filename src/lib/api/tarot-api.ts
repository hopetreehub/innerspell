// API 호출 함수를 위한 클라이언트 라이브러리
import { addCSRFHeader } from './csrf';

export async function generateTarotInterpretationAPI(input: {
  question: string;
  cardSpread: string;
  cardInterpretations: string;
  isGuestUser: boolean;
}) {
  try {
    const response = await fetch('/api/generate-tarot-interpretation', {
      method: 'POST',
      headers: addCSRFHeader({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}