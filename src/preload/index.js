import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { join } from 'path'
import { fileURLToPath } from 'url'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      isWindowsVisible: () => {
        return ipcRenderer.sendSync('is-windows-visible')
      },
      showCurrentWindow: () => {
        return ipcRenderer.sendSync('show-current-window')
      },
      createNotification: (options) => ipcRenderer.send('create-notification', options),
      getResourcePath: (type) => {
        if (type === 'sounds') {
          const path = join(__dirname, '../../resources/sounds')
          return `file://${path.replace(/\\/g, '/')}`
        }
        return ''
      },
      playSound: (soundName) => ipcRenderer.send('play-sound', soundName),
      setDevTools: () => ipcRenderer.send('set-dev-tools')
    })
    
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} 
else {
  window.electron = electronAPI
  window.api = api
}
