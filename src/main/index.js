import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import WavPlayer from 'node-wav-player'
import { func } from 'vue-types'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1070,   //1580
    height: 710,  //1052
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: true,
      permissions: ['geolocation']
    }
  })

  // 设置 CSP 策略
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' https://*.amap.com",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.amap.com https://webapi.amap.com",
          "script-src-elem 'self' 'unsafe-inline' https://*.amap.com https://webapi.amap.com",
          "style-src 'self' 'unsafe-inline' https://*.amap.com",
          "img-src 'self' data: https://*.amap.com",
          "connect-src 'self' https://*.amap.com",
          "font-src 'self' data:",
          "media-src 'self'"
        ].join('; ')
      }
    })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 设置地理位置权限
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['geolocation']
    if (allowedPermissions.includes(permission)) {
      callback(true) // 允许地理位置权限
    } else {
      callback(false)
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId(process.execPath) // 开发环境
  // electronApp.setAppUserModelId('com.focuspuls.app') // 生产环境

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC 
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('is-windows-visible',isWindowsVisible)
  ipcMain.on('show-current-window', showCurrentWindow)
  ipcMain.on('create-notification', createNotification)
  ipcMain.on('play-sound', playSound)
  ipcMain.on('set-dev-tools', setDevTools)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function isWindowsVisible(event) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  event.returnValue = win.isVisible();
}

function showCurrentWindow(event) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  // if (config.get("isMaximized")) mainWindow.maximize();
  showWindow(win);
}

function createNotification(_, options) {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    icon: join(__dirname, '../../resources/favicon.ico'),
    silent: options.silent
  })
  notification.show()
}

function playSound(_, soundName) {
  const soundPath = join(__dirname, '../../resources/sounds', soundName)
  WavPlayer.play({
    path: soundPath,
    sync: true
  }).catch(error => {
    console.error('Error playing sound:', error)
  })
}

function setDevTools(event) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  
  // 判断当前是否打开控制台
  const isOpen = win.webContents.isDevToolsOpened();

  // 根据当前控制台的状态选择关闭/打开控制台
  if (isOpen) {
    // 关闭控制台
    win.webContents.closeDevTools();
  } else {
    // 打开控制台
    win.webContents.openDevTools();
  }
}
