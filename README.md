# Quizify

Quizify is an AI-powered web application built with [Next.js](https://nextjs.org/) that helps you generate quizzes automatically from PDF documents. It utilizes the Gemini API (`@google/generative-ai`) to extract text from PDFs and intelligently create engaging questions.

## Features

- **Upload PDFs**: Easily upload your study materials or document files.
- **AI Quiz Generation**: Automatically parses text from PDFs and generates related quiz questions using Google's Gemini AI.
- **Interactive Quiz UI**: Take the generated quizzes in an interactive, user-friendly interface.
- **Modern Tech Stack**: Built with Next.js, React, Tailwind CSS, and Lucide React icons.

## Getting Started

### Prerequisites
Make sure you have Node.js and npm (or yarn/bun/pnpm) installed. You will also need an API key from Google Gemini to generate the quizzes.

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/quizify.git
   cd quizify
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root of your project and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **AI Integration:** [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- **PDF Parsing:** [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **Icons:** [lucide-react](https://lucide.dev/)

## License

This project is open-source and available under the [MIT License](LICENSE).

