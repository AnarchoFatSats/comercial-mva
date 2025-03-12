# Commercial MVA Claims

A landing page for commercial motor vehicle accident claims. This website helps users determine if they qualify for compensation after being involved in a commercial vehicle accident through an interactive questionnaire.

## Features

- Interactive multi-step qualification form
- Mobile-responsive design
- Testimonials section
- FAQ section
- Trust indicators

## Project Structure # comercial-mva

## Setup Instructions

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/contentkingpins/comercial-mva.git
   cd comercial-mva
   ```

2. Run the setup script to create necessary directories:
   ```
   chmod +x setup.sh
   ./setup.sh
   ```

3. Replace placeholder images with actual content in the `assets/images` directory.

### Hero Video Setup

The hero section requires a background video. You have two options:

#### Option 1: Local Storage (Development Only)
1. Create a videos directory:
   ```
   mkdir -p assets/videos
   ```
2. Add your video file as `assets/videos/hero-background.mp4`
3. Update the video source in `index.html` to point to the local file:
   ```html
   <source src="assets/videos/hero-background.mp4" type="video/mp4">
   ```

#### Option 2: AWS S3 (Recommended for Production)
1. Upload your video to an S3 bucket:
   ```
   aws s3 cp path/to/your/video.mp4 s3://YOUR-BUCKET-NAME/videos/hero-background.mp4
   ```
2. Make the video publicly accessible:
   ```
   aws s3api put-object-acl --bucket YOUR-BUCKET-NAME --key videos/hero-background.mp4 --acl public-read
   ```
3. Update the video source in `index.html`:
   ```html
   <source src="https://YOUR-BUCKET-NAME.s3.amazonaws.com/videos/hero-background.mp4" type="video/mp4">
   ```

### AWS Amplify Setup

1. Replace placeholder values in `aws-exports.js` with your actual AWS resource IDs.
2. Update the API endpoint in `js/form-api.js`.
3. Deploy to AWS Amplify:
   ```
   amplify publish
   ```

## Video Requirements

- Format: MP4
- Resolution: 1920x1080 (minimum)
- Duration: 10-30 seconds (will loop)
- Size: Keep under 5MB for fast loading
- Content: Commercial vehicle accident footage (no injuries shown)

## Best Practices for Video

1. **Compression**: Use a tool like HandBrake to compress your video while maintaining quality
2. **Format**: Provide multiple formats (MP4, WebM) for better browser compatibility
3. **Fallback**: Ensure a static image fallback is available for browsers that don't support video

## Deployment

This project is configured for deployment with AWS Amplify. Follow the AWS Amplify setup instructions above to deploy.
