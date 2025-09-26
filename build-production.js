const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build optimization...');

// Set production environment variables
process.env.NODE_ENV = 'production';
process.env.GENERATE_SOURCEMAP = 'false';
process.env.INLINE_RUNTIME_CHUNK = 'false';

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true, force: true });
  }

  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Optimize build files
  console.log('⚡ Optimizing build files...');
  
  // Read and optimize index.html
  const indexPath = path.join('build', 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Add performance optimizations
    indexContent = indexContent.replace(
      '<head>',
      `<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#3b82f6">
    <meta name="description" content="AI-powered agriculture platform for smart farming">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
    );
    
    fs.writeFileSync(indexPath, indexContent);
  }

  // Create robots.txt
  const robotsContent = `User-agent: *
Allow: /

Sitemap: https://agriculture-frontend-two.vercel.app/sitemap.xml`;
  fs.writeFileSync(path.join('build', 'robots.txt'), robotsContent);

  // Create sitemap.xml
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://agriculture-frontend-two.vercel.app/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://agriculture-frontend-two.vercel.app/login</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://agriculture-frontend-two.vercel.app/register</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  fs.writeFileSync(path.join('build', 'sitemap.xml'), sitemapContent);

  console.log('✅ Production build completed successfully!');
  console.log('📦 Build files optimized and ready for deployment');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}