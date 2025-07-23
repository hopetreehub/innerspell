import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, spreadName, spreadNumCards, drawnCards, interpretationText, timestamp } = body;

    // Validate required fields
    if (!question || !spreadName || !drawnCards || !interpretationText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique share ID
    const shareId = `tarot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create shared reading data
    const sharedReading = {
      id: shareId,
      question,
      spreadName,
      spreadNumCards,
      drawnCards,
      interpretationText,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      viewCount: 0,
    };

    // Save to Firestore
    await db.collection('sharedReadings').doc(shareId).set(sharedReading);

    // Return the share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/reading/shared/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresAt: sharedReading.expiresAt,
    });

  } catch (error) {
    console.error('Share reading error:', error);
    return NextResponse.json(
      { error: 'Failed to create shared reading' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('id');

  if (!shareId) {
    return NextResponse.json(
      { error: 'Share ID is required' },
      { status: 400 }
    );
  }

  try {
    const docRef = db.collection('sharedReadings').doc(shareId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Shared reading not found' },
        { status: 404 }
      );
    }

    const data = doc.data()!;

    // Check if expired
    if (new Date(data.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Shared reading has expired' },
        { status: 410 }
      );
    }

    // Increment view count
    await docRef.update({
      viewCount: (data.viewCount || 0) + 1,
      lastViewedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      reading: {
        id: data.id,
        question: data.question,
        spreadName: data.spreadName,
        spreadNumCards: data.spreadNumCards,
        drawnCards: data.drawnCards,
        interpretationText: data.interpretationText,
        timestamp: data.timestamp,
        createdAt: data.createdAt,
        viewCount: (data.viewCount || 0) + 1,
      },
    });

  } catch (error) {
    console.error('Get shared reading error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve shared reading' },
      { status: 500 }
    );
  }
}