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

### Current Image Implementation

The site currently uses online placeholder images for faster development:

1. **Hero Background**: Unsplash image
   - URL: `https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7`
   - Defined in: `css/styles.css`

2. **Testimonial Photos**: Random User API
   - URLs: `https://randomuser.me/api/portraits/...`
   - Defined in: `index.html`

3. **Partner Logos**: Placeholder.co
   - URLs: `https://placehold.co/200x60/...`
   - Defined in: `index.html`

### Replacing with Your Own Images

When you're ready to use your own images:

1. Create the appropriate directories:
   ```
   mkdir -p assets/images/testimonials assets/images/partner-logos
   ```

2. Add your images to these directories

3. Update the image paths in the HTML and CSS files:
   - For hero: Update `background-image` in `css/styles.css`
   - For testimonials and logos: Update `data-src` attributes in `index.html`

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
