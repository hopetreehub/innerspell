'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Mail, Phone, Calendar, User, BookOpen, Target } from 'lucide-react';
import { toast } from 'sonner';
import type { EducationInquiry } from '@/types';

interface InquiryDetailProps {
  inquiry: EducationInquiry;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: EducationInquiry['status']) => void;
}

const statusConfig = {
  pending: { label: '대기중', className: 'bg-yellow-100 text-yellow-800' },
  contacted: { label: '연락완료', className: 'bg-blue-100 text-blue-800' },
  completed: { label: '처리완료', className: 'bg-green-100 text-green-800' },
};

const courseConfig = {
  beginner: { label: '입문 과정', description: '4주 (주 2회)' },
  intermediate: { label: '심화 과정', description: '8주 (주 2회)' },
  professional: { label: '전문가 과정', description: '12주 (주 2회)' },
};

const experienceConfig = {
  none: '경험 없음',
  hobby: '취미로 공부한 적 있음',
  professional: '전문적으로 활동 중',
};

export default function InquiryDetail({ inquiry, isOpen, onClose, onStatusUpdate }: InquiryDetailProps) {
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type}이(가) 클립보드에 복사되었습니다.`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">교육 문의 상세 정보</DialogTitle>
          <DialogDescription>
            {format(new Date(inquiry.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}에 접수된 문의
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 상태 및 기본 정보 */}
          <div className="flex items-center justify-between">
            <Badge className={statusConfig[inquiry.status].className}>
              {statusConfig[inquiry.status].label}
            </Badge>
            <div className="flex gap-2">
              {inquiry.status === 'pending' && (
                <Button size="sm" onClick={() => onStatusUpdate(inquiry.id, 'contacted')}>
                  연락완료로 변경
                </Button>
              )}
              {inquiry.status === 'contacted' && (
                <Button size="sm" onClick={() => onStatusUpdate(inquiry.id, 'completed')}>
                  처리완료로 변경
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* 신청자 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              신청자 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">이름</p>
                <p className="font-medium">{inquiry.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이메일</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{inquiry.email}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(inquiry.email, '이메일')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {inquiry.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">연락처</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{inquiry.phone}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(inquiry.phone!, '전화번호')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 교육 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              교육 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">관심 과정</p>
                <p className="font-medium">
                  {courseConfig[inquiry.course].label}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({courseConfig[inquiry.course].description})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">타로 경험</p>
                <p className="font-medium">{experienceConfig[inquiry.experience]}</p>
              </div>
            </div>
          </div>

          {inquiry.purpose && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  수강 목적
                </h3>
                <p className="text-sm bg-muted p-3 rounded-md">{inquiry.purpose}</p>
              </div>
            </>
          )}

          {inquiry.questions && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">궁금한 점</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{inquiry.questions}</p>
              </div>
            </>
          )}

          <Separator />

          {/* 타임스탬프 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">접수일시</p>
              <p className="font-medium">
                {format(new Date(inquiry.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">최종 수정일시</p>
              <p className="font-medium">
                {format(new Date(inquiry.updatedAt), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}