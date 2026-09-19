import { Capacitor } from '@capacitor/core'

/**
 * Hands a generated file to the user.
 *
 * The Android WebView registers no download listener, so `<a download>` fails
 * silently there — on device the file is written to app storage and passed to
 * the system share sheet instead, which is also what lets it leave the app
 * before a reinstall wipes it.
 */
export async function saveTextFile(fileName, contents, mimeType = 'application/json') {
  if (Capacitor.isNativePlatform()) return shareFromDevice(fileName, contents)

  const blob = new Blob([contents], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)

  return { method: 'download', fileName }
}

async function shareFromDevice(fileName, contents) {
  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
  const { Share } = await import('@capacitor/share')

  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: contents,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true,
  })

  try {
    const { value } = await Share.canShare()
    if (value) {
      await Share.share({
        title: 'Marcações do Tarot-Polis',
        url: uri,
        dialogTitle: 'Exportar marcações',
      })
      return { method: 'share', fileName, uri }
    }
  } catch {
    // Sharing was cancelled or is unavailable; the file is written either way.
  }
  return { method: 'file', fileName, uri }
}

export async function readTextFile(file) {
  if (file.text) return file.text()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
