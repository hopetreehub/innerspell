
'use server';

import { z } from 'zod';
import { firestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const NewsletterSubscriptionSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
});

export type NewsletterSubscriptionFormData = z.infer<typeof NewsletterSubscriptionSchema>;

export async function subscribeToNewsletter(
  formData: NewsletterSubscriptionFormData
): Promise<{ success: boolean; message: string }> {
  try {
    const validationResult = NewsletterSubscriptionSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.flatten().fieldErrors.email?.[0] || '유효하지 않은 이메일입니다.' };
    }

    const { email } = validationResult.data;

    const subscriberRef = firestore.collection('subscribers').doc(email);
    const doc = await subscriberRef.get();

    if (doc.exists) {
      await subscriberRef.update({
        subscribedAt: FieldValue.serverTimestamp(),
        status: 'active', 
      });
      console.log(`Newsletter: Email ${email} re-subscribed/updated in Firestore.`);
      return { success: true, message: '이미 구독된 이메일입니다. 최신 정보로 업데이트되었습니다.' };
    } else {
      await subscriberRef.set({
        email: email,
        subscribedAt: FieldValue.serverTimestamp(),
        status: 'active',
      });
      console.log(`Newsletter: Email ${email} successfully subscribed and saved to Firestore.`);
      
      // 이메일 알림 전송
      try {
        console.log('Newsletter: Attempting to send notification email...');
        const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/api/newsletter`;
        console.log('Newsletter: API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        console.log('Newsletter: Response status:', response.status);
        
        if (!response.ok) {
          console.error('Newsletter: Failed to send notification email:', await response.text());
        } else {
          console.log('Newsletter: Notification email sent successfully');
          const result = await response.json();
          console.log('Newsletter: API response:', result);
        }
      } catch (emailError) {
        console.error('Newsletter: Error sending notification email:', emailError);
        // 이메일 전송 실패해도 구독은 성공으로 처리
      }
      
      return { success: true, message: '뉴스레터 구독이 완료되었습니다! 환영합니다.' };
    }

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { success: false, message: `구독 처리 중 오류 발생: ${errorMessage}` };
  }
}

    
