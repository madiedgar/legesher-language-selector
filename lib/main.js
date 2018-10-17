const LanguageListView = require('./language-list-view')
const LanguageStatusView = require('./language-status-view')

let commandDisposable = null
let languageListView = null
let languageStatusView = null

module.exports = {
  activate () {
    commandDisposable = atom.commands.add('atom-text-editor', 'language-selector:show', () => {
      if (!languageListView) languageListView = new LanguageListView()
      languageListView.toggle()
    })
  },

  deactivate () {
    if (commandDisposable) commandDisposable.dispose()
    commandDisposable = null

    if (languageStatusView) languageStatusView.destroy()
    languageStatusView = null

    if (languageListView) languageListView.destroy()
    languageListView = null
  },

  consumeStatusBar (statusBar) {
    languageStatusView = new LanguageStatusView(statusBar)
    languageStatusView.attach()
  }
}
