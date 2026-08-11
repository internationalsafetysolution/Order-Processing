import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

function formatKarachiDate() {
  const options = { timeZone: 'Asia/Karachi', day: '2-digit', month: 'short', year: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-GB', options);
  return formatter.format(new Date()).replace(/ /g, '-');
}

function sanitizeName(str) {
  if (!str) return '';
  return str.replace(/[\\/:*?"<>|#]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    let docType = (formData.get('docType') || formData.get('category') || 'PO').trim();
    let orderNo = (formData.get('orderNo') || formData.get('orderId') || '').toString().trim();
    let clientName = (formData.get('clientName') || '').toString().trim();
    let customDate = (formData.get('date') || '').toString().trim();

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Normalize docType into 3 subfolders: PO, DC, Invoice
    let subFolder = 'PO';
    if (docType.toUpperCase() === 'DC' || docType.toLowerCase().includes('challan')) {
      subFolder = 'DC';
      docType = 'DC';
    } else if (docType.toUpperCase() === 'INVOICE' || docType.toLowerCase().includes('invoice')) {
      subFolder = 'Invoice';
      docType = 'Invoice';
    } else {
      subFolder = 'PO';
      docType = 'PO';
    }

    const cleanClient = sanitizeName(clientName) || 'Client';
    
    let formattedOrder = 'Order';
    if (orderNo) {
      const cleanOrderNo = sanitizeName(orderNo).replace(/^Order\s*#?/i, '');
      formattedOrder = `Order ${cleanOrderNo}`;
    }

    const dateStr = customDate ? sanitizeName(customDate) : formatKarachiDate();

    // Determine file extension
    let ext = path.extname(file.name);
    if (!ext) {
      if (file.type === 'image/webp') ext = '.webp';
      else if (file.type === 'image/png') ext = '.png';
      else if (file.type === 'image/jpeg') ext = '.jpg';
      else if (file.type === 'application/pdf') ext = '.pdf';
      else ext = '.bin';
    }

    // Target directory: public/uploads/[PO|DC|Invoice]
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
    await mkdir(uploadDir, { recursive: true });

    // Base filename pattern: Order No - Client Name - Date - (PO/DC/Invoice)
    const baseName = `${formattedOrder} - ${cleanClient} - ${dateStr} - ${docType}`;
    
    let filename = `${baseName}${ext}`;
    let filePath = path.join(uploadDir, filename);
    let counter = 1;

    // Append counter suffix if file with exact same name already exists
    while (existsSync(filePath)) {
      filename = `${baseName} - ${counter}${ext}`;
      filePath = path.join(uploadDir, filename);
      counter++;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/${subFolder}/${filename}`;

    return Response.json({ 
      success: true, 
      filePath: publicPath 
    });
  } catch (error) {
    console.error('File upload error:', error);
    return Response.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
