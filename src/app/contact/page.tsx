'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: 실제 이메일 전송 API 연동
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변 드리겠습니다.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('문의 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 text-center">문의하기</h1>
      <p className="text-muted-foreground text-center mb-8">
        궁금한 점이 있으시거나 도움이 필요하신가요? 언제든지 연락주세요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="홍길동"
            />
          </div>
          
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject">제목</Label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="문의 제목을 입력해주세요"
          />
        </div>

        <div>
          <Label htmlFor="message">메시지</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="문의 내용을 자세히 작성해주세요"
            rows={6}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? '전송 중...' : '문의 전송'}
        </Button>
      </form>

      <div className="mt-12 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">다른 연락 방법</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">이메일</p>
              <p className="font-medium">support@innerspell.com</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">운영 시간</p>
              <p className="font-medium">평일 09:00 - 18:00 (주말 및 공휴일 휴무)</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">답변 소요 시간</p>
              <p className="font-medium">영업일 기준 1-2일 이내</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}