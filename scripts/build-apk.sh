#!/bin/bash

echo "🚀 Building FarmCart Android APK..."

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build web assets
echo "📦 Building web assets..."
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Build APK
echo "🏗️ Building Android APK..."
cd android

# Build debug APK
echo "Building debug APK..."
./gradlew assembleDebug

# Build release APK (if keystore exists)
if [ -f "app/farmcart-keystore.jks" ]; then
    echo "Building signed release APK..."
    ./gradlew assembleRelease
else
    echo "⚠️ No keystore found. Run ./scripts/generate-keystore.sh to create one for release builds."
fi

cd ..

echo "✅ Build complete!"
echo ""
echo "📱 APK Locations:"
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "🐛 Debug APK: android/app/build/outputs/apk/debug/app-debug.apk"
fi

if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    echo "🚀 Release APK: android/app/build/outputs/apk/release/app-release.apk"
fi

echo ""
echo "📲 Installation Instructions:"
echo "1. Transfer APK to your Android device"
echo "2. Enable 'Install from unknown sources' in Settings"
echo "3. Tap the APK file to install"
echo "4. Launch FarmCart!"