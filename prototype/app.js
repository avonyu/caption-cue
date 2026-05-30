const navItems = document.querySelectorAll(".nav-item")
const views = document.querySelectorAll(".view")
const captionRows = document.querySelectorAll(".caption-row")
const modeButtons = document.querySelectorAll("[data-caption-mode]")

const entryState = document.querySelector("#douyin-entry-state")
const learningState = document.querySelector("#learning-mode-state")
const toolbarButton = document.querySelector("#captioncue-toolbar-button")
const extensionMenu = document.querySelector("#extension-menu")
const enterLearningButton = document.querySelector("#enter-learning-mode")
const topEnterLearningButton = document.querySelector("#top-enter-learning")
const exitLearningButton = document.querySelector("#exit-learning-mode")
const resetButton = document.querySelector("#reset-prototype")

const focusTime = document.querySelector("#focus-time")
const focusText = document.querySelector("#focus-text")
const focusTranslation = document.querySelector("#focus-translation")
const playbackState = document.querySelector("#playback-state")
const playButton = document.querySelector(".play-button")
const wordPanel = document.querySelector("#word-detail-panel")
const wordTitle = document.querySelector("#word-title")
const wordPhonetic = document.querySelector("#word-phonetic")
const wordType = document.querySelector("#word-type")
const wordDefinition = document.querySelector("#word-definition")
const wordExample = document.querySelector("#word-example")
const soundButton = document.querySelector(".sound-button")

const providerSelect = document.querySelector("#provider-select")
const modelInput = document.querySelector("#model-input")
const routeProviders = [
  document.querySelector("#route-provider-1"),
  document.querySelector("#route-provider-2"),
  document.querySelector("#route-provider-3")
]

let captionMode = "bilingual"

const providerDefaultModels = {
  DeepSeek: "deepseek-chat",
  OpenAI: "gpt-4.1-mini",
  Qwen: "qwen-plus",
  Doubao: "doubao-seed-1.6",
  Custom: "custom-chat-model"
}

const wordDictionary = {
  today: {
    phonetic: "/tuh-day/",
    type: "\u540d\u8bcd / \u526f\u8bcd",
    definition: "\u4eca\u5929\uff1b\u5f53\u524d\u8fd9\u4e00\u5929\u3002",
    example: "Today's video is going to be a little bit different."
  },
  video: {
    phonetic: "/vid-ee-oh/",
    type: "\u540d\u8bcd",
    definition: "\u89c6\u9891\uff1b\u4e00\u6bb5\u53ef\u64ad\u653e\u6216\u6d41\u5f0f\u4f20\u8f93\u7684\u52a8\u6001\u5f71\u50cf\u3002",
    example: "Today's video is going to be a little bit different."
  },
  little: {
    phonetic: "/lit-l/",
    type: "\u5f62\u5bb9\u8bcd",
    definition: "\u5c0f\u7684\uff1b\u5c11\u91cf\u7684\u3002a little bit \u8868\u793a\u201c\u6709\u4e00\u70b9\u201d\u3002",
    example: "This is a little bit different."
  },
  different: {
    phonetic: "/dif-er-uhnt/",
    type: "\u5f62\u5bb9\u8bcd",
    definition: "\u4e0d\u540c\u7684\uff1b\u548c\u4e4b\u524d\u7684\u5185\u5bb9\u3001\u98ce\u683c\u6216\u60c5\u51b5\u4e0d\u4e00\u6837\u3002",
    example: "Today's video is going to be a little bit different."
  },
  style: {
    phonetic: "/style/",
    type: "\u540d\u8bcd",
    definition: "\u98ce\u683c\uff1b\u505a\u4e8b\u6216\u8868\u8fbe\u7684\u65b9\u5f0f\u3002",
    example: "I am filming this in my old style."
  },
  comments: {
    phonetic: "/kom-ents/",
    type: "\u540d\u8bcd",
    definition: "\u8bc4\u8bba\uff1b\u89c6\u9891\u6216\u6587\u7ae0\u4e0b\u65b9\u7684\u7559\u8a00\u3002",
    example: "Let me know in the comments."
  },
  naturally: {
    phonetic: "/nach-er-uh-lee/",
    type: "\u526f\u8bcd",
    definition: "\u81ea\u7136\u5730\uff1b\u4e0d\u751f\u786c\u5730\u3002",
    example: "I'll be describing everything naturally in English."
  },
  vocabulary: {
    phonetic: "/voh-kab-yuh-lair-ee/",
    type: "\u540d\u8bcd",
    definition: "\u8bcd\u6c47\uff1b\u4e00\u95e8\u8bed\u8a00\u6216\u67d0\u4e2a\u4e3b\u9898\u4e2d\u7684\u5355\u8bcd\u3002",
    example: "You'll also learn useful phrases and vocabulary."
  }
}

const fallbackWord = {
  phonetic: "/.../",
  type: "\u5355\u8bcd",
  definition: "AI \u53ef\u4ee5\u6839\u636e\u5f53\u524d\u5b57\u5e55\u4e0a\u4e0b\u6587\u751f\u6210\u97f3\u6807\u3001\u8bcd\u6027\u3001\u91ca\u4e49\u548c\u7528\u6cd5\u8bf4\u660e\u3002",
  example: "Clicking a word opens a focused vocabulary panel."
}

function normalizeWord(token) {
  return token.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "")
}

function getActiveCaptionRow() {
  return document.querySelector(".caption-row.active") || captionRows[0]
}

function setPlaybackPaused(paused) {
  playButton?.classList.toggle("paused", paused)
  if (playButton) {
    playButton.textContent = paused ? "II" : "\u25b6"
  }
  if (playbackState) {
    playbackState.textContent = paused ? "\u60ac\u6d6e\u5355\u8bcd\uff0c\u89c6\u9891\u5df2\u6682\u505c" : "00:04"
  }
}

function updateWordDetail(rawWord) {
  if (!wordTitle || !wordPhonetic || !wordType || !wordDefinition || !wordExample) {
    return
  }

  const normalized = normalizeWord(rawWord)
  const detail = wordDictionary[normalized] || fallbackWord
  const cleanWord = rawWord.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "")

  wordTitle.textContent = cleanWord || rawWord
  wordPhonetic.textContent = detail.phonetic
  wordType.textContent = detail.type
  wordDefinition.textContent = detail.definition
  wordExample.textContent = detail.example

  document.querySelectorAll(".word-token").forEach((token) => {
    token.classList.toggle("active", normalizeWord(token.textContent) === normalized)
  })
}

function renderInteractiveText(container, text) {
  if (!container) {
    return
  }

  container.textContent = ""
  container.classList.add("interactive-text")

  text.split(/(\s+)/).forEach((part) => {
    if (!part.trim()) {
      container.append(document.createTextNode(part))
      return
    }

    const normalized = normalizeWord(part)
    if (!normalized) {
      container.append(document.createTextNode(part))
      return
    }

    const token = document.createElement("button")
    token.type = "button"
    token.className = "word-token"
    token.textContent = part
    token.addEventListener("mouseenter", () => setPlaybackPaused(true))
    token.addEventListener("mouseleave", () => setPlaybackPaused(false))
    token.addEventListener("click", (event) => {
      event.stopPropagation()
      updateWordDetail(part)
    })
    container.append(token)
  })
}

function renderPlainText(container, text) {
  if (!container) {
    return
  }
  container.classList.remove("interactive-text")
  container.textContent = text
}

function updateCaptionRowsForMode() {
  captionRows.forEach((row) => {
    const english = row.querySelector("strong")
    const chinese = row.querySelector("em")

    if (english) {
      english.hidden = captionMode === "chinese"
    }
    if (chinese) {
      chinese.hidden = captionMode === "english"
    }
  })
}

function updateCurrentCaption(row = getActiveCaptionRow()) {
  if (!row || !focusTime) {
    return
  }

  const englishText = row.dataset.text || ""
  const chineseText = row.dataset.translation || ""

  focusTime.textContent = row.dataset.time || ""

  if (captionMode === "english") {
    renderInteractiveText(focusText, englishText)
    if (focusTranslation) {
      focusTranslation.hidden = true
    }
    if (wordPanel) {
      wordPanel.hidden = false
    }
    return
  }

  if (captionMode === "chinese") {
    renderPlainText(focusText, chineseText)
    if (focusTranslation) {
      focusTranslation.hidden = true
    }
    if (wordPanel) {
      wordPanel.hidden = true
    }
    return
  }

  renderInteractiveText(focusText, englishText)
  if (focusTranslation) {
    focusTranslation.hidden = false
    focusTranslation.textContent = chineseText
  }
  if (wordPanel) {
    wordPanel.hidden = false
  }
}

function setCaptionMode(mode) {
  captionMode = mode
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.captionMode === mode)
  })
  updateCaptionRowsForMode()
  updateCurrentCaption()
}

function enterMainPanel() {
  if (entryState) {
    entryState.hidden = true
  }
  if (learningState) {
    learningState.hidden = false
  }
  if (extensionMenu) {
    extensionMenu.hidden = true
  }
  updateCaptionRowsForMode()
  updateCurrentCaption()
  updateWordDetail("different")
}

function exitMainPanel() {
  if (entryState) {
    entryState.hidden = false
  }
  if (learningState) {
    learningState.hidden = true
  }
  if (extensionMenu) {
    extensionMenu.hidden = true
  }
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.dataset.view

    navItems.forEach((navItem) => navItem.classList.remove("active"))
    views.forEach((view) => view.classList.remove("active"))

    item.classList.add("active")
    document.querySelector(`#${target}`)?.classList.add("active")
  })
})

captionRows.forEach((row) => {
  row.addEventListener("click", () => {
    captionRows.forEach((captionRow) => captionRow.classList.remove("active"))
    row.classList.add("active")
    updateCurrentCaption(row)
  })
})

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setCaptionMode(button.dataset.captionMode))
})

toolbarButton?.addEventListener("click", () => {
  if (extensionMenu) {
    extensionMenu.hidden = !extensionMenu.hidden
  }
})

enterLearningButton?.addEventListener("click", enterMainPanel)
topEnterLearningButton?.addEventListener("click", enterMainPanel)
exitLearningButton?.addEventListener("click", exitMainPanel)
resetButton?.addEventListener("click", exitMainPanel)

providerSelect?.addEventListener("change", () => {
  const provider = providerSelect.value
  if (modelInput) {
    modelInput.value = providerDefaultModels[provider] || ""
  }
  routeProviders.forEach((node) => {
    if (node) {
      node.textContent = provider
    }
  })
})

soundButton?.addEventListener("click", () => {
  const word = wordTitle?.textContent || ""
  if ("speechSynthesis" in window && word) {
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(word))
  }
})

updateCaptionRowsForMode()
updateCurrentCaption()
updateWordDetail("different")
