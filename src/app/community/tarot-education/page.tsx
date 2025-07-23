'use client';

import { useState } from 'react';
import { 
  GraduationCap, 
  MessageSquare, 
  User, 
  Mail, 
  Phone, 
  BookOpen,
  Target,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';

const faqs = [
  {
    question: '타로 초보자도 수강할 수 있나요?',
    answer: '네, 물론입니다! InnerSpell의 타로 교육은 초보자부터 전문가까지 모든 레벨을 위한 맞춤형 커리큘럼을 제공합니다. 기초부터 차근차근 배워나갈 수 있도록 체계적인 과정을 준비했습니다.'
  },
  {
    question: '온라인 수업과 오프라인 수업의 차이점은 무엇인가요?',
    answer: '온라인 수업은 시간과 장소에 구애받지 않고 자유롭게 학습할 수 있으며, 녹화된 강의를 반복 시청할 수 있습니다. 오프라인 수업은 직접적인 상호작용과 실습 위주의 학습이 가능하며, 다른 수강생들과의 네트워킹 기회도 제공됩니다.'
  },
  {
    question: '수료 후 자격증이 발급되나요?',
    answer: '네, 각 과정을 성공적으로 이수하시면 InnerSpell 공식 수료증이 발급됩니다. 전문가 과정을 수료하신 분들께는 타로 리더 자격증도 별도로 발급해드립니다.'
  },
  {
    question: '수업료 분납이 가능한가요?',
    answer: '네, 수강생분들의 부담을 덜어드리기 위해 2-4회 분납이 가능합니다. 자세한 분납 조건은 상담을 통해 안내해드립니다.'
  },
  {
    question: '타로 덱은 별도로 구매해야 하나요?',
    answer: '입문 과정에서는 기본 라이더웨이트 덱을 제공해드립니다. 이후 과정에서는 개인의 취향에 맞는 덱을 선택하실 수 있도록 추천 리스트와 구매 가이드를 제공합니다.'
  }
];

const courses = [
  {
    level: '입문',
    title: '타로 입문 과정',
    duration: '4주 (주 2회)',
    description: '타로의 기초 이론과 메이저 아르카나 22장의 의미를 학습합니다.',
    topics: ['타로의 역사와 철학', '메이저 아르카나 심볼리즘', '기본 스프레드 실습', '직관력 개발 기초']
  },
  {
    level: '중급',
    title: '타로 심화 과정',
    duration: '8주 (주 2회)',
    description: '마이너 아르카나와 다양한 스프레드 기법을 마스터합니다.',
    topics: ['마이너 아르카나 완전 정복', '켈틱 크로스 스프레드', '관계/직업/건강 특화 리딩', '리버스 카드 해석법']
  },
  {
    level: '전문가',
    title: '타로 전문가 과정',
    duration: '12주 (주 2회)',
    description: '프로페셔널 타로 리더가 되기 위한 모든 것을 배웁니다.',
    topics: ['상담 심리학 기초', '윤리적 리딩 가이드', '비즈니스 타로 리딩', '나만의 리딩 스타일 개발']
  }
];

export default function TarotEducationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'beginner',
    experience: 'none',
    purpose: '',
    questions: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);
    toast.success('교육 상담 신청이 완료되었습니다!');

    // 폼 초기화
    setFormData({
      name: '',
      email: '',
      phone: '',
      course: 'beginner',
      experience: 'none',
      purpose: '',
      questions: ''
    });

    // 3초 후 성공 메시지 숨기기
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="space-y-12">
      {/* 헤더 */}
      <header className="text-center">
        <GraduationCap className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">타로 교육 문의</h1>
        <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
          체계적인 커리큘럼과 전문 강사진이 함께하는 타로 교육 프로그램
        </p>
      </header>

      {/* 코스 소개 */}
      <section className="max-w-6xl mx-auto">
        <h2 className="font-headline text-3xl font-bold text-primary text-center mb-8">교육 과정 소개</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription className="text-sm">{course.duration}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    주요 학습 내용
                  </h4>
                  <ul className="text-sm space-y-1">
                    {course.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="max-w-4xl mx-auto">
        <h2 className="font-headline text-3xl font-bold text-primary text-center mb-8">자주 묻는 질문</h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-medium">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 상담 신청 폼 */}
      <section className="max-w-2xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">교육 상담 신청</CardTitle>
            <CardDescription>
              관심 있는 과정에 대해 상담을 신청하시면 24시간 내에 연락드립니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">신청이 완료되었습니다!</h3>
                <p className="text-muted-foreground">곧 담당자가 연락드릴 예정입니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름 *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="홍길동"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>관심 과정 *</Label>
                  <RadioGroup
                    value={formData.course}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="font-normal cursor-pointer">
                        입문 과정 (4주)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="font-normal cursor-pointer">
                        심화 과정 (8주)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="font-normal cursor-pointer">
                        전문가 과정 (12주)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>타로 경험</Label>
                  <RadioGroup
                    value={formData.experience}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none" className="font-normal cursor-pointer">
                        경험 없음
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hobby" id="hobby" />
                      <Label htmlFor="hobby" className="font-normal cursor-pointer">
                        취미로 공부한 적 있음
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="exp-professional" />
                      <Label htmlFor="exp-professional" className="font-normal cursor-pointer">
                        전문적으로 활동 중
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">수강 목적</Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    placeholder="타로를 배우고자 하는 목적이나 목표를 알려주세요"
                    value={formData.purpose}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questions">궁금한 점</Label>
                  <Textarea
                    id="questions"
                    name="questions"
                    placeholder="교육 과정에 대해 궁금한 점이 있다면 자유롭게 작성해주세요"
                    value={formData.questions}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>처리 중...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      상담 신청하기
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 하단 네비게이션 */}
      <div className="flex justify-center gap-4 pt-8">
        <Button variant="outline" asChild>
          <Link href="/community">
            <MessageSquare className="mr-2 h-4 w-4" />
            커뮤니티 홈
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/community/reading-share">
            <BookOpen className="mr-2 h-4 w-4" />
            리딩 경험 공유
          </Link>
        </Button>
      </div>
    </div>
  );
}