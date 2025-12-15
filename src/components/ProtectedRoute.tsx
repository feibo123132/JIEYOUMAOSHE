import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ element }: { element: React.ReactElement }) {
  const authed = !!localStorage.getItem('tcb_auth')
  return authed ? element : <Navigate to="/login" replace />
}

