# Stephan Barker — AI Chat Portfolio

A modern, interactive portfolio website featuring an AI-powered chat interface. Built with Next.js, TypeScript, Tailwind CSS, and integrated with OpenRouter for AI chat functionality.

## ✨ Features

- 🤖 **AI Chat Interface**: Interactive chat powered by OpenRouter AI (GPT-OSS-20b) that answers questions about professional experience, projects, and skills
- 📄 **Dynamic CV Generation**: Automatically generates a professional PDF CV from `profile.json` data
- 📅 **Cal.com Integration**: Embedded calendar for booking meetings directly in the chat
- 🎨 **Modern UI**: Dark mode-only design with smooth animations and minimalist aesthetics
- 📱 **Fully Responsive**: Optimized for all devices, with mobile-first approach
- 🚀 **Performance Optimized**: Built with Next.js 16 App Router for optimal performance

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI SDK**: Vercel AI SDK
- **AI Provider**: OpenRouter
- **PDF Generation**: @react-pdf/renderer
- **Calendar**: Cal.com Embed
- **Icons**: Lucide React, Phosphor Icons
- **Animations**: GSAP, Motion

## 📋 Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sbarkerzamora/New-Portfolio-Astro.git
cd New-Portfolio-Astro
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_SITE=https://yourdomain.com  # Optional, for production
```

### 4. Customize your profile

Edit `docs/profile.json` with your own information:

- Personal information
- Professional experience
- Projects
- Skills and technologies
- Contact information

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Building for Production

```bash
npm run build
npm run start
```

## 🐳 Docker Deployment

This project includes a `Dockerfile` for containerized deployment (e.g., Dokploy).

### Build Docker image

```bash
docker build -t portfolio-app .
```

### Run container

```bash
docker run -p 3000:3000 \
  -e OPENROUTER_API_KEY=your_key_here \
  portfolio-app
```

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/          # AI chat API endpoint
│   │   └── cv/            # PDF CV generation endpoint
│   ├── page.tsx           # Main page component
│   └── layout.tsx         # Root layout
├── components/
│   ├── MinimalChat.tsx    # Main chat component
│   ├── CVDocument.tsx     # PDF CV template
│   ├── ProjectsCarousel.tsx
│   ├── TechnologiesMarquee.tsx
│   └── ui/                # shadcn/ui components
├── contexts/
│   └── CalModalContext.tsx
├── docs/
│   └── profile.json       # Profile data source
├── lib/
│   ├── profile.ts         # Profile data loader
│   └── utils.ts           # Utility functions
└── public/
    └── assets/            # Static assets
```

## 🎨 Customization

### Profile Data

All profile information is stored in `docs/profile.json`. Update this file to customize:

- Personal information
- Professional experience
- Projects and portfolio
- Skills and technologies
- Contact information

### Styling

The project uses Tailwind CSS with a dark theme. Customize colors and styles in:

- `app/globals.css` - Global styles and CSS variables
- `tailwind.config.ts` - Tailwind configuration
- Component-specific CSS modules

### AI Chat Behavior

Modify the system prompt in `app/api/chat/route.ts` to change how the AI responds:

- Tone and personality
- Information to include
- Response format
- Special instructions

## 🧪 Testing

```bash
npm run test
# or
npm run test:ui  # For visual test UI
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Stephan Barker - hi@stephanbarker.com

Project Link: [https://github.com/sbarkerzamora/New-Portfolio-Astro](https://github.com/sbarkerzamora/New-Portfolio-Astro)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [OpenRouter](https://openrouter.ai/) - AI API provider
- [Cal.com](https://cal.com/) - Scheduling platform
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI SDK for Next.js

---

Made with ❤️ by Stephan Barker
