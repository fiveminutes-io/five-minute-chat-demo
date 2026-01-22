# Five Minute Chat Demo

A demonstration application showcasing the capabilities of [Five Minute Chat](https://fiveminutes.io) - a real-time communication platform supporting both public chat channels and support ticket systems.

## What is Five Minute Chat?

[Five Minute Chat](https://fiveminutes.io) is a globally available chat service designed for quick implementation in games and applications. It provides a robust, scalable backend for real-time communication, eliminating the need for developers to build and maintain their own infrastructure.

Whether you're a studio scaling up or an indie developer just starting out, Five Minute Chat handles all the complexities of hosting a high-performance, always-on cloud service - so you can focus on building great games and apps.

**Key Benefits:**
- 🚀 **Quick Setup** - Get started in minutes, not weeks
- 🌍 **Global Infrastructure** - Accessible worldwide with low latency
- 🔒 **Secure by Default** - Industry-standard encryption in flight and at rest
- 🛠️ **Headless SDK** - Build your own custom UI
- 📈 **Scales Effortlessly** - From prototype to production

Learn more at [fiveminutes.io](https://fiveminutes.io)

## Features

This demo application demonstrates two key features of Five Minute Chat:

### 💬 Chat
- Real-time messaging in public channels
- Message history retrieval
- Whisper (direct message) support
- Persistent device identification
- Live connection status

![Chat Demo](./docs/chat-demo.gif)

### 🎫 Support
- Create new support tickets
- Join existing support tickets
- Real-time support messaging
- Topic and description management
- Ticket-based conversation threading

![Support Demo](./docs/support-demo.gif)

## Getting Started

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Start the development server**
   ```bash
   yarn run dev
   ```

3. **Open your browser**
   
   The application will be available at `http://localhost:5173` (or the port shown in your terminal)

## Project Structure

```
fmc-chat-demo/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ui/           # UI component library (shadcn/ui)
│   │   ├── ChatInterface.tsx
│   │   ├── ChatLoginForm.tsx
│   │   ├── SupportInterface.tsx
│   │   └── SupportLoginForm.tsx
│   ├── pages/            # Page components
│   │   ├── ChatLoginPage.tsx
│   │   ├── SupportLoginPage.tsx
│   │   └── Selection.tsx
│   ├── types/            # TypeScript type definitions
│   └── hooks/            # Custom React hooks
├── docs/                 # Documentation and media assets
├── public/               # Static assets
└── package.json
```

## Built With

- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **@fiveminutes-io/chat-client** - Chat client SDK
- **@fiveminutes-io/support-client** - Support client SDK
- **SignalR** - Real-time communication

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build locally

## Configuration

The demo connects to the Five Minute Chat server at:
- **Server URL**: `https://signalr.fiveminutes.cloud/signalr`
- **Default App ID**: Pre-configured for demo purposes
- **Default App Secret**: Pre-configured for demo purposes

You can modify these settings in the login forms when running the application.

## Learn More

- **Main Site**: [fiveminutes.io](https://fiveminutes.io)
- **About**: [fiveminutes.io/about](https://fiveminutes.io/about)
- **Documentation**: [fiveminutes.io/docs](https://fiveminutes.io/docs)
- **Discord Community**: Get support and connect with other developers

## License

MIT
