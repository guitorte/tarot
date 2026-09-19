import { BookOpen, Plus } from 'lucide-react'

export default function EmptyState({ onOpenSheet }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: '#1e1e2e' }}
      >
        <BookOpen className="h-10 w-10" style={{ color: '#a1a1aa' }} />
      </div>
      <h2 className="text-xl font-semibold mb-2">Nenhuma carta selecionada</h2>
      <p className="text-sm mb-8 max-w-xs" style={{ color: '#a1a1aa' }}>
        Selecione até 3 cartas para ver as interpretações de 15 mestres do tarô.
      </p>
      <button
        onClick={onOpenSheet}
        className="touch-target flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-colors"
        style={{ backgroundColor: '#a78bfa', color: '#0a0a0f' }}
      >
        <Plus className="h-5 w-5" />
        Adicionar Carta
      </button>
      <p
        className="mt-12 text-xs max-w-sm leading-relaxed"
        style={{ color: 'rgba(161, 161, 170, 0.6)' }}
      >
        Interpretações de Arrien, Cowie, Crowley, Eakins, Fairfield, Greer,
        Noble, Pollack, Sharman-Burke, Stewart, Waite, Walker, Wanless, Wirth e
        Riley.
      </p>
    </div>
  )
}
