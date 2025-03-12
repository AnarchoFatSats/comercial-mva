#!/bin/bash

# Create directory structure
mkdir -p css js assets/images/partner-logos assets/images/testimonials

# Create empty files
touch favicon.ico
touch assets/images/hero-background.jpg
touch assets/images/logo.png
touch assets/images/partner-logos/law-firm-1.png
touch assets/images/partner-logos/law-firm-2.png
touch assets/images/partner-logos/law-firm-3.png
touch assets/images/testimonials/testimonial-1.jpg
touch assets/images/testimonials/testimonial-2.jpg

# Copy README to assets folder
cp README.md assets/

echo "Project structure created successfully!"
echo "Don't forget to replace placeholder files with actual content."

# Instructions for hero image
echo ""
echo "=== INSTRUCTIONS FOR HERO IMAGE ==="
echo "1. Replace the placeholder hero image with your actual image:"
echo "   assets/images/hero-background.jpg"
echo ""
echo "2. Recommended hero image specifications:"
echo "   - Resolution: 1920x1080 pixels (minimum)"
echo "   - Format: JPG or WebP (for better compression)"
echo "   - Size: Keep under 300KB for fast loading"
echo "   - Content: Commercial vehicle accident scene (no injuries shown)"
echo ""
echo "3. Image optimization tools:"
echo "   - TinyPNG (https://tinypng.com)"
echo "   - Squoosh (https://squoosh.app)"
echo "   - ImageOptim (https://imageoptim.com)"
echo "===================================================" 