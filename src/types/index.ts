
import { z } from 'zod';

export type Suit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';

export type TarotCard = {
  id: string;
  name: string;
  suit: Suit;
  number?: string | number;
  imageSrc: string;
  dataAiHint: string;
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaningUpright: string;
  meaningReversed: string;
  description?: string;
  fortuneTelling?: string[];
  questionsToAsk?: string[];
  astrology?: string;
  affirmation?: string;
  element?: string;
  isReversed?: boolean; 
  isFaceUp?: boolean; 
  position?: string;
};

export type TarotInterpretationMethod =
  | "전통 RWS (라이더-웨이트-스미스)"
  | "토트 기반 심층 분석"
  | "심리학적 원형 탐구"
  | "영적 성장과 자기 성찰"
  | "실질적 행동 지침"
  | "내면의 그림자 작업"
  | "현실적 통찰";

export type InterpretationStyleInfo = {
  id: TarotInterpretationMethod;
  name: string;
  description: string;
};

export const tarotInterpretationStyles: InterpretationStyleInfo[] = [
  {
    id: "전통 RWS (라이더-웨이트-스미스)",
    name: "전통 RWS (라이더-웨이트-스미스)",
    description: "라이더-웨이트-스미스 덱의 고전적 상징 기반 해석.",
  },
  {
    id: "토트 기반 심층 분석",
    name: "토트 기반 심층 분석",
    description: "토트 덱의 비교(秘敎) 및 점성학적 요소 탐구.",
  },
  {
    id: "심리학적 원형 탐구",
    name: "심리학적 원형 탐구",
    description: "칼 융 심리학 기반, 카드의 원형적 상징 해석.",
  },
  {
    id: "영적 성장과 자기 성찰",
    name: "영적 성장과 자기 성찰",
    description: "개인의 영적 발전과 자기 이해를 돕는 메시지 중심.",
  },
  {
    id: "실질적 행동 지침",
    name: "실질적 행동 지침",
    description: "현재 상황에 적용할 구체적이고 실용적인 조언 제공.",
  },
  {
    id: "내면의 그림자 작업",
    name: "내면의 그림자 작업",
    description: "무의식 속 숨겨진 그림자 발견 및 통합 과정 지원.",
  },
  {
    id: "현실적 통찰",
    name: "현실적 통찰",
    description: "미화하지 않은 직설적 해석으로 현실적 상황과 도전 과제를 명확히 제시.",
  },
];


export type SpreadConfiguration = {
  id: string;
  name: string; 
  description: string; 
  numCards: number;
  positions?: string[]; 
};

export const tarotSpreads: SpreadConfiguration[] = [
  { id: 'single-spark', name: '한 장의 불꽃 (Single Spark)', description: '빠른 통찰을 위한 단일 카드입니다.', numCards: 1, positions: ['현재 상황/조언'] },
  { id: 'trinity-view', name: '삼위일체 조망 (Trinity View)', description: '과거, 현재, 미래를 아우르는 세 장의 카드입니다.', numCards: 3, positions: ['과거', '현재', '미래'] },
  { id: 'pentagram-insight', name: '오각별 통찰 (Pentagram Insight)', description: '상황의 여러 측면을 살펴보는 다섯 장의 카드입니다.', numCards: 5, positions: ['상황의 핵심', '내적 영향', '외적 영향', '극복할 과제', '잠재적 결과'] },
  { id: 'seven-stars-path', name: '일곱 별의 길 (Seven Stars Path)', description: '더 깊은 분석을 위한 일곱 장의 카드입니다.', numCards: 7, positions: ['현재 상황', '즉각적 과거', '가까운 미래', '핵심 문제', '주변 환경', '희망과 두려움', '최종 결과'] },
  { id: 'nine-realms-journey', name: '아홉 영역의 여정 (Nine Realms Journey)', description: '포괄적인 이해를 위한 아홉 장의 카드입니다.', numCards: 9 },
  { id: 'celtic-cross-wisdom', name: '켈틱 크로스 지혜 (Celtic Cross Wisdom)', description: '가장 전통적이고 심층적인 열 장의 카드 스프레드입니다.', numCards: 10, positions: ['현재 상황', '도전 과제', '과거 기반', '가까운 미래', '목표/의식', '무의식적 영향', '조언', '외부 영향', '희망과 두려움', '최종 결과'] },
];

export const SavedReadingCardSchema = z.object({
  id: z.string(),
  isReversed: z.boolean(),
  position: z.string().optional(),
});
export type SavedReadingCardFirestore = z.infer<typeof SavedReadingCardSchema>;

export const SaveReadingInputSchema = z.object({
  userId: z.string().min(1, { message: '사용자 ID가 필요합니다.' }),
  question: z.string().min(1, { message: '질문 내용이 필요합니다.' }),
  spreadName: z.string().min(1, { message: '스프레드 이름이 필요합니다.' }),
  spreadNumCards: z.number().int().positive({ message: '스프레드 카드 수는 양의 정수여야 합니다.' }),
  drawnCards: z.array(SavedReadingCardSchema).min(1, { message: '최소 한 장의 카드가 필요합니다.' }),
  interpretationText: z.string().min(1, { message: '해석 내용이 필요합니다.' }),
});
export type SaveReadingInput = z.infer<typeof SaveReadingInputSchema>;

export type SavedReadingCard = {
  id: string;
  name: string;
  imageSrc: string;
  isReversed: boolean;
  position?: string;
};

export type SavedReading = {
  id: string;
  userId: string;
  question: string;
  spreadName: string;
  spreadNumCards: number;
  drawnCards: SavedReadingCard[];
  interpretationText: string;
  createdAt: Date;
};

export type CommunityPostCategory = 'free-discussion' | 'reading-share' | 'q-and-a' | 'deck-review' | 'study-group';

export type CommunityPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  title: string;
  content: string;
  imageUrl: string | null;
  viewCount: number;
  commentCount: number;
  category: CommunityPostCategory;
  createdAt: Date;
  updatedAt: Date;
};

export const FreeDiscussionPostFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자를 초과할 수 없습니다.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  imageUrl: z.union([
    z.string().url('유효한 이미지 URL을 입력해주세요.'),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional(),
});
export type FreeDiscussionPostFormData = z.infer<typeof FreeDiscussionPostFormSchema>;

export const CommunityCommentFormSchema = z.object({
  content: z.string().min(1, "댓글 내용을 입력해주세요.").max(2000, "댓글은 2000자를 초과할 수 없습니다."),
  isSecret: z.boolean().default(false),
});

// Tarot Reading History Types
export type TarotReadingHistory = {
  id: string;
  userId: string;
  question: string;
  spreadType: string;
  cards: {
    card: TarotCard;
    position: string;
    isReversed: boolean;
  }[];
  interpretation: string;
  interpretationMethod: TarotInterpretationMethod;
  createdAt: Date;
  tags?: string[];
  note?: string;
};

export const TarotReadingHistorySchema = z.object({
  userId: z.string(),
  question: z.string().min(1),
  spreadType: z.string(),
  cards: z.array(z.object({
    card: z.any(), // TarotCard schema would be complex, using any for now
    position: z.string(),
    isReversed: z.boolean(),
  })),
  interpretation: z.string(),
  interpretationMethod: z.string(),
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
});
export type CommunityCommentFormData = z.infer<typeof CommunityCommentFormSchema>;

export type CommunityComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
};


export const BlogFormDataSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다."),
  content: z.string().min(1, "내용은 필수입니다."),
  authorName: z.string().optional(),
  authorPhotoURL: z.string().url().optional(),
});
export type BlogFormData = z.infer<typeof BlogFormDataSchema>;

export const UserProfileFormSchema = z.object({
  displayName: z.string().min(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' }).max(50, { message: '닉네임은 최대 50자까지 가능합니다.' }),
  birthDate: z.string().optional(),
  sajuInfo: z.string().optional(),
});
export type UserProfileFormData = z.infer<typeof UserProfileFormSchema>;

// Reading Experience Types for Firebase
export interface ReadingExperience {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    level: string;
  };
  spreadType: string;
  cards: string[];
  tags: string[];
  likes: number;
  commentsCount: number;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingComment {
  id: string;
  postId: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  parentId?: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

// Form Schemas
export const ReadingExperienceFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자를 초과할 수 없습니다.'),
  spreadType: z.string().min(1, '스프레드 종류를 선택해주세요.'),
  content: z.string().min(50, '내용을 최소 50자 이상 입력해주세요.').max(5000, '내용은 5000자를 초과할 수 없습니다.'),
  cards: z.array(z.string()).min(1, '최소 1개 이상의 카드를 추가해주세요.').max(20, '카드는 최대 20개까지 추가할 수 있습니다.'),
  tags: z.array(z.string()).max(10, '태그는 최대 10개까지 추가할 수 있습니다.'),
});

export type ReadingExperienceFormData = z.infer<typeof ReadingExperienceFormSchema>;

export const CommentFormSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요.').max(1000, '댓글은 1000자를 초과할 수 없습니다.'),
});

export type CommentFormData = z.infer<typeof CommentFormSchema>;

// Education Inquiry Types
export interface EducationInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course: 'beginner' | 'intermediate' | 'professional';
  experience: 'none' | 'hobby' | 'professional';
  purpose?: string;
  questions?: string;
  status: 'pending' | 'contacted' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export const EducationInquiryFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(50, '이름은 50자를 초과할 수 없습니다.'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  phone: z.string().optional(),
  course: z.enum(['beginner', 'intermediate', 'professional']),
  experience: z.enum(['none', 'hobby', 'professional']),
  purpose: z.string().max(500, '수강 목적은 500자를 초과할 수 없습니다.').optional(),
  questions: z.string().max(500, '궁금한 점은 500자를 초과할 수 없습니다.').optional(),
});

export type EducationInquiryFormData = z.infer<typeof EducationInquiryFormSchema>;

export type ReadingSharePostFormData = z.infer<typeof ReadingSharePostFormSchema>;

// This schema is specifically for sharing a reading to the community
export const ReadingSharePostFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자를 초과할 수 없습니다.'),
  readingQuestion: z.string().min(1, '리딩 질문을 입력해주세요.'),
  cardsInfo: z.string().min(1, '카드 정보를 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  imageUrl: z.string().url('유효한 이미지 URL을 입력해주세요.').optional(),
});

// This schema is for creating posts via an external API, like from a CMS
export const ApiCommunityCombinedPayloadSchema = ReadingSharePostFormSchema.extend({
  category: z.enum(['reading-share', 'free-discussion', 'q-and-a', 'deck-review', 'study-group']),
  authorName: z.string().optional(),
  authorPhotoURL: z.string().url().optional(),
});

// AI Provider Types
export type AIProvider = 'openai' | 'gemini' | 'googleai' | 'anthropic' | 'grok' | 'openrouter' | 'huggingface';

export const AIProviderSchema = z.enum(['openai', 'gemini', 'googleai', 'anthropic', 'grok', 'openrouter', 'huggingface']);

export const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: AIProviderSchema,
  maxTokens: z.number().optional(),
  costPer1kTokens: z.number().optional(),
  capabilities: z.array(z.enum(['text', 'vision', 'function-calling'])).default(['text']),
  isActive: z.boolean().default(true),
});

export type AIModel = z.infer<typeof AIModelSchema>;

export const AIProviderConfigSchema = z.object({
  provider: AIProviderSchema,
  apiKey: z.string().min(1, 'API 키는 필수입니다'),
  baseUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  maxRequestsPerMinute: z.number().min(1).max(1000).default(60),
  models: z.array(AIModelSchema).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;

// Feature to AI Model mapping
export const AIFeatureSchema = z.enum(['tarot-reading', 'dream-interpretation', 'general-chat']);

export type AIFeature = z.infer<typeof AIFeatureSchema>;

export const AIFeatureMappingSchema = z.object({
  feature: AIFeatureSchema,
  provider: AIProviderSchema,
  modelId: z.string(),
  isActive: z.boolean().default(true),
  priority: z.number().default(1), // Lower number = higher priority
});

export type AIFeatureMapping = z.infer<typeof AIFeatureMappingSchema>;

// Tarot Card Instruction Types
export const TarotCardInstructionSchema = z.object({
  cardId: z.string(),
  interpretationMethod: z.enum([
    "전통 RWS (라이더-웨이트-스미스)",
    "토트 기반 심층 분석",
    "심리학적 원형 탐구",
    "영적 성장과 자기 성찰",
    "실질적 행동 지침",
    "내면의 그림자 작업"
  ]),
  uprightInstruction: z.string().min(1, '정방향 지침은 필수입니다'),
  reversedInstruction: z.string().min(1, '역방향 지침은 필수입니다'),
  contextualHints: z.string().optional(), // Additional context-specific hints
  combinationHints: z.string().optional(), // Hints for card combinations
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type TarotCardInstruction = z.infer<typeof TarotCardInstructionSchema> & { id?: string };

// Batch operations for tarot instructions
export const TarotInstructionBatchSchema = z.object({
  cardId: z.string(),
  instructions: z.array(TarotCardInstructionSchema),
});

export type TarotInstructionBatch = z.infer<typeof TarotInstructionBatchSchema>;

// AI Configuration Schema for admin settings
export const AIConfigurationSchema = z.object({
  providers: z.array(AIProviderConfigSchema),
  featureMappings: z.array(AIFeatureMappingSchema),
  globalSettings: z.object({
    defaultTemperature: z.number().min(0).max(2).default(0.7),
    defaultMaxTokens: z.number().min(1).max(4000).default(1000),
    enableFallback: z.boolean().default(true),
    fallbackProvider: AIProviderSchema.optional(),
  }),
  updatedAt: z.date().default(() => new Date()),
});

export type AIConfiguration = z.infer<typeof AIConfigurationSchema>;

// Provider-specific model definitions
export const PROVIDER_MODELS: Record<AIProvider, AIModel[]> = {
  openai: [
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai', maxTokens: 8192, costPer1kTokens: 0.03, capabilities: ['text', 'function-calling'], isActive: true },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', maxTokens: 128000, costPer1kTokens: 0.01, capabilities: ['text', 'vision', 'function-calling'], isActive: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, costPer1kTokens: 0.002, capabilities: ['text', 'function-calling'], isActive: true },
  ],
  gemini: [
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini', maxTokens: 32768, costPer1kTokens: 0.001, capabilities: ['text', 'function-calling'], isActive: true },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'gemini', maxTokens: 16384, costPer1kTokens: 0.002, capabilities: ['text', 'vision', 'function-calling'], isActive: true },
  ],
  googleai: [
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', provider: 'googleai', maxTokens: 2097152, costPer1kTokens: 0.001, capabilities: ['text', 'vision', 'function-calling'], isActive: true },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', provider: 'googleai', maxTokens: 1048576, costPer1kTokens: 0.0001, capabilities: ['text', 'vision', 'function-calling'], isActive: true },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'googleai', maxTokens: 32768, costPer1kTokens: 0.001, capabilities: ['text', 'function-calling'], isActive: true },
  ],
  anthropic: [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', maxTokens: 200000, costPer1kTokens: 0.015, capabilities: ['text', 'vision'], isActive: true },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic', maxTokens: 200000, costPer1kTokens: 0.003, capabilities: ['text', 'vision'], isActive: true },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', maxTokens: 200000, costPer1kTokens: 0.00025, capabilities: ['text', 'vision'], isActive: true },
  ],
  grok: [
    { id: 'grok-beta', name: 'Grok Beta', provider: 'grok', maxTokens: 4096, costPer1kTokens: 0.005, capabilities: ['text'], isActive: true },
  ],
  openrouter: [
    { id: 'openrouter/auto', name: 'OpenRouter Auto', provider: 'openrouter', maxTokens: 4096, costPer1kTokens: 0.005, capabilities: ['text'], isActive: true },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'openrouter', maxTokens: 200000, costPer1kTokens: 0.015, capabilities: ['text', 'vision'], isActive: true },
    { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'openrouter', maxTokens: 200000, costPer1kTokens: 0.003, capabilities: ['text', 'vision'], isActive: true },
  ],
  huggingface: [
    { id: 'meta-llama/Llama-2-70b-chat-hf', name: 'Llama 2 70B Chat', provider: 'huggingface', maxTokens: 4096, costPer1kTokens: 0.0007, capabilities: ['text'], isActive: true },
    { id: 'mistralai/Mistral-7B-Instruct-v0.1', name: 'Mistral 7B Instruct', provider: 'huggingface', maxTokens: 8192, costPer1kTokens: 0.0001, capabilities: ['text'], isActive: true },
  ],
};

// Form schemas for admin UI
export const AIProviderFormSchema = z.object({
  provider: AIProviderSchema,
  apiKey: z.string().min(1, 'API 키는 필수입니다'),
  baseUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  maxRequestsPerMinute: z.number().min(1).max(1000).default(60),
  selectedModels: z.array(z.string()).default([]),
});

export type AIProviderFormData = z.infer<typeof AIProviderFormSchema>;

export const TarotCardInstructionFormSchema = z.object({
  cardId: z.string(),
  interpretationMethod: z.enum([
    "전통 RWS (라이더-웨이트-스미스)",
    "토트 기반 심층 분석",
    "심리학적 원형 탐구",
    "영적 성장과 자기 성찰",
    "실질적 행동 지침",
    "내면의 그림자 작업"
  ]),
  uprightInstruction: z.string().min(1, '정방향 지침은 필수입니다'),
  reversedInstruction: z.string().min(1, '역방향 지침은 필수입니다'),
  contextualHints: z.string().optional(),
  combinationHints: z.string().optional(),
});

export type TarotCardInstructionFormData = z.infer<typeof TarotCardInstructionFormSchema>;
