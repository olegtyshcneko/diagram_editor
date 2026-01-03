import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <AppShell />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}

export default App;
