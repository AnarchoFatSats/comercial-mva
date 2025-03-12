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

### Hero Image Setup

The hero section requires a background image:

1. Add your image file as `assets/images/hero-background.jpg`
2. For best results, use an image that:
   - Has a resolution of at least 1920x1080 pixels
   - Is optimized for web (under 300KB)
   - Shows a commercial vehicle accident scene (without injuries)
   - Has good contrast for text overlay

### AWS Amplify Setup

1. Replace placeholder values in `aws-exports.js` with your actual AWS resource IDs.
2. Update the API endpoint in `js/form-api.js`.
3. Deploy to AWS Amplify:
   ```
   amplify publish
   ```

## Image Optimization

For the best performance, optimize all images before adding them to the project:

1. **Compression**: Use tools like TinyPNG, Squoosh, or ImageOptim
2. **Format**: Consider using WebP format for better compression (with JPG fallback)
3. **Dimensions**: Resize images to the exact dimensions needed
4. **Lazy Loading**: The site uses lazy loading for images below the fold

### Performance Benefits of Static Hero Image

Using a static image for the hero section instead of a video provides several performance advantages:

1. **Faster Page Load**: Static images load much faster than videos
2. **Lower Bandwidth Usage**: Images typically use 10-20x less bandwidth than videos
3. **Better Mobile Experience**: Less battery drain and data usage on mobile devices
4. **Improved Core Web Vitals**: Better Largest Contentful Paint (LCP) scores
5. **Universal Compatibility**: Works on all browsers and devices without fallback concerns

## Deployment

This project is configured for deployment with AWS Amplify. Follow the AWS Amplify setup instructions above to deploy.
