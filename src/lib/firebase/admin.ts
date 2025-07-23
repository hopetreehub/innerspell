import admin from 'firebase-admin';

// Development mode mock
if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // In-memory storage for mock documents - use global to persist across hot reloads
  if (!(global as any).mockStorage) {
    (global as any).mockStorage = {};
  }
  const mockStorage: { [collection: string]: { [id: string]: any } } = (global as any).mockStorage;
  
  // Create a mock admin implementation for development
  const createMockFirestoreQuery = (collectionName: string, filters: any[] = []) => {
    return {
      where: (field: string, op: string, value: any) => {
        const newFilters = [...filters, { field, op, value }];
        return createMockFirestoreQuery(collectionName, newFilters);
      },
      orderBy: (field: string, direction?: string) => createMockFirestoreQuery(collectionName, filters),
      limit: (n: number) => createMockFirestoreQuery(collectionName, filters),
      count: () => ({
        get: async () => {
          const collectionData = mockStorage[collectionName] || {};
          let docs = Object.values(collectionData);
          
          // Apply filters
          for (const filter of filters) {
            docs = docs.filter(doc => {
              const docValue = doc[filter.field];
              switch (filter.op) {
                case '==':
                  return docValue === filter.value;
                case '!=':
                  return docValue !== filter.value;
                case '>':
                  return docValue > filter.value;
                case '<':
                  return docValue < filter.value;
                case '>=':
                  return docValue >= filter.value;
                case '<=':
                  return docValue <= filter.value;
                default:
                  return true;
              }
            });
          }
          
          return { data: () => ({ count: docs.length }) };
        }
      }),
      get: async () => {
        const collectionData = mockStorage[collectionName] || {};
        let docs = Object.values(collectionData);
        
        // Apply filters
        for (const filter of filters) {
          docs = docs.filter(doc => {
            const docValue = doc[filter.field];
            switch (filter.op) {
              case '==':
                return docValue === filter.value;
              case '!=':
                return docValue !== filter.value;
              case '>':
                return docValue > filter.value;
              case '<':
                return docValue < filter.value;
              case '>=':
                return docValue >= filter.value;
              case '<=':
                return docValue <= filter.value;
              default:
                return true;
            }
          });
        }
        
        // Sort by createdAt descending (most recent first)
        docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const mappedDocs = docs.map(docData => ({
          id: docData.id,
          exists: true,
          data: () => docData
        }));
        
        return {
          docs: mappedDocs,
          empty: mappedDocs.length === 0
        };
      }
    };
  };

  const mockAdmin = {
    apps: [],
    firestore: () => ({
      collection: (collectionName: string) => ({
        doc: (docId?: string) => {
          const generatedId = docId || Math.random().toString(36).substring(7);
          return {
          id: generatedId,
          // Add collection information for transaction handling
          _collection: collectionName,
          set: async (docData: any) => {
            console.log(`[DEV MOCK] Setting document in ${collectionName}:`, docData);
            
            // Process data and handle FieldValue transformations
            const processedData = { ...docData };
            Object.keys(processedData).forEach(key => {
              if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'ServerTimestampTransform') {
                processedData[key] = new Date();
              } else if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'NumericIncrementTransform') {
                processedData[key] = processedData[key].operand || 0;
              }
            });
            
            // Store the document in mock storage
            if (!mockStorage[collectionName]) {
              mockStorage[collectionName] = {};
            }
            const docIdToUse = docId || Math.random().toString(36).substring(7);
            mockStorage[collectionName][docIdToUse] = {
              id: docIdToUse,
              ...processedData,
              createdAt: processedData.createdAt || new Date(),
              updatedAt: processedData.updatedAt || new Date()
            };
            
            return Promise.resolve();
          },
          collection: (subCollectionName: string) => ({
            doc: (subDocId?: string) => {
              const generatedId = subDocId || Math.random().toString(36).substring(7);
              return {
              id: generatedId,
              // Add path information for transaction handling
              _path: {
                segments: [collectionName, docId, subCollectionName, generatedId]
              },
              set: async (subDocData: any) => {
                console.log(`[DEV MOCK] Setting subcollection document in ${collectionName}/${docId}/${subCollectionName}:`, subDocData);
                
                // Process data and handle FieldValue transformations
                const processedData = { ...subDocData };
                Object.keys(processedData).forEach(key => {
                  if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'ServerTimestampTransform') {
                    processedData[key] = new Date();
                  } else if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'NumericIncrementTransform') {
                    processedData[key] = processedData[key].operand || 0;
                  }
                });
                
                const fullPath = `${collectionName}/${docId}/${subCollectionName}`;
                if (!mockStorage[fullPath]) {
                  mockStorage[fullPath] = {};
                }
                mockStorage[fullPath][generatedId] = {
                  id: generatedId,
                  postId: docId,
                  ...processedData,
                  createdAt: processedData.createdAt || new Date(),
                  updatedAt: processedData.updatedAt || new Date()
                };
                
                return Promise.resolve();
              },
              get: async () => {
                const fullPath = `${collectionName}/${docId}/${subCollectionName}`;
                if (generatedId && mockStorage[fullPath] && mockStorage[fullPath][generatedId]) {
                  const storedDoc = mockStorage[fullPath][generatedId];
                  return {
                    exists: true,
                    id: generatedId,
                    data: () => storedDoc
                  };
                }
                return {
                  exists: false,
                  id: generatedId,
                  data: () => ({})
                };
              },
              update: async (updateData: any) => {
                // Process data and handle FieldValue transformations
                const processedData = { ...updateData };
                Object.keys(processedData).forEach(key => {
                  if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'ServerTimestampTransform') {
                    processedData[key] = new Date();
                  } else if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'NumericIncrementTransform') {
                    const fullPath = `${collectionName}/${docId}/${subCollectionName}`;
                    const currentValue = mockStorage[fullPath][generatedId][key] || 0;
                    processedData[key] = currentValue + (processedData[key].operand || 0);
                  }
                });
                
                const fullPath = `${collectionName}/${docId}/${subCollectionName}`;
                if (generatedId && mockStorage[fullPath] && mockStorage[fullPath][generatedId]) {
                  mockStorage[fullPath][generatedId] = {
                    ...mockStorage[fullPath][generatedId],
                    ...processedData,
                    updatedAt: processedData.updatedAt || new Date()
                  };
                }
                return Promise.resolve();
              },
              delete: async () => {
                const fullPath = `${collectionName}/${docId}/${subCollectionName}`;
                if (generatedId && mockStorage[fullPath] && mockStorage[fullPath][generatedId]) {
                  delete mockStorage[fullPath][generatedId];
                }
                return Promise.resolve();
              }
            };
            },
            orderBy: (field: string, direction?: string) => ({
              get: async () => {
                const fullPath = `${collectionName}/${docId}/${subCollectionName}`;
                const collectionData = mockStorage[fullPath] || {};
                const docs = Object.values(collectionData);
                
                // Sort by field
                if (field === 'createdAt') {
                  docs.sort((a, b) => {
                    const aTime = new Date(a.createdAt).getTime();
                    const bTime = new Date(b.createdAt).getTime();
                    return direction === 'desc' ? bTime - aTime : aTime - bTime;
                  });
                }
                
                const mappedDocs = docs.map(docData => ({
                  id: docData.id,
                  exists: true,
                  data: () => docData
                }));
                
                return {
                  docs: mappedDocs,
                  empty: mappedDocs.length === 0
                };
              }
            })
          }),
          get: async () => {
            if (docId && mockStorage[collectionName] && mockStorage[collectionName][docId]) {
              const storedDoc = mockStorage[collectionName][docId];
              return {
                exists: true,
                id: docId,
                data: () => storedDoc
              };
            }
            return {
              exists: false,
              id: docId || 'mock-id',
              data: () => ({
                id: docId || 'mock-id',
                createdAt: new Date(),
                updatedAt: new Date()
              })
            };
          },
          update: async (updateData: any) => {
            console.log(`[DEV MOCK] Updating document in ${collectionName}:`, updateData);
            console.log(`[DEV MOCK] Starting FieldValue processing...`);
            
            // Ensure document exists in mock storage
            if (docId && !mockStorage[collectionName]) {
              mockStorage[collectionName] = {};
            }
            if (docId && !mockStorage[collectionName][docId]) {
              mockStorage[collectionName][docId] = {
                id: docId,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            }
            
            // Process data and handle FieldValue transformations
            const processedData = { ...updateData };
            Object.keys(processedData).forEach(key => {
              console.log(`[DEV MOCK] Processing key ${key}:`, processedData[key]);
              if (processedData[key] && processedData[key].constructor) {
                console.log(`[DEV MOCK] Constructor name: ${processedData[key].constructor.name}`);
              }
              
              if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'ServerTimestampTransform') {
                processedData[key] = new Date();
                console.log(`[DEV MOCK] Set ${key} to server timestamp`);
              } else if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'NumericIncrementTransform') {
                // Get current value, handling case where it might be a FieldValue object
                let currentValue = mockStorage[collectionName][docId][key] || 0;
                
                // If the current value is a FieldValue object, treat it as 0
                if (currentValue && typeof currentValue === 'object' && currentValue.constructor && currentValue.constructor.name === 'NumericIncrementTransform') {
                  currentValue = 0;
                }
                
                // Ensure currentValue is a number
                if (typeof currentValue !== 'number') {
                  currentValue = 0;
                }
                
                processedData[key] = currentValue + (processedData[key].operand || 0);
                console.log(`[DEV MOCK] Incremented ${key} from ${currentValue} to ${processedData[key]}`);
              }
            });
            
            // Update the document in mock storage
            if (docId && mockStorage[collectionName] && mockStorage[collectionName][docId]) {
              mockStorage[collectionName][docId] = {
                ...mockStorage[collectionName][docId],
                ...processedData,
                updatedAt: processedData.updatedAt || new Date()
              };
              console.log(`[DEV MOCK] Updated document ${docId} in ${collectionName}:`, mockStorage[collectionName][docId]);
            }
            
            return Promise.resolve();
          },
          delete: async () => {
            console.log(`[DEV MOCK] Deleting document in ${collectionName}`);
            return Promise.resolve();
          }
        };
        },
        add: async (docData: any) => {
          const docId = Math.random().toString(36).substring(7);
          console.log(`[DEV MOCK] Adding document to ${collectionName}:`, docData);
          
          // Process data and handle FieldValue transformations
          const processedData = { ...docData };
          Object.keys(processedData).forEach(key => {
            if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'ServerTimestampTransform') {
              processedData[key] = new Date();
            } else if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'NumericIncrementTransform') {
              processedData[key] = processedData[key].operand || 0;
            }
          });
          
          // Store the document in mock storage
          if (!mockStorage[collectionName]) {
            mockStorage[collectionName] = {};
          }
          mockStorage[collectionName][docId] = {
            id: docId,
            ...processedData,
            createdAt: processedData.createdAt || new Date(),
            updatedAt: processedData.updatedAt || new Date()
          };
          
          return Promise.resolve({ id: docId });
        },
        where: (field: string, op: string, value: any) => createMockFirestoreQuery(collectionName, [{ field, op, value }]),
        orderBy: (field: string, direction?: string) => createMockFirestoreQuery(collectionName, []),
        limit: (n: number) => createMockFirestoreQuery(collectionName, []),
        count: () => ({
          get: async () => {
            const collectionData = mockStorage[collectionName] || {};
            const count = Object.keys(collectionData).length;
            return { data: () => ({ count }) };
          }
        }),
        get: async () => {
          const collectionData = mockStorage[collectionName] || {};
          const docs = Object.values(collectionData).map(docData => ({
            id: docData.id,
            exists: true,
            data: () => docData
          }));
          
          return {
            docs,
            empty: docs.length === 0
          };
        }
      }),
      FieldValue: {
        serverTimestamp: () => ({ constructor: { name: 'ServerTimestampTransform' } }),
        increment: (n: number) => ({ constructor: { name: 'NumericIncrementTransform' }, operand: n })
      },
      runTransaction: async (updateFunction: (transaction: any) => Promise<any>) => {
        const transaction = {
          set: (ref: any, data: any) => {
            // Mock transaction set operation
            console.log(`[DEV MOCK] Transaction set:`, ref, data);
            
            // Extract path from reference
            // Check if ref has _path property (Firestore DocumentReference structure)
            let collectionPath = '';
            let docId = ref.id || '';
            
            console.log(`[DEV MOCK] Reference structure:`, {
              hasPath: !!ref._path,
              hasSegments: !!(ref._path && ref._path.segments),
              pathType: typeof ref.path,
              refKeys: Object.keys(ref).slice(0, 10), // Show first 10 keys
              refId: ref.id
            });
            
            if (ref._path && ref._path.segments) {
              // Real Firestore reference structure
              const segments = ref._path.segments;
              console.log(`[DEV MOCK] Path segments:`, segments);
              if (segments.length >= 2) {
                // Build the full collection path (e.g., "communityPosts/postId/comments")
                collectionPath = segments.slice(0, -1).join('/');
                docId = segments[segments.length - 1];
              }
            } else if (typeof ref.path === 'string') {
              // Alternative path structure
              const pathParts = ref.path.split('/');
              console.log(`[DEV MOCK] Path parts:`, pathParts);
              if (pathParts.length >= 2) {
                collectionPath = pathParts.slice(0, -1).join('/');
                docId = pathParts[pathParts.length - 1];
              }
            } else {
              // Fallback to simple collection name
              collectionPath = ref.collection || 'unknown';
              console.log(`[DEV MOCK] Using fallback collection:`, collectionPath);
            }
            
            // Store in the correct path
            if (!mockStorage[collectionPath]) {
              mockStorage[collectionPath] = {};
            }
            
            // Process data and handle FieldValue transformations
            const processedData = { ...data };
            Object.keys(processedData).forEach(key => {
              if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'ServerTimestampTransform') {
                processedData[key] = new Date();
              }
            });
            
            mockStorage[collectionPath][docId] = {
              id: docId,
              ...processedData,
              createdAt: processedData.createdAt || new Date(),
              updatedAt: processedData.updatedAt || new Date()
            };
            
            console.log(`[DEV MOCK] Stored in ${collectionPath}/${docId}`);
          },
          update: (ref: any, data: any) => {
            // Mock transaction update operation
            console.log(`[DEV MOCK] Transaction update:`, ref, data);
            console.log(`[DEV MOCK] Starting transaction FieldValue processing...`);
            
            // Extract path from reference
            let collectionPath = '';
            let docId = ref.id || '';
            
            console.log(`[DEV MOCK] Transaction update reference structure:`, {
              hasPath: !!ref._path,
              hasSegments: !!(ref._path && ref._path.segments),
              pathType: typeof ref.path,
              refKeys: Object.keys(ref).slice(0, 10),
              refId: ref.id,
              refCollection: ref.collection,
              _collection: ref._collection
            });
            
            if (ref._path && ref._path.segments) {
              const segments = ref._path.segments;
              console.log(`[DEV MOCK] Transaction update path segments:`, segments);
              if (segments.length >= 2) {
                collectionPath = segments.slice(0, -1).join('/');
                docId = segments[segments.length - 1];
              }
            } else if (typeof ref.path === 'string') {
              const pathParts = ref.path.split('/');
              console.log(`[DEV MOCK] Transaction update path parts:`, pathParts);
              if (pathParts.length >= 2) {
                collectionPath = pathParts.slice(0, -1).join('/');
                docId = pathParts[pathParts.length - 1];
              }
            } else if (ref._collection) {
              // For document references from collection().doc() calls
              collectionPath = ref._collection;
              console.log(`[DEV MOCK] Using _collection property: ${collectionPath}`);
            } else {
              // For document references without path, assume direct collection access
              // Since ref has collection method, this is likely a document reference
              collectionPath = 'communityPosts'; // Default for this app
              console.log(`[DEV MOCK] Using default collection path: ${collectionPath}`);
            }
            
            console.log(`[DEV MOCK] Transaction update extracted path: ${collectionPath}/${docId}`);
            
            if (mockStorage[collectionPath] && mockStorage[collectionPath][docId]) {
              const currentData = mockStorage[collectionPath][docId];
              console.log(`[DEV MOCK] Transaction update current data:`, currentData);
              const processedData = { ...data };
              
              // Process each field
              Object.keys(processedData).forEach(key => {
                console.log(`[DEV MOCK] Transaction processing key ${key}:`, processedData[key]);
                
                // Handle ServerTimestamp
                if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'ServerTimestampTransform') {
                  processedData[key] = new Date();
                  console.log(`[DEV MOCK] Transaction set ${key} to server timestamp`);
                }
                // Handle FieldValue.increment
                else if (processedData[key] && processedData[key].constructor && processedData[key].constructor.name === 'NumericIncrementTransform') {
                  const incrementValue = processedData[key].operand || 0;
                  
                  // Get current value, handling case where it might be a FieldValue object
                  let currentValue = currentData[key] || 0;
                  
                  // If the current value is a FieldValue object, treat it as 0
                  if (currentValue && typeof currentValue === 'object' && currentValue.constructor && currentValue.constructor.name === 'NumericIncrementTransform') {
                    currentValue = 0;
                  }
                  
                  // Ensure currentValue is a number
                  if (typeof currentValue !== 'number') {
                    currentValue = 0;
                  }
                  
                  processedData[key] = currentValue + incrementValue;
                  console.log(`[DEV MOCK] Transaction incremented ${key} from ${currentValue} to ${processedData[key]}`);
                }
              });
              
              mockStorage[collectionPath][docId] = {
                ...currentData,
                ...processedData,
                updatedAt: processedData.updatedAt || new Date()
              };
              
              console.log(`[DEV MOCK] Transaction updated ${collectionPath}/${docId}:`, mockStorage[collectionPath][docId]);
            } else {
              console.log(`[DEV MOCK] Transaction update document not found: ${collectionPath}/${docId}`);
            }
          },
          delete: (ref: any) => {
            // Mock transaction delete operation
            console.log(`[DEV MOCK] Transaction delete:`, ref);
            if (ref.collection && mockStorage[ref.collection] && mockStorage[ref.collection][ref.id]) {
              delete mockStorage[ref.collection][ref.id];
            }
          }
        };
        
        return updateFunction(transaction);
      }
    }),
    auth: () => ({
      createUser: async (properties: any) => {
        console.log('[DEV MOCK] Creating user:', properties);
        return Promise.resolve({ uid: 'mock-uid-' + Math.random().toString(36).substring(7) });
      },
      getUser: async (uid: string) => {
        console.log('[DEV MOCK] Getting user:', uid);
        // Return specific user for CEO
        if (uid === 'ceo-user-id') {
          return Promise.resolve({ 
            uid, 
            email: 'ceo@innerspell.com',
            displayName: 'CEO',
            metadata: {
              creationTime: new Date('2024-01-01').toISOString(),
              lastSignInTime: new Date().toISOString()
            }
          });
        }
        // Return admin email for testing
        if (uid === 'admin-user-id') {
          return Promise.resolve({ 
            uid, 
            email: 'admin@innerspell.com',
            displayName: 'Admin',
            metadata: {
              creationTime: new Date('2024-01-15').toISOString(),
              lastSignInTime: new Date().toISOString()
            }
          });
        }
        // Return junsupark email for testing
        if (uid === 'junsupark-user-id') {
          return Promise.resolve({ 
            uid, 
            email: 'junsupark9999@gmail.com',
            displayName: 'Jun Su Park',
            metadata: {
              creationTime: new Date('2024-01-10').toISOString(),
              lastSignInTime: new Date().toISOString()
            }
          });
        }
        // Default user for any other UID
        return Promise.resolve({ 
          uid, 
          email: 'user@example.com',
          displayName: 'Test User',
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          }
        });
      },
      updateUser: async (uid: string, properties: any) => {
        console.log('[DEV MOCK] Updating user:', uid, properties);
        return Promise.resolve({ uid, ...properties });
      },
      listUsers: async (maxResults?: number, pageToken?: string) => {
        console.log('[DEV MOCK] Listing users:', { maxResults, pageToken });
        const mockUsers = [
          {
            uid: 'ceo-user-id',
            email: 'ceo@innerspell.com',
            displayName: 'CEO',
            emailVerified: true,
            metadata: {
              creationTime: new Date('2024-01-01').toISOString(),
              lastSignInTime: new Date().toISOString()
            }
          },
          {
            uid: 'admin-user-id',
            email: 'admin@innerspell.com',
            displayName: 'Admin',
            emailVerified: true,
            metadata: {
              creationTime: new Date('2024-01-15').toISOString(),
              lastSignInTime: new Date().toISOString()
            }
          },
          {
            uid: 'junsupark-user-id',
            email: 'junsupark9999@gmail.com',
            displayName: 'Jun Su Park',
            emailVerified: true,
            metadata: {
              creationTime: new Date('2024-01-10').toISOString(),
              lastSignInTime: new Date().toISOString()
            }
          },
          {
            uid: 'test-user-1',
            email: 'user1@example.com',
            displayName: 'Test User 1',
            emailVerified: true,
            metadata: {
              creationTime: new Date('2024-02-01').toISOString(),
              lastSignInTime: new Date().toISOString()
            }
          },
          {
            uid: 'test-user-2',
            email: 'user2@example.com',
            displayName: 'Test User 2',
            emailVerified: false,
            metadata: {
              creationTime: new Date('2024-02-15').toISOString(),
              lastSignInTime: new Date('2024-02-20').toISOString()
            }
          }
        ];
        return Promise.resolve({
          users: mockUsers.slice(0, maxResults || 10),
          pageToken: undefined
        });
      }
    })
  } as any;

  // Initialize test data if storage is empty
  if (Object.keys(mockStorage).length === 0) {
    // Add test posts
    mockStorage.communityPosts = {
      'test-post-1': {
        id: 'test-post-1',
        title: '첫 번째 테스트 글입니다',
        content: '아코디언 형태로 댓글이 잘 보이는지 테스트해보세요!',
        category: 'free-discussion',
        authorId: 'junsupark-user-id',
        authorName: 'Jun Su Park',
        authorPhotoURL: '',
        imageUrl: null,
        viewCount: 15,
        commentCount: 2,
        createdAt: new Date('2024-07-17'),
        updatedAt: new Date('2024-07-17')
      },
      'test-post-2': {
        id: 'test-post-2',
        title: '두 번째 테스트 글 - 비밀 댓글 기능',
        content: '비밀 댓글 기능이 잘 작동하는지 확인해보세요. 작성자와 글 작성자만 볼 수 있습니다.',
        category: 'free-discussion',
        authorId: 'admin-user-id',
        authorName: 'Admin',
        authorPhotoURL: '',
        imageUrl: null,
        viewCount: 8,
        commentCount: 3,
        createdAt: new Date('2024-07-18'),
        updatedAt: new Date('2024-07-18')
      }
    };

    // Add test comments
    mockStorage['communityPosts/test-post-1/comments'] = {
      'comment-1': {
        id: 'comment-1',
        postId: 'test-post-1',
        authorId: 'admin-user-id',
        authorName: 'Admin',
        authorPhotoURL: '',
        content: '첫 번째 댓글입니다!',
        isSecret: false,
        createdAt: new Date('2024-07-17'),
        updatedAt: new Date('2024-07-17')
      },
      'comment-2': {
        id: 'comment-2',
        postId: 'test-post-1',
        authorId: 'ceo-user-id',
        authorName: 'CEO',
        authorPhotoURL: '',
        content: '두 번째 댓글입니다!',
        isSecret: false,
        createdAt: new Date('2024-07-17'),
        updatedAt: new Date('2024-07-17')
      }
    };

    mockStorage['communityPosts/test-post-2/comments'] = {
      'comment-3': {
        id: 'comment-3',
        postId: 'test-post-2',
        authorId: 'junsupark-user-id',
        authorName: 'Jun Su Park',
        authorPhotoURL: '',
        content: '일반 댓글입니다.',
        isSecret: false,
        createdAt: new Date('2024-07-18'),
        updatedAt: new Date('2024-07-18')
      },
      'comment-4': {
        id: 'comment-4',
        postId: 'test-post-2',
        authorId: 'admin-user-id',
        authorName: 'Admin',
        authorPhotoURL: '',
        content: '이것은 비밀 댓글입니다. 글 작성자와 댓글 작성자만 볼 수 있습니다.',
        isSecret: true,
        createdAt: new Date('2024-07-18'),
        updatedAt: new Date('2024-07-18')
      },
      'comment-5': {
        id: 'comment-5',
        postId: 'test-post-2',
        authorId: 'ceo-user-id',
        authorName: 'CEO',
        authorPhotoURL: '',
        content: '또 다른 비밀 댓글입니다.',
        isSecret: true,
        createdAt: new Date('2024-07-18'),
        updatedAt: new Date('2024-07-18')
      }
    };

    // Add test tarot readings for different users
    mockStorage.userReadings = {
      'test-reading-1': {
        id: 'test-reading-1',
        userId: 'mock-google-user-id', // Google 로그인 사용자 UID (수정됨)
        question: '테스트: Google 사용자의 타로 리딩',
        spreadName: '삼위일체 조망 (Trinity View)',
        spreadNumCards: 3,
        drawnCards: [
          { id: 'major-0', isReversed: false, position: '과거' },
          { id: 'major-1', isReversed: true, position: '현재' },
          { id: 'major-2', isReversed: false, position: '미래' }
        ],
        interpretationText: 'Google 사용자를 위한 테스트 타로 리딩 해석입니다.',
        createdAt: new Date('2025-07-18T10:00:00'),
        updatedAt: new Date('2025-07-18T10:00:00')
      },
      'test-reading-2': {
        id: 'test-reading-2',
        userId: 'mock-test-user-id', // 이전 Mock 사용자 UID
        question: '테스트: Mock 사용자의 타로 리딩',
        spreadName: '켈틱 크로스 (Celtic Cross)',
        spreadNumCards: 10,
        drawnCards: [
          { id: 'wands-1', isReversed: false, position: '현재 상황' },
          { id: 'cups-2', isReversed: true, position: '도전/교차' },
          { id: 'swords-3', isReversed: false, position: '먼 과거' }
        ],
        interpretationText: 'Mock 사용자를 위한 테스트 타로 리딩 해석입니다.',
        createdAt: new Date('2025-07-17T15:30:00'),
        updatedAt: new Date('2025-07-17T15:30:00')
      }
    };
    
    console.log('🔧 Test data initialized in mock storage');
  }

  // Use the mock in development
  (global as any).mockFirebaseAdmin = mockAdmin;
  (global as any).mockStorage = mockStorage;
  console.log('🔧 Using mock Firebase Admin SDK for development (UPDATED)');
} else {
  // Production or when credentials are available
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'innerspell-an7ce',
      });
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw error;
    }
  }
}

// Get the appropriate instance based on environment
const firestore = process.env.NODE_ENV === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? (global as any).mockFirebaseAdmin?.firestore()
  : admin.firestore();

const exportedAdmin = process.env.NODE_ENV === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? (global as any).mockFirebaseAdmin
  : admin;

// Export FieldValue for use in server actions
const FieldValue = process.env.NODE_ENV === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? (global as any).mockFirebaseAdmin?.firestore()?.FieldValue
  : admin.firestore.FieldValue;

// Initialize admin function for API routes
export function initAdmin() {
  // In development without credentials, this is a no-op as the mock is already initialized
  if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return;
  }
  
  // In production, admin is already initialized above
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized');
  }
}

// Export db alias for firestore compatibility
const db = firestore;

export { exportedAdmin as admin, firestore, db, FieldValue };