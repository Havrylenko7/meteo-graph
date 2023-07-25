import './globals.scss'

export const metadata = {
  title: 'Meteo App',
  description: 'Meteo App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
