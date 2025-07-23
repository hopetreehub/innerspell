
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] w-full">
      <Spinner size="large" />
    </div>
  );
}
