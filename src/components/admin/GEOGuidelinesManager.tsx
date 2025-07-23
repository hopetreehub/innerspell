'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Target, MessageSquare, Tags, Search, Lightbulb } from 'lucide-react';

export function GEOGuidelinesManager() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="structure">구조화</TabsTrigger>
          <TabsTrigger value="content">콘텐츠</TabsTrigger>
          <TabsTrigger value="checklist">체크리스트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                GEO (생성형 엔진 최적화) 가이드라인
              </CardTitle>
              <CardDescription>
                AI 기반 검색 엔진에서 콘텐츠가 인용되도록 최적화하는 전략
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">GEO란?</h3>
                  <p className="text-sm text-muted-foreground">
                    Generative Engine Optimization은 ChatGPT, Claude, Perplexity 등 
                    AI 검색 엔진이 답변할 때 우리 콘텐츠를 인용하도록 최적화하는 과정입니다.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">효과</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI 검색 결과 노출도 40% 향상</li>
                    <li>• 브랜드 인지도 및 권위성 증대</li>
                    <li>• 새로운 유입 채널 확보</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                콘텐츠 구조화 가이드라인
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold">1. 제목 최적화</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    40-60자, 핵심 키워드 포함, 질문형 또는 방법 제시형 구조
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline">예시: 타로 카드로 2025년 목표 설정하는 법</Badge>
                  </div>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold">2. 섹션 구조</h3>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• H2: 주요 섹션 (## 제목)</li>
                    <li>• H3: 하위 주제 (### 제목)</li>
                    <li>• 불릿 포인트로 핵심 내용 정리</li>
                    <li>• 단계별 가이드 제공</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold">3. FAQ 섹션 (필수)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    모든 글에 {`"자주 묻는 질문"`} 섹션을 포함하여 AI가 인용하기 쉽게 구성
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                콘텐츠 작성 가이드라인
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">신뢰성 확보</h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>구체적 통계와 데이터 포함 (3개 이상)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>권위 있는 출처 인용 (대학, 연구기관)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>전문가 인용문 포함</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>검증 가능한 정보만 사용</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">의미론적 최적화</h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>자연어 중심 작성</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>의미가 풍부한 콘텐츠</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>관련 주제 다루기</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>키워드 자연스럽게 배치</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">FAQ 작성 가이드</h4>
                <div className="text-sm space-y-2">
                  <p>형식: ### Q: [구체적인 질문]</p>
                  <p>답변: A: [명확하고 간단한 답변 + 추가 팁]</p>
                  <p>개수: 최소 5-6개 질문</p>
                  <p>내용: 실제 사용자가 궁금해할 만한 질문들</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                GEO 최적화 체크리스트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-primary mb-3">새 글 작성 시</h3>
                  <div className="grid gap-2">
                    {[
                      '명확한 제목과 요약문 작성',
                      'H2, H3 태그로 구조화',
                      'FAQ 섹션 포함 (5-6개 질문)',
                      '구체적 통계/데이터 3개 이상 포함',
                      '권위 있는 출처 2개 이상 인용',
                      '불릿 포인트로 핵심 내용 정리',
                      'JSON-LD 구조화 데이터 추가',
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded border">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-primary mb-3">기존 글 개선 시</h3>
                  <div className="grid gap-2">
                    {[
                      '현재 구조 분석',
                      'FAQ 섹션 추가',
                      '통계/데이터 업데이트',
                      '태그 최적화',
                      '구조화 데이터 보완',
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded border">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">주의사항</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 키워드 과도한 반복 금지</li>
                    <li>• 검증되지 않은 정보 사용 금지</li>
                    <li>• 구조 없는 긴 문단 지양</li>
                    <li>• AI 스팸성 콘텐츠 생성 금지</li>
                    <li>• ** 표시나 이모티콘 사용 금지</li>
                    <li>• 과도한 강조 표현 지양</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}