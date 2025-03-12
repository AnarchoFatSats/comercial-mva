#!/bin/bash

# Create directory structure
mkdir -p css js assets/images/partner-logos assets/images/testimonials

# Create empty files
touch favicon.ico
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

# Instructions for uploading video to S3
echo ""
echo "=== INSTRUCTIONS FOR UPLOADING HERO VIDEO TO AWS S3 ==="
echo "1. Install AWS CLI if not already installed:"
echo "   brew install awscli  # For macOS"
echo "   aws configure        # Set up your AWS credentials"
echo ""
echo "2. Create an S3 bucket (if not already created):"
echo "   aws s3 mb s3://YOUR-BUCKET-NAME"
echo ""
echo "3. Upload your hero video to S3:"
echo "   aws s3 cp path/to/your/hero-video.mp4 s3://YOUR-BUCKET-NAME/videos/hero-background.mp4"
echo ""
echo "4. Make the video publicly accessible:"
echo "   aws s3api put-object-acl --bucket YOUR-BUCKET-NAME --key videos/hero-background.mp4 --acl public-read"
echo ""
echo "5. Update the video source in index.html to point to your S3 URL:"
echo "   https://YOUR-BUCKET-NAME.s3.amazonaws.com/videos/hero-background.mp4"
echo ""
echo "Note: For production, consider using CloudFront for better performance."
echo "===================================================" 