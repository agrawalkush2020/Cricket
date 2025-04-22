import '../styles/globals.css';

export const metadata = {
  title: 'Cricket Scoring App',
  description: 'Admin Panel for Live Scoring',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
