import { NextRequest, NextResponse } from 'next/server';

// Backend API URL - will be replaced during deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * API route handler for track identification from URL
 */
export async function POST(request: NextRequest) {
  try {
    // Get JSON data
    const data = await request.json();
    
    // Forward the request to the backend
    const response = await fetch(`${API_URL}/api/identify-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // Get the response from the backend
    const responseData = await response.json();
    
    // Return the response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json(
      { success: false, error: 'Error processing URL' },
      { status: 500 }
    );
  }
}
