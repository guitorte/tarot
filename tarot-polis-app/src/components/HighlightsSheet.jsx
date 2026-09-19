import { useRef, useState } from 'react'
import { Download, Trash2, Upload } from 'lucide-react'
import { AUTHORS } from '../data/authors.js'
import { getColor } from '../data/highlightColors.js'
import { exportFileName, splitKey } from '../lib/highlightStore.js'
import { readTextFile, saveTextFile } from '../lib/shareFile.js'

const AUTHOR_NAMES = Object.fromEntries(AUTHORS.map((a) => [a.id, a.name]))

export default function HighlightsSheet({
  byPassage,
  count,
  storageFailed,
  resolveText,
  onExport,
  onImport,
  onErase,
  onClearAll,
}) {
  const fileInput = useRef(null)
  const [status, setStatus] = useState(null)
  const [confirmingClear, setConfirmingClear] = useState(false)

  async function handleExport() {
    try {
      const document = onExport(resolveText)
      const result = await saveTextFile(
        exportFileName(),
        JSON.stringify(document, null, 2),
      )
      setStatus({
        tone: 'ok',
        message:
          result.method === 'file'
            ? `${count} marcações salvas em ${result.uri}`
            : `${count} marcações exportadas para ${result.fileName}`,
      })
    } catch (error) {
      setStatus({ tone: 'error', message: `Falha ao exportar: ${error.message}` })
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const raw = JSON.parse(await readTextFile(file))
      const { imported, repaired, skipped } = onImport(raw, resolveText)
      const notes = [
        `${imported} marcações importadas`,
        repaired > 0 && `${repaired} reposicionadas`,
        skipped > 0 && `${skipped} ignoradas`,
      ].filter(Boolean)
      setStatus({ tone: skipped > 0 ? 'warn' : 'ok', message: notes.join(' · ') })
    } catch (error) {
      setStatus({ tone: 'error', message: `Falha ao importar: ${error.message}` })
    }
  }

  const passages = Object.entries(byPassage)

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="px-4 pb-3">
        <h2 className="text-base font-semibold">Marcações</h2>
        <p className="text-xs mt-0.5" style={{ color: '#a1a1aa' }}>
          {count === 0
            ? 'Selecione um trecho de qualquer interpretação para marcá-lo.'
            : `${count} ${count === 1 ? 'trecho marcado' : 'trechos marcados'}`}
        </p>
      </div>

      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={handleExport}
          disabled={count === 0}
          className="touch-target flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: '#a78bfa',
            color: '#0a0a0f',
            opacity: count === 0 ? 0.4 : 1,
          }}
        >
          <Download className="h-4 w-4" />
          Exportar
        </button>
        <button
          onClick={() => fileInput.current?.click()}
          className="touch-target flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#1e1e2e', color: '#fafafa', border: '1px solid #27273a' }}
        >
          <Upload className="h-4 w-4" />
          Importar
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {storageFailed && (
        <p className="px-4 pb-2 text-xs" style={{ color: '#fb923c' }}>
          Não foi possível salvar no aparelho. Exporte para não perder as marcações.
        </p>
      )}

      {status && (
        <p
          className="px-4 pb-2 text-xs leading-relaxed"
          style={{
            color:
              status.tone === 'error'
                ? '#f87171'
                : status.tone === 'warn'
                  ? '#fb923c'
                  : '#4ade80',
          }}
        >
          {status.message}
        </p>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        {passages.map(([key, ranges]) => {
          const { card, author } = splitKey(key)
          const text = resolveText(card, author) ?? ''
          return (
            <div key={key} style={{ borderBottom: '1px solid rgba(39, 39, 58, 0.5)' }}>
              <div className="px-4 pt-3 pb-1">
                <p className="text-sm font-semibold">{card}</p>
                <p className="text-xs" style={{ color: '#a1a1aa' }}>
                  {AUTHOR_NAMES[author] ?? author}
                </p>
              </div>
              {ranges.map((range) => (
                <div key={range.id} className="px-4 pb-3 flex items-start gap-2">
                  <span
                    className="flex-shrink-0 w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: getColor(range.color).hex }}
                  />
                  <p className="flex-1 text-xs leading-relaxed" style={{ color: 'rgba(250, 250, 250, 0.75)' }}>
                    {text.slice(range.start, range.end)}
                  </p>
                  <button
                    onClick={() => onErase(card, author, range.start, range.end)}
                    aria-label="Remover marcação"
                    className="flex-shrink-0 p-1 rounded"
                    style={{ color: '#a1a1aa' }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )
        })}

        {count > 0 && (
          <div className="px-4 py-4">
            {confirmingClear ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClearAll()
                    setConfirmingClear(false)
                    setStatus({ tone: 'warn', message: 'Todas as marcações foram apagadas.' })
                  }}
                  className="touch-target flex-1 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#f87171', color: '#0a0a0f' }}
                >
                  Apagar tudo
                </button>
                <button
                  onClick={() => setConfirmingClear(false)}
                  className="touch-target flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: '#1e1e2e', color: '#a1a1aa' }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingClear(true)}
                className="touch-target text-sm"
                style={{ color: '#f87171' }}
              >
                Apagar todas as marcações
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
