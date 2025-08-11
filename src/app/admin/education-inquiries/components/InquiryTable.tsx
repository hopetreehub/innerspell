'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal, Mail, Phone, Copy } from 'lucide-react';
import { toast } from 'sonner';
import InquiryDetail from './InquiryDetail';
import { updateInquiryStatus } from '@/actions/educationInquiryActions';
import type { EducationInquiry } from '@/types';

interface InquiryTableProps {
  inquiries: EducationInquiry[];
}

const statusConfig = {
  pending: { label: '대기중', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
  contacted: { label: '연락완료', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' },
  completed: { label: '처리완료', variant: 'secondary' as const, className: 'bg-green-100 text-green-800' },
};

const courseConfig = {
  beginner: { label: '입문 과정', className: 'bg-purple-100 text-purple-800' },
  intermediate: { label: '심화 과정', className: 'bg-indigo-100 text-indigo-800' },
  professional: { label: '전문가 과정', className: 'bg-pink-100 text-pink-800' },
};

export default function InquiryTable({ inquiries }: InquiryTableProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<EducationInquiry | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type}이(가) 클립보드에 복사되었습니다.`);
  };

  const handleStatusUpdate = async (inquiryId: string, newStatus: EducationInquiry['status']) => {
    setIsUpdating(inquiryId);
    try {
      const result = await updateInquiryStatus(inquiryId, newStatus);
      if (result.success) {
        toast.success('상태가 업데이트되었습니다.');
        // 페이지 새로고침
        window.location.reload();
      } else {
        toast.error(result.error || '상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsUpdating(null);
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        문의 내역이 없습니다.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>과정</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>신청일</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((inquiry) => (
            <TableRow key={inquiry.id}>
              <TableCell className="font-medium">{inquiry.name}</TableCell>
              <TableCell>{inquiry.email}</TableCell>
              <TableCell>
                <Badge className={courseConfig[inquiry.course].className}>
                  {courseConfig[inquiry.course].label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={statusConfig[inquiry.status].variant}
                  className={statusConfig[inquiry.status].className}
                >
                  {statusConfig[inquiry.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(inquiry.createdAt), 'PPP', { locale: ko })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={isUpdating === inquiry.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>액션</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedInquiry(inquiry)}>
                      <Eye className="mr-2 h-4 w-4" />
                      상세 보기
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCopy(inquiry.email, '이메일')}>
                      <Mail className="mr-2 h-4 w-4" />
                      이메일 복사
                    </DropdownMenuItem>
                    {inquiry.phone && (
                      <DropdownMenuItem onClick={() => handleCopy(inquiry.phone!, '전화번호')}>
                        <Phone className="mr-2 h-4 w-4" />
                        전화번호 복사
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {inquiry.status === 'pending' && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate(inquiry.id, 'contacted')}>
                        연락완료로 변경
                      </DropdownMenuItem>
                    )}
                    {inquiry.status === 'contacted' && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate(inquiry.id, 'completed')}>
                        처리완료로 변경
                      </DropdownMenuItem>
                    )}
                    {inquiry.status === 'completed' && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate(inquiry.id, 'pending')}>
                        대기중으로 변경
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 상세 보기 다이얼로그 */}
      {selectedInquiry && (
        <InquiryDetail
          inquiry={selectedInquiry}
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
}