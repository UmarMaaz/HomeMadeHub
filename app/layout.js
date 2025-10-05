import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationProvider } from '../contexts/NotificationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Homemade Hub - Buy & Sell Food',
  description: 'A platform for buying and selling homemade food',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
              {children}
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}