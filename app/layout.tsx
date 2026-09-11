import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'SparkAgent — Sign in', description: 'Sign in to SparkAgent' }
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html> }
