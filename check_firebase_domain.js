// URL에서 발견된 문제점 분석
const problemUrl = "https://innerspell-an7ce.firebaseapp.com%0A/__/auth/iframe?apiKey=AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg";

console.log("🔍 URL 분석:");
console.log("원본 URL:", problemUrl);
console.log("디코딩된 URL:", decodeURIComponent(problemUrl));

console.log("\n❌ 문제점:");
console.log("1. URL에 %0A (newline) 문자가 포함되어 있습니다");
console.log("2. Firebase 도메인이 올바르지 않을 수 있습니다");

console.log("\n✅ 분석:");
console.log("- authDomain이 잘못 설정되었거나");
console.log("- URL 인코딩/디코딩 과정에서 문제가 발생했을 가능성");
console.log("- Vercel에서 Firebase 환경 변수에 개행문자가 포함되었을 가능성");