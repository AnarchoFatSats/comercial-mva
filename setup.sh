#!/bin/bash

# Create directory structure
mkdir -p css js assets/images

# Create empty files
touch favicon.ico

# Copy README to assets folder
cp README.md assets/

echo "Project structure created successfully!"

# Instructions for hero image
echo ""
echo "=== INSTRUCTIONS FOR IMAGES ==="
echo "The site is currently using online placeholder images:"
echo ""
echo "1. Hero background: Unsplash image"
echo "   - When ready to replace, add your image to assets/images/hero-background.jpg"
echo "   - Then update css/styles.css to use the local path"
echo ""
echo "2. Testimonial photos: Random user API"
echo "   - When ready to replace, add your images to assets/images/testimonials/"
echo "   - Then update the img src attributes in index.html"
echo ""
echo "3. Partner logos: Placeholder.co"
echo "   - When ready to replace, add your logos to assets/images/partner-logos/"
echo "   - Then update the img src attributes in index.html"
echo ""
echo "4. Recommended image specifications:"
echo "   - Hero: 1920x1080 pixels, JPG or WebP format, under 300KB"
echo "   - Testimonials: 80x80 pixels, square aspect ratio"
echo "   - Logos: 200x60 pixels, transparent PNG background"
echo ""
echo "5. Image optimization tools:"
echo "   - TinyPNG (https://tinypng.com)"
echo "   - Squoosh (https://squoosh.app)"
echo "   - ImageOptim (https://imageoptim.com)"
echo "===================================================" 