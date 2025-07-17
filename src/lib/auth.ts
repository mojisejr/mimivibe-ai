import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export interface AuthenticatedUser {
  userId: string
}

export function getAuthenticatedUser(): AuthenticatedUser | null {
  const { userId } = auth()
  
  if (!userId) {
    return null
  }
  
  return { userId }
}

export function createAuthErrorResponse(path: string) {
  return NextResponse.json(
    { 
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
      timestamp: new Date().toISOString(),
      path
    }, 
    { status: 401 }
  )
}

export function createErrorResponse(
  error: string, 
  message: string, 
  path: string, 
  status: number = 500,
  code?: string
) {
  return NextResponse.json(
    { 
      success: false,
      error,
      message,
      code,
      timestamp: new Date().toISOString(),
      path
    }, 
    { status }
  )
}