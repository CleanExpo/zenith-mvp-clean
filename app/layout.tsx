export const metadata = {
  title: 'Zenith MVP',
  description: 'Minimal Viable Product for Zenith Platform',
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