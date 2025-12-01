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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta'
    });

    // Get image metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1000;
    const height = metadata.height || 1000;

    // Calculate dimensions for watermark
    const fontSize = Math.max(Math.floor(width / 30), 16);
    const padding = Math.floor(fontSize * 1);
    const boxHeight = fontSize + padding * 2;

    // Create watermark background and text as SVG
    const svgOverlay = `
      <svg width="${width}" height="${height}">
        <rect 
          x="0" 
          y="${height - boxHeight}" 
          width="${width}" 
          height="${boxHeight}" 
          fill="rgba(0, 0, 0, 0.7)" 
        />
        <text 
          x="${padding}" 
          y="${height - padding - fontSize / 4}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold" 
          fill="white"
          style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);"
        >${timestamp}</text>
      </svg>
    `;

    // Add watermark and process image
    const processedImage = await image
      .composite([{
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
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
