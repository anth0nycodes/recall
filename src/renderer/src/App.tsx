import { Button } from '@renderer/components/ui/button'

function App(): React.JSX.Element {
  const ping = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="text-3xl font-semibold tracking-tight">Recall</h1>
      <p className="text-muted-foreground">Electron · Vite · React · Tailwind · shadcn</p>
      <div className="flex gap-3">
        <Button onClick={ping}>Send ping</Button>
        <Button variant="outline" onClick={() => window.open('https://electron-vite.org')}>
          Docs
        </Button>
      </div>
    </div>
  )
}

export default App
