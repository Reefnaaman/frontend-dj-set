import { NextRequest, NextResponse } from 'next/server';

// Backend API URL - will be replaced during deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * API route handler for downloading files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId;
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'No file ID provided' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const response = await fetch(`${API_URL}/api/download/${fileId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: errorData.error || 'Error downloading file' },
        { status: response.status }
      );
    }
    
    // Get the file data
    const fileData = await response.arrayBuffer();
    
    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || 'attachment';
    
    // Return the file
    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { success: false, error: 'Error downloading file' },
      { status: 500 }
    );
  }
}
