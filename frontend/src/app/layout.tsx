import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Arthrex AI — Learn AI Skills | Agentic AI, GenAI, Data Science',
  description: 'Master Agentic AI, Generative AI, Data Science, and more with industry-aligned courses, live classes, and free masterclasses from Arthrex AI.',
  keywords: 'Agentic AI, Generative AI, Data Science, LangChain, LangGraph, RAG, Machine Learning, AI courses',
  authors: [{ name: 'InTrainTech' }],
  openGraph: {
    title: 'Arthrex AI — Learn AI Skills',
    description: 'Top AI skill platform — Agentic AI, GenAI, Data Science & more.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
