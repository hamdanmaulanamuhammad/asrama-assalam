import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

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

    // Generate unique filename
    const fileName = `${Date.now()}.jpg`;
    
    // Save to public/uploads directory
    const path = join(process.cwd(), 'public', 'uploads', fileName);
    await writeFile(path, processedImage);

    // Return the public URL
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
