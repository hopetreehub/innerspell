'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusFilterProps {
  currentStatus?: string;
}

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기중' },
  { value: 'contacted', label: '연락완료' },
  { value: 'completed', label: '처리완료' },
];

export default function StatusFilter({ currentStatus }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    
    params.set('page', '1'); // 필터 변경 시 첫 페이지로
    router.push(`/admin/education-inquiries?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">상태:</span>
      <Select
        value={currentStatus || 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}