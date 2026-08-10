import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe, unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Target directory: public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    const publicPath = `/uploads/${filename}`;
    
    return Response.json({ 
      success: true, 
      filePath: publicPath 
    });
  } catch (error) {
    console.error('File upload error:', error);
    return Response.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
