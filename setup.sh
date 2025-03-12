#!/bin/bash

# Create directory structure
mkdir -p css js assets/videos assets/images/partner-logos assets/images/testimonials

# Create empty files
touch favicon.ico
touch assets/videos/hero-background.mp4
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