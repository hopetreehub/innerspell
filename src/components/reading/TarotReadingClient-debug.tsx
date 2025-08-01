// Debug version with console logs to track the issue
// This is a copy of TarotReadingClient.tsx with added debugging

// Add this at the top of your component or replace the existing handleShuffle function
const handleShuffleDebug = async () => {
  console.log('[DEBUG] Shuffle started, current stage:', stage);
  console.log('[DEBUG] isShufflingAnimationActive:', isShufflingAnimationActive);
  
  if (isShufflingAnimationActive) {
    console.log('[DEBUG] Shuffle already in progress, returning');
    return;
  }

  console.log('[DEBUG] Setting shuffle states...');
  setIsShufflingAnimationActive(true);
  setStage('shuffling');
  setReadingJustSaved(false);
  setIsSharingReading(false);
  setRevealedSpreadCards([]);
  setSelectedCardsForReading([]);
  setInterpretation('');
  setDisplayedInterpretation('');
  setIsInterpretationDialogOpen(false);

  console.log('[DEBUG] Starting shuffle animations...');
  
  // ... (animation code remains the same) ...
  
  // After all animations complete:
  console.log('[DEBUG] Shuffle animations complete, setting final state...');
  
  // Add a small delay to ensure state updates propagate
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Set the deck
  const useOptimized = shouldUseOptimizedImages();
  const optimizedCards = getCardsWithOptimizedImages(allCards, useOptimized);
  setDeck([...optimizedCards].sort(() => 0.5 - Math.random()));
  
  // Set stage and animation state together
  console.log('[DEBUG] Setting stage to shuffled and animation to false');
  setStage('shuffled');
  setIsShufflingAnimationActive(false);
  
  // Verify the state after a brief delay
  setTimeout(() => {
    console.log('[DEBUG] Post-shuffle verification:');
    console.log('[DEBUG] - Current stage should be "shuffled"');
    console.log('[DEBUG] - isShufflingAnimationActive should be false');
    console.log('[DEBUG] - Spread button should now be enabled');
  }, 500);
  
  // ... (rest of the code remains the same) ...
};

// Also add debugging to the spread button render:
console.log('[DEBUG] Spread button render check:', {
  stage,
  isShufflingAnimationActive,
  buttonShouldBeDisabled: isShufflingAnimationActive || stage !== 'shuffled'
});