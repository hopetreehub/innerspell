
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { subscribeToNewsletter, type NewsletterSubscriptionFormData } from '@/actions/newsletterActions';

const formSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
});

export function NewsletterForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: NewsletterSubscriptionFormData) => {
    setLoading(true);
    const result = await subscribeToNewsletter(values);
    if (result.success) {
      toast({ title: '구독 처리 완료', description: result.message });
      form.reset();
    } else {
      toast({ variant: 'destructive', title: '구독 실패', description: result.message });
    }
    setLoading(false);
  };

  return (
    <div>
        <h3 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-xs">InnerSpell 소식 받기</h3>
        <p className="text-xs text-muted-foreground mb-4">최신 업데이트, 타로 통찰, 특별 혜택을 받아보세요.</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row gap-2"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input 
                        type="email" 
                        placeholder="이메일 주소" 
                        className="h-10 text-sm bg-background/50 border-primary/20 focus:bg-background"
                        {...field} />
                  </FormControl>
                  <FormMessage className="text-left text-xs mt-1" />
                </FormItem>
              )}
            />
            <Button type="submit" size="default" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm h-10 shrink-0" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4"/>}
              <span className="sm:hidden ml-2">구독하기</span>
            </Button>
          </form>
        </Form>
    </div>
  );
}
