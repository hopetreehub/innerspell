// 🚫 MOCK AUTH COMPLETELY DISABLED - ALWAYS USE REAL FIREBASE
// This file is now disabled to force real Firebase usage
throw new Error('Mock Auth is disabled. Use real Firebase instead.');

// Mock user database
const mockUsers = new Map<string, { email: string; password: string; uid: string; displayName?: string }>();

// Add a default test user
mockUsers.set('test@example.com', {
  email: 'test@example.com',
  password: 'test123',
  uid: 'mock-test-user-id',
  displayName: 'Test User'
});

// Add admin user for email/password login
mockUsers.set('admin@innerspell.com', {
  email: 'admin@innerspell.com',
  password: 'admin123',
  uid: 'admin-user-id',
  displayName: 'Admin User'
});

// Mock Firebase User
class MockUser implements Partial<FirebaseUser> {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };

  constructor(email: string, uid: string, displayName?: string) {
    this.uid = uid;
    this.email = email;
    this.displayName = displayName || null;
    this.photoURL = null;
    this.emailVerified = true;
    this.isAnonymous = false;
    this.metadata = {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    };
  }

  // Required Firebase User methods
  getIdToken = async () => 'mock-id-token';
  getIdTokenResult = async () => ({
    token: 'mock-id-token',
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    signInProvider: 'password',
    claims: { uid: this.uid, email: this.email },
    signInSecondFactor: null
  });
  reload = async () => {};
  toJSON = () => ({ uid: this.uid, email: this.email, displayName: this.displayName });
  delete = async () => {};
}

// Mock Auth object
export const mockAuth = {
  currentUser: null as MockUser | null,
  
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      setTimeout(() => callback(null), 100);
      return () => {};
    }
    
    // Check if user is logged in from localStorage
    try {
      const storedUser = localStorage.getItem('mockAuthUser');
      if (storedUser && localStorage.getItem('user-logged-out') !== 'true') {
        const userData = JSON.parse(storedUser);
        const mockUser = new MockUser(userData.email, userData.uid, userData.displayName);
        if (userData.photoURL) {
          mockUser.photoURL = userData.photoURL;
        }
        mockAuth.currentUser = mockUser;
        setTimeout(() => callback(mockAuth.currentUser), 100);
      } else {
        setTimeout(() => callback(null), 100);
      }
    } catch (error) {
      console.error('MockAuth: localStorage access failed:', error);
      setTimeout(() => callback(null), 100);
    }
    
    // Return unsubscribe function
    return () => {};
  },
  
  signInWithEmailAndPassword: async (_: any, email: string, password: string) => {
    // Check if user exists in mock database
    const user = mockUsers.get(email);
    
    if (!user || user.password !== password) {
      throw { code: 'auth/invalid-credential', message: 'Invalid email or password' };
    }
    
    // Create mock user
    const mockUser = new MockUser(email, user.uid, user.displayName);
    mockAuth.currentUser = mockUser;
    
    // Store in localStorage (browser only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockAuthUser', JSON.stringify({
        email: user.email,
        uid: user.uid,
        displayName: user.displayName
      }));
      localStorage.removeItem('user-logged-out');
    }
    
    return {
      user: mockUser,
      credential: null,
      operationType: 'signIn'
    };
  },
  
  createUserWithEmailAndPassword: async (_: any, email: string, password: string) => {
    // Check if user already exists
    if (mockUsers.has(email)) {
      throw { code: 'auth/email-already-in-use', message: 'Email already in use' };
    }
    
    // Create new user
    const uid = `mock-${Date.now()}`;
    const newUser = { email, password, uid };
    mockUsers.set(email, newUser);
    
    // Create mock user
    const mockUser = new MockUser(email, uid);
    mockAuth.currentUser = mockUser;
    
    // Store in localStorage (browser only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockAuthUser', JSON.stringify({
        email,
        uid
      }));
      localStorage.removeItem('user-logged-out');
    }
    
    return {
      user: mockUser,
      credential: null,
      operationType: 'signIn'
    };
  },
  
  signOut: async () => {
    mockAuth.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockAuthUser');
      localStorage.setItem('user-logged-out', 'true');
    }
  },
  
  signInWithPopup: async (auth: any, provider: any) => {
    // Mock Google sign in with more realistic data
    console.log('Mock Google Sign-In initiated');
    
    // Simulate popup delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate more realistic Google user data
    const googleUsers = [
      { email: 'admin@innerspell.com', displayName: 'Admin User', photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c' },
      { email: 'john.doe@gmail.com', displayName: 'John Doe', photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c' },
      { email: 'jane.smith@gmail.com', displayName: 'Jane Smith', photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c' }
    ];
    
    // Pick a random Google user or use a consistent one
    const googleUser = googleUsers[0]; // Using first user for consistency
    const uid = `mock-google-user-id`; // 고정된 UID 사용하여 저장된 타로 리딩과 일치
    
    const mockUser = new MockUser(googleUser.email, uid, googleUser.displayName);
    mockUser.photoURL = googleUser.photoURL;
    mockAuth.currentUser = mockUser;
    
    // Store in localStorage (browser only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockAuthUser', JSON.stringify({
        email: googleUser.email,
        uid,
        displayName: googleUser.displayName,
        photoURL: googleUser.photoURL,
        providerId: 'google.com'
      }));
      localStorage.removeItem('user-logged-out');
    }
    
    return {
      user: mockUser,
      credential: {
        providerId: 'google.com',
        signInMethod: 'google.com',
        accessToken: 'mock-google-access-token'
      },
      operationType: 'signIn',
      providerId: 'google.com',
      _tokenResponse: {
        federatedId: `https://accounts.google.com/${uid}`,
        providerId: 'google.com',
        email: googleUser.email,
        emailVerified: true,
        firstName: googleUser.displayName.split(' ')[0],
        fullName: googleUser.displayName,
        lastName: googleUser.displayName.split(' ')[1] || '',
        photoUrl: googleUser.photoURL,
        localId: uid,
        displayName: googleUser.displayName,
        idToken: 'mock-google-id-token',
        context: '',
        oauthAccessToken: 'mock-google-access-token',
        oauthExpireIn: 3599,
        refreshToken: 'mock-google-refresh-token',
        expiresIn: '3600',
        oauthIdToken: 'mock-google-oauth-id-token',
        rawUserInfo: JSON.stringify({
          name: googleUser.displayName,
          given_name: googleUser.displayName.split(' ')[0],
          family_name: googleUser.displayName.split(' ')[1] || '',
          picture: googleUser.photoURL,
          email: googleUser.email,
          email_verified: true,
          locale: 'ko'
        }),
        kind: 'identitytoolkit#VerifyAssertionResponse'
      }
    };
  }
};

// Export functions that match Firebase Auth API
export const signInWithEmailAndPassword = mockAuth.signInWithEmailAndPassword;
export const createUserWithEmailAndPassword = mockAuth.createUserWithEmailAndPassword;
export const signOut = mockAuth.signOut;
export const signInWithPopup = mockAuth.signInWithPopup;
export const onAuthStateChanged = mockAuth.onAuthStateChanged;
export const GoogleAuthProvider = class {
  providerId = 'google.com';
};

// Export mockAuth as default for easier integration
export default mockAuth;