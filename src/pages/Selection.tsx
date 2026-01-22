import { Button } from "@/components/ui/button";

interface SelectionPageProps {
  onSelectChat: () => void;
  onSelectSupport: () => void;
}

export function SelectionPage({ onSelectChat, onSelectSupport }: SelectionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">fiveminutes.io</h1>
          <p className="text-slate-400">Choose a service</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onSelectChat}
            className="w-full h-24 text-xl font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">💬</span>
              <span>Chat</span>
            </div>
          </Button>

          <Button
            onClick={onSelectSupport}
            className="w-full h-24 text-xl font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">🎫</span>
              <span>Support</span>
            </div>
          </Button>
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Real-time communication and support management</p>
        </div>
      </div>
    </div>
  );
}
