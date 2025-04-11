import { NextRequest, NextResponse } from 'next/server';

// Backend API URL - will be replaced during deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * API route handler for track identification from file upload
 */
export async function POST(request) {
  try {
    // Get form data
    const formData = await request.formData();
    
    // Create a new FormData object to forward to the backend
    const forwardFormData = new FormData();
    
    // Copy all fields from the original form data
    for (const [key, value] of formData.entries()) {
      forwardFormData.append(key, value);
    }
    
    // Forward the request to the backend
    const response = await fetch(`${API_URL}/api/identify`, {
      method: 'POST',
      body: forwardFormData,
    });
    
    // Get the response from the backend
    const responseData = await response.json();
    
    // Return the response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { success: false, error: 'Error processing file' },
      { status: 500 }
    );
  }
}
