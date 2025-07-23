// Mock email implementation for testing
export const sendEmail = async (options: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) => {
  console.log('=== MOCK EMAIL SEND ===');
  console.log('From:', options.from);
  console.log('To:', options.to);
  console.log('Subject:', options.subject);
  console.log('======================');
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    messageId: `mock-${Date.now()}@innerspell.com`,
    accepted: [options.to],
    rejected: [],
    response: '250 OK: Mock email sent successfully'
  };
};