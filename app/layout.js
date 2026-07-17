import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'LearnMax.ai — Personalized AI Learning',
  description: 'A dynamic multi-agent AI platform that generates personalized lessons, quizzes and flashcards on any topic.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
