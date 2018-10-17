// STATUS BAR VIEW

const {Disposable} = require('atom')

module.exports =
class LanguageStatusView {
  constructor (statusBar) {
    this.statusBar = statusBar
    this.element = document.createElement('language-selector-status')
    this.element.classList.add('language-status', 'inline-block')
    this.languageLink = document.createElement('a')
    this.languageLink.classList.add('inline-block')
    this.element.appendChild(this.languageLink)

    this.activeItemSubscription = atom.workspace.observeActiveTextEditor(this.subscribeToActiveTextEditor.bind(this))

    this.configSubscription = atom.config.observe('language-selector.showOnRightSideOfStatusBar', this.attach.bind(this))
    const clickHandler = (event) => {
      event.preventDefault()
      atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), 'language-selector:show')
    }
    this.element.addEventListener('click', clickHandler)
    this.clickSubscription = new Disposable(() => { this.element.removeEventListener('click', clickHandler) })
  }

  attach () {
    if (this.tile) {
      this.tile.destroy()
    }

    this.tile = atom.config.get('language-selector.showOnRightSideOfStatusBar')
      ? this.statusBar.addRightTile({item: this.element, priority: 10})
      : this.statusBar.addLeftTile({item: this.element, priority: 10})
  }

  destroy () {
    if (this.activeItemSubscription) {
      this.activeItemSubscription.dispose()
    }

    if (this.languageSubscription) {
      this.languageSubscription.dispose()
    }

    if (this.clickSubscription) {
      this.clickSubscription.dispose()
    }

    if (this.configSubscription) {
      this.configSubscription.dispose()
    }

    if (this.tile) {
      this.tile.destroy()
    }

    if (this.tooltip) {
      this.tooltip.dispose()
    }
  }

  subscribeToActiveTextEditor () {
    if (this.languageSubscription) {
      this.languageSubscription.dispose()
      this.languageSubscription = null
    }

    const editor = atom.workspace.getActiveTextEditor()
    if (editor) {
      // need to update from onDidChangeGrammar()
      this.languageSubscription = editor.onDidChange(this.updateLanguageText.bind(this))
    }
    this.updateLanguageText()
  }

  // Major work will need to be done here!
  updateLanguageText () {
    atom.views.updateDocument(() => {
      const editor = atom.workspace.getActiveTextEditor()
      // Getting the grammar until we figure out how to detect the language of keywords
      // ** can probably tell language from keywords **
      const language = editor ? editor.getGrammar() : null

      if (this.tooltip) {
        this.tooltip.dispose()
        this.tooltip = null
      }

      if (language) {
        let languageName = null
        if (language === atom.grammars.nullGrammar) {
          languageName = 'English'
        } else {
          // languageName = language.name || language.scopeName
          languageName = "THIS DOCUMENT IS IN ENGLISH"
        }

        this.languageLink.textContent = languageName
        this.languageLink.dataset.language = languageName
        this.element.style.display = ''

        this.tooltip = atom.tooltips.add(this.element, {title: `File uses the ${languageName} language`})
      } else {
        this.element.style.display = 'none'
      }
    })
  }
}
