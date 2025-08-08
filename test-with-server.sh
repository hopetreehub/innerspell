#!/bin/bash

# 서버 시작 (백그라운드)
echo "서버 시작..."
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# 서버가 준비될 때까지 대기
echo "서버 준비 대기중..."
sleep 10

# 테스트 실행
echo "테스트 실행..."
node simple-education-test.js

# 서버 로그 확인
echo -e "\n=== 서버 로그 (교육 문의 관련) ==="
grep -E "(교육|education|inq_|📝|📁|✅)" server.log || echo "관련 로그가 없습니다"

# 데이터 파일 확인
echo -e "\n=== 데이터 파일 내용 ==="
cat data/education-inquiries.json

# 서버 종료
echo -e "\n서버 종료..."
kill $SERVER_PID 2>/dev/null

echo -e "\n완료!"