"use client"
import { Component, type ReactNode } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error) {
    console.error("Error caught by boundary:", error)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="max-w-md text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Algo deu errado</h1>
            <p className="text-muted-foreground">{this.state.error?.message || "Erro desconhecido"}</p>
            <Button onClick={() => this.setState({ hasError: false, error: undefined })}>Tentar novamente</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
