import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dpocflacv',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get current timestamp for watermark
    const now = new Date();
    const timestamp = now.toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'Asia/Jakarta'
    });

    // Get image metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const { width = 1000, height = 1000 } = metadata;

    // Create watermark text as SVG
    const fontSize = Math.max(Math.floor(width / 25), 20);
    const padding = Math.floor(fontSize * 0.8);
    
    const svgText = `
      <svg width="${width}" height="${height}">
        <rect x="0" y="${height - fontSize - padding * 2}" width="${width}" height="${fontSize + padding * 2}" fill="rgba(0, 0, 0, 0.6)" />
        <text x="${padding}" y="${height - padding}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">
          ${timestamp}
        </text>
      </svg>
    `;

    // Add watermark and process image
    const processedImage = await image
      .composite([{
        input: Buffer.from(svgText),
        gravity: 'southwest'
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'presensi-assalam',
          resource_type: 'image',
          format: 'jpg',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        }
      );
      uploadStream.end(processedImage);
    });

    return NextResponse.json({ 
      success: true, 
      url: uploadResult.secure_url 
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
