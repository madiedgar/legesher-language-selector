const SelectListView = require('atom-select-list')

module.exports =
class LanguageListView {
  constructor () {
    this.autoDetect = {name: 'Auto Detect'}
    // TODO: convert grammar to language select list
    // TODO: add language element to grammar attributes
    this.selectListView = new SelectListView({
      itemsClassList: ['mark-active'],
      items: [],
      filterKeyForItem: (language) => language.name,
      elementForItem: (language) => {
        const languageName = language.name || language.scopeName
        const element = document.createElement('li')
        if (language === this.currentLanguage) {
          element.classList.add('active')
        }
        element.textContent = languageName
        element.dataset.language = languageName
        return element
      },
      didConfirmSelection: (language) => {
        this.cancel()
        if (language === this.autoDetect) {
          atom.textEditors.clearLanguageOverride(this.editor)
        } else {
          atom.textEditors.setGrammarOverride(this.editor, language.scopeName)
        }
      },
      didCancelSelection: () => {
        this.cancel()
      }
    })
    console.log(this.selectListView)
    this.selectListView.element.classList.add('language-selector')
  }

  destroy () {
    this.cancel()
    return this.selectListView.destroy()
  }

  cancel () {
    if (this.panel != null) {
      this.panel.destroy()
    }
    this.panel = null
    this.currentLanguage = null
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
      this.previouslyFocusedElement = null
    }
  }

  attach () {
    this.previouslyFocusedElement = document.activeElement
    if (this.panel == null) {
      this.panel = atom.workspace.addModalPanel({item: this.selectListView})
    }
    this.selectListView.focus()
    this.selectListView.reset()
  }

  async toggle () {
    if (this.panel != null) {
      this.cancel()
    } else if (atom.workspace.getActiveTextEditor()) {
      this.editor = atom.workspace.getActiveTextEditor()
      this.currentLanguage = this.editor.getGrammar()
      if (this.currentLanguage === atom.grammars.nullGrammar) {
        this.currentLanguage = this.autoDetect
      }

      const languages = atom.grammars.getGrammars().filter((language) => {
        return language !== atom.grammars.nullGrammar && language.name
      })
      languages.sort((a, b) => {
        // set English as default -- but it won't be like this for long!!!! 😄
        if (a.scopeName === 'default.english') {
          return -1
        } else if (b.scopeName === 'default.english') {
          return 1
        } else if (a.name) {
          return a.name.localeCompare(b.name)
        } else if (a.scopeName) {
          return a.scopeName.localeCompare(b.scopeName)
        } else {
          return 1
        }
      })
      languages.unshift(this.autoDetect)
      await this.selectListView.update({items: languages})
      this.attach()
    }
  }
}
