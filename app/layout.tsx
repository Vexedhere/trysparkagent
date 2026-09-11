import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SparkAgent — Your intelligent AI workspace',
  description: 'Sign in to SparkAgent and continue your AI workspace.',
  metadataBase: new URL('https://try.sparkagent.in.net'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
