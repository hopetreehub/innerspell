'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestToastPage() {
  const { toast } = useToast();

  const showDefaultToast = () => {
    toast({
      title: '기본 토스트',
      description: '이것은 기본 토스트 메시지입니다.',
    });
  };

  const showSuccessToast = () => {
    toast({
      title: '성공!',
      description: '작업이 성공적으로 완료되었습니다.',
    });
  };

  const showErrorToast = () => {
    toast({
      variant: 'destructive',
      title: '오류 발생',
      description: '문제가 발생했습니다. 다시 시도해주세요.',
    });
  };

  const showLongToast = () => {
    toast({
      title: '긴 메시지 테스트',
      description: '이것은 매우 긴 토스트 메시지입니다. 토스트가 제대로 표시되는지, 자동으로 닫히는지 확인해보세요. 5초 후에 자동으로 사라집니다.',
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Toast 테스트 페이지</CardTitle>
          <CardDescription>
            다양한 토스트 메시지를 테스트해보세요. 각 버튼을 클릭하면 토스트가 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={showDefaultToast}>
              기본 토스트 표시
            </Button>
            <Button onClick={showSuccessToast} variant="outline">
              성공 토스트 표시
            </Button>
            <Button onClick={showErrorToast} variant="destructive">
              오류 토스트 표시
            </Button>
            <Button onClick={showLongToast} variant="secondary">
              긴 메시지 토스트
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">디버깅 정보:</h3>
            <ul className="text-sm space-y-1">
              <li>• 토스트는 화면 우측 하단에 표시됩니다</li>
              <li>• 5초 후 자동으로 사라집니다</li>
              <li>• X 버튼을 클릭하여 수동으로 닫을 수 있습니다</li>
              <li>• 한 번에 하나의 토스트만 표시됩니다</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}