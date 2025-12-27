# Stephan Barker — AI Chat Portfolio

A modern, interactive portfolio website featuring an AI-powered chat interface. Built with Next.js, TypeScript, Tailwind CSS, and integrated with multiple LLM providers for AI chat functionality.

## ✨ Features

- 🤖 **AI Chat Interface**: Interactive chat powered by OpenRouter (default) or other LLM providers that answers questions about professional experience, projects, and skills
- 📄 **Dynamic CV Generation**: Automatically generates a professional PDF CV from `profile.json` data
- 📅 **Cal.com Integration**: Embedded calendar for booking meetings directly in the chat
- 🎨 **Modern UI**: Dark mode-only design with smooth animations and minimalist aesthetics
- 📱 **Fully Responsive**: Optimized for all devices, with mobile-first approach
- 🚀 **Performance Optimized**: Built with Next.js 16 App Router for optimal performance
- 🔌 **Multi-Provider Support**: Easily switch between different LLM providers (OpenRouter, OpenAI, and more)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI SDK**: Vercel AI SDK v5
- **AI Provider**: OpenRouter (default), OpenAI, or custom providers
- **PDF Generation**: @react-pdf/renderer
- **Calendar**: Cal.com Embed
- **Icons**: Lucide React, Phosphor Icons
- **Animations**: GSAP, Motion

## 📋 Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm
- API key from your chosen LLM provider:
  - **OpenRouter** (recommended): Get your API key from [OpenRouter](https://openrouter.ai/keys)
  - **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
  - **Other providers**: See configuration section below

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

Create a `.env.local` file in the root directory. You can copy `.env.example` as a template:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration:

#### Option 1: OpenRouter (Default - Recommended)

OpenRouter provides access to multiple models from different providers with a single API key.

```env
# LLM Provider Configuration
LLM_PROVIDER=openrouter

# OpenRouter API Key (get from https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Specify a model (default: openai/gpt-4o-mini)
# See available models: https://openrouter.ai/models
OPENROUTER_MODEL=openai/gpt-4o-mini
```

#### Option 2: OpenAI (Direct)

Direct access to OpenAI's API.

```env
# LLM Provider Configuration
LLM_PROVIDER=openai

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Specify a model (default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

#### Option 3: Custom Provider

See the [LLM Provider Configuration](#llm-provider-configuration) section below for instructions on adding custom providers.

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

## 🔌 LLM Provider Configuration

This project supports multiple LLM providers and makes it easy to switch between them. The provider is configured via the `LLM_PROVIDER` environment variable.

### Supported Providers

#### OpenRouter (Default)

OpenRouter is the default provider and recommended for most use cases. It provides access to multiple models from different providers with a single API key.

**Advantages:**
- Access to models from OpenAI, Anthropic, Google, Meta, and more
- Single API key for multiple providers
- Cost-effective pricing
- Easy model switching

**Configuration:**
```env
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

**Available Models:**
- `openai/gpt-4o-mini` (default, cost-effective)
- `openai/gpt-4o`
- `anthropic/claude-3.5-sonnet`
- `google/gemini-pro-1.5`
- And many more at [openrouter.ai/models](https://openrouter.ai/models)

#### OpenAI (Direct)

Direct access to OpenAI's API without going through OpenRouter.

**Configuration:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

**Available Models:**
- `gpt-4o-mini` (default, cost-effective)
- `gpt-4o`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

### Adding Custom Providers

To add support for additional providers (e.g., Anthropic, Google, etc.):

1. Install the provider's SDK package:
   ```bash
   npm install @ai-sdk/anthropic  # Example for Anthropic
   ```

2. Edit `app/api/chat/route.ts` and add a new case in the `getLLMModel()` function:

   ```typescript
   case "anthropic": {
     const apiKey = process.env.ANTHROPIC_API_KEY;
     if (!apiKey) {
       throw new Error("Anthropic API key not set. Please set ANTHROPIC_API_KEY.");
     }
     const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
     const anthropic = createAnthropic({ apiKey });
     return anthropic(model);
   }
   ```

3. Add the corresponding environment variables to `.env.example` and document them in the README.

4. Update the error message in the default case to include your new provider.

The code is well-documented with comments explaining how to add new providers. See `app/api/chat/route.ts` for details.

## 📦 Building for Production

```bash
npm run build
npm run start
```

### Environment Variables in Production

Make sure to set all required environment variables in your production environment:

- **Vercel**: Add environment variables in the Vercel dashboard under Project Settings → Environment Variables
- **Docker**: Pass environment variables when running the container (see Docker section)
- **Other platforms**: Follow your platform's documentation for setting environment variables

## 🐳 Docker Deployment

This project includes a `Dockerfile` for containerized deployment (e.g., Dokploy).

### Build Docker image

```bash
docker build -t portfolio-app .
```

### Run container

```bash
docker run -p 3000:3000 \
  -e LLM_PROVIDER=openrouter \
  -e OPENROUTER_API_KEY=your_openrouter_api_key_here \
  -e OPENROUTER_MODEL=openai/gpt-4o-mini \
  portfolio-app
```

**Important:** Never hardcode API keys or sensitive information in Docker commands. Use environment variable files or secrets management:

```bash
# Using .env file (make sure it's in .dockerignore)
docker run -p 3000:3000 --env-file .env.local portfolio-app

# Or use Docker secrets (recommended for production)
docker run -p 3000:3000 \
  --secret source=openrouter_api_key,target=OPENROUTER_API_KEY \
  portfolio-app
```

## 🔒 Security Best Practices

### Development Environment

1. **Never commit sensitive data:**
   - ✅ `.env.local` is already in `.gitignore`
   - ✅ Never commit API keys, tokens, or passwords
   - ✅ Use `.env.example` as a template (without real values)

2. **Environment variables:**
   - Store all secrets in `.env.local` (not committed to git)
   - Use different API keys for development and production
   - Rotate API keys regularly

3. **Code security:**
   - The codebase doesn't log API keys (only checks if they exist)
   - Error messages don't expose sensitive information in production
   - Input validation is implemented for all API endpoints

### Production Environment

1. **API Key Management:**
   - Use environment variables, never hardcode
   - Use secrets management services (AWS Secrets Manager, Vercel Secrets, etc.)
   - Rotate keys periodically
   - Use different keys for different environments

2. **Error Handling:**
   - Production error messages don't expose internal details
   - Detailed errors only shown in development mode
   - API keys are never logged or exposed

3. **Docker Security:**
   - Dockerfile runs as non-root user (`nextjs`)
   - Multi-stage build reduces attack surface
   - No sensitive data in Docker image layers

4. **Network Security:**
   - Use HTTPS in production
   - Implement rate limiting (consider using middleware)
   - Validate and sanitize all user inputs

5. **Dependencies:**
   - Regularly update dependencies: `npm audit` and `npm update`
   - Review security advisories for packages
   - Use `npm ci` in production for reproducible builds

### Checklist Before Deployment

- [ ] All API keys are set via environment variables (not hardcoded)
- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] Production environment variables are configured
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date (`npm audit`)
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is considered/implemented

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/          # AI chat API endpoint (supports multiple LLM providers)
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

Modify the system prompt in `app/api/chat/route.ts` in the `buildSystemPrompt()` function to change how the AI responds:

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

### Contributing Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation for new features
- Test your changes before submitting
- Ensure no sensitive data is committed

## 📧 Contact

Stephan Barker - hi@stephanbarker.com

Project Link: [https://github.com/sbarkerzamora/New-Portfolio-Astro](https://github.com/sbarkerzamora/New-Portfolio-Astro)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [OpenRouter](https://openrouter.ai/) - AI API provider (default)
- [OpenAI](https://openai.com/) - AI models
- [Cal.com](https://cal.com/) - Scheduling platform
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI SDK for Next.js

---

Made with ❤️ by Stephan Barker
