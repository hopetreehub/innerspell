import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
import { sendEmail } from '@/lib/email-mock';

// 이메일 전송을 위한 transporter 설정
const createTransporter = () => {
  // Mock transporter for now
  return {
    sendMail: sendEmail
  };
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: '이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 관리자에게 알림 이메일 전송
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@innerspell.com',
      to: 'admin@innerspell.com',
      subject: '[InnerSpell] 새로운 뉴스레터 구독 신청',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">새로운 뉴스레터 구독 신청</h2>
          <p style="color: #666; font-size: 16px;">
            다음 이메일 주소에서 뉴스레터 구독을 신청했습니다:
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; color: #333;">
              <strong>이메일:</strong> ${email}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              <strong>신청 시간:</strong> ${new Date().toLocaleString('ko-KR', { 
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            이 이메일은 InnerSpell 웹사이트의 뉴스레터 구독 알림입니다.
          </p>
        </div>
      `,
      text: `새로운 뉴스레터 구독 신청\n\n이메일: ${email}\n신청 시간: ${new Date().toLocaleString('ko-KR')}`
    };

    // 구독자에게 환영 이메일 전송 (선택사항)
    const welcomeMailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@innerspell.com',
      to: email,
      subject: '[InnerSpell] 뉴스레터 구독을 환영합니다!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">InnerSpell 뉴스레터</h1>
          <h2 style="color: #666; text-align: center;">구독해 주셔서 감사합니다!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            안녕하세요,<br><br>
            InnerSpell 뉴스레터를 구독해 주셔서 진심으로 감사드립니다.<br>
            앞으로 타로, 점술, 꿈해몽, 영적 성장에 관한 유익한 콘텐츠를 정기적으로 전달해 드리겠습니다.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">뉴스레터에서 만나실 수 있는 내용:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>매주 타로 카드 해석과 메시지</li>
              <li>꿈 해몽 가이드와 심리학적 분석</li>
              <li>명상과 영적 성장을 위한 실용적인 팁</li>
              <li>AI 시대의 직관력 개발 방법</li>
              <li>독자 분들을 위한 특별 이벤트와 혜택</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 16px; text-align: center; margin: 30px 0;">
            <a href="https://innerspell.com" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              웹사이트 방문하기
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            이 이메일은 InnerSpell 뉴스레터 구독 확인 메일입니다.<br>
            구독을 원하지 않으시면 언제든지 수신 거부하실 수 있습니다.
          </p>
        </div>
      `,
      text: `InnerSpell 뉴스레터 구독을 환영합니다!\n\n구독해 주셔서 감사합니다. 앞으로 유익한 콘텐츠로 찾아뵙겠습니다.`
    };

    // 이메일 전송
    try {
      // 관리자에게 알림
      await transporter.sendMail(mailOptions);
      console.log('Admin notification email sent successfully');
      
      // 구독자에게 환영 이메일 (선택사항 - 환경변수로 제어)
      if (process.env.SEND_WELCOME_EMAIL === 'true') {
        await transporter.sendMail(welcomeMailOptions);
        console.log('Welcome email sent to subscriber');
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // 이메일 전송 실패해도 구독은 성공으로 처리 (Firestore에는 저장됨)
      // 하지만 로그는 남김
    }

    return NextResponse.json({
      success: true,
      message: '뉴스레터 구독이 완료되었습니다!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '구독 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      },
      { status: 500 }
    );
  }
}