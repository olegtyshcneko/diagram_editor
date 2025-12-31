import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <AppShell>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Phase 0 Setup Complete!</p>
        <Button onClick={() => alert('shadcn/ui working!')}>
          Test Button
        </Button>
      </div>
    </AppShell>
  );
}

export default App;
