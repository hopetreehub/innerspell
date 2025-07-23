#!/usr/bin/env tsx

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { mockPosts } from '../lib/blog/posts';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const POSTS_COLLECTION = 'blog_posts';

// Firebase Admin 초기화
function initializeFirebase() {
  try {
    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not set');
    }

    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }
}

// 포스트 마이그레이션
async function migratePosts() {
  const db = getFirestore();
  const batch = db.batch();

  console.log(`\n📝 Starting migration of ${mockPosts.length} blog posts...`);

  try {
    for (const post of mockPosts) {
      const postRef = db.collection(POSTS_COLLECTION).doc(post.id);
      
      // Date 객체를 Timestamp로 변환
      const postData = {
        ...post,
        publishedAt: Timestamp.fromDate(post.publishedAt),
        updatedAt: post.updatedAt ? Timestamp.fromDate(post.updatedAt) : Timestamp.now(),
        createdAt: Timestamp.now(),
        views: 0,
        likes: 0,
      };

      batch.set(postRef, postData);
      console.log(`  ✓ Prepared post: ${post.title}`);
    }

    // 배치 커밋
    await batch.commit();
    console.log('\n✅ All posts migrated successfully!');

    // 마이그레이션 결과 확인
    const snapshot = await db.collection(POSTS_COLLECTION).get();
    console.log(`\n📊 Migration summary:`);
    console.log(`  - Total posts: ${snapshot.size}`);
    
    const categories = new Map<string, number>();
    snapshot.docs.forEach(doc => {
      const category = doc.data().category;
      categories.set(category, (categories.get(category) || 0) + 1);
    });
    
    console.log(`  - Categories:`);
    categories.forEach((count, category) => {
      console.log(`    • ${category}: ${count} posts`);
    });

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// 기존 데이터 정리 (선택적)
async function clearExistingPosts() {
  const db = getFirestore();
  
  console.log('\n🗑️  Clearing existing posts...');
  
  try {
    const snapshot = await db.collection(POSTS_COLLECTION).get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`  ✓ Cleared ${snapshot.size} existing posts`);
  } catch (error) {
    console.error('❌ Failed to clear existing posts:', error);
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Blog Posts Migration Script');
  console.log('================================\n');

  // Firebase 초기화
  initializeFirebase();

  // 기존 데이터 정리 여부 확인
  const clearExisting = process.argv.includes('--clear');
  
  if (clearExisting) {
    await clearExistingPosts();
  }

  // 포스트 마이그레이션
  await migratePosts();

  console.log('\n✅ Migration completed successfully!');
  process.exit(0);
}

// 실행
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});