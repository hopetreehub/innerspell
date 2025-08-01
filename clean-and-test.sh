#!/bin/bash

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "✅ Cache cleaned. Please restart the dev server:"
echo "   npm run dev"
echo ""
echo "Then run the test in another terminal:"
echo "   node final-image-test.js"