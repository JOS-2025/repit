#!/bin/bash

# Generate Android Keystore for FarmCart APK Signing
# Run this script to create a signing key for your APK

echo "🔐 Generating Android Keystore for FarmCart..."

# Create keystore directory
mkdir -p android/app

# Generate keystore
keytool -genkey -v \
  -keystore android/app/farmcart-keystore.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias farmcartkey \
  -dname "CN=FarmCart,OU=FarmCart,O=FarmCart,L=City,ST=State,C=US" \
  -storepass "FarmCart2025!" \
  -keypass "farmcart2025!"

echo "✅ Keystore generated at: android/app/farmcart-keystore.jks"
echo "🔑 Alias: farmcartkey"
echo "🔒 Store Password: FarmCart2025!"
echo "🔒 Key Password: farmcart2025!"

# Create signing config
cat > android/app/signing.gradle << 'EOF'
android {
    signingConfigs {
        release {
            if (project.hasProperty('FARMCART_UPLOAD_STORE_FILE')) {
                storeFile file(FARMCART_UPLOAD_STORE_FILE)
                storePassword FARMCART_UPLOAD_STORE_PASSWORD
                keyAlias FARMCART_UPLOAD_KEY_ALIAS
                keyPassword FARMCART_UPLOAD_KEY_PASSWORD
            } else {
                storeFile file('farmcart-keystore.jks')
                storePassword 'FarmCart2025!'
                keyAlias 'farmcartkey'
                keyPassword 'farmcart2025!'
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
EOF

echo "✅ Signing configuration created!"
echo "🚀 Ready to build signed APK!"