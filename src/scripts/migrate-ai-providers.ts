#!/usr/bin/env node
'use server';

/**
 * Migration script to move AI provider data from 'aiProviders' to 'aiProviderConfigs' collection
 * This ensures consistency across the application
 */

import { firestore } from '@/lib/firebase/admin';

async function migrateAIProviders() {
  console.log('Starting AI Provider migration...');
  
  try {
    // Check if old collection exists and has data
    const oldSnapshot = await firestore.collection('aiProviders').get();
    
    if (oldSnapshot.empty) {
      console.log('No data in old aiProviders collection to migrate.');
    } else {
      console.log(`Found ${oldSnapshot.size} documents to migrate.`);
      
      // Migrate each document
      for (const doc of oldSnapshot.docs) {
        const data = doc.data();
        const providerId = doc.id;
        
        console.log(`Migrating provider: ${providerId}`);
        
        // Check if document already exists in new collection
        const newDocRef = firestore.collection('aiProviderConfigs').doc(providerId);
        const newDoc = await newDocRef.get();
        
        if (newDoc.exists) {
          console.log(`Provider ${providerId} already exists in new collection. Skipping...`);
          continue;
        }
        
        // Copy to new collection
        await newDocRef.set(data);
        console.log(`Successfully migrated provider: ${providerId}`);
      }
      
      console.log('Migration completed successfully!');
      
      // Optional: Ask before deleting old data
      console.log('\nOld data is still in aiProviders collection.');
      console.log('You can manually delete it after verifying the migration.');
    }
    
    // Also check if new collection has any data
    const newSnapshot = await firestore.collection('aiProviderConfigs').get();
    console.log(`\nNew collection (aiProviderConfigs) now has ${newSnapshot.size} documents.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateAIProviders()
    .then(() => {
      console.log('Migration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateAIProviders };