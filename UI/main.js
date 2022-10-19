const { app, BrowserWindow } = require('electron')

const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 1200
  })  
  win.loadFile('prototype.html')
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})