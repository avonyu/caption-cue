const navItems = document.querySelectorAll(".nav-item")
const views = document.querySelectorAll(".view")
const captionRows = document.querySelectorAll(".caption-row")
const modeButtons = document.querySelectorAll("[data-caption-mode]")
const focusTime = document.querySelector("#focus-time")
const focusText = document.querySelector("#focus-text")
const focusTranslation = document.querySelector("#focus-translation")
const videoCaptionText = document.querySelector("#video-caption-text")
const videoCaptionTranslation = document.querySelector("#video-caption-translation")
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
  video: {
    phonetic: "/vid-ee-oh/",
    type: "名词",
    definition: "视频；一段可播放或流式传输的动态影像。",
    example: "This video is useful for listening practice."
  },
  readable: {
    phonetic: "/ree-duh-buhl/",
    type: "形容词",
    definition: "可读的；容易阅读或识别的。",
    example: "The page has no readable captions."
  },
  captions: {
    phonetic: "/kap-shuhnz/",
    type: "名词",
    definition: "字幕；视频中用来表示对白或说明的文字。",
    example: "Captions help learners follow spoken English."
  },
  realize: {
    phonetic: "/ree-uh-lyz/",
    type: "动词",
    definition: "意识到；认识到某个事实或情况。",
    example: "I didn't realize how fast the speaker was talking."
  },
  relied: {
    phonetic: "/ri-lyd/",
    type: "动词",
    definition: "依赖；依靠。原形是 rely。",
    example: "I relied on subtitles to understand every sentence."
  },
  subtitles: {
    phonetic: "/sub-ty-tuhlz/",
    type: "名词",
    definition: "字幕；屏幕上显示的、对应或翻译语音内容的文字。",
    example: "I relied on subtitles to understand every sentence."
  },
  jump: {
    phonetic: "/juhmp/",
    type: "动词",
    definition: "跳转；从一个位置快速移动到另一个位置。",
    example: "Now I can jump sentence by sentence."
  },
  sentence: {
    phonetic: "/sen-tuhns/",
    type: "名词",
    definition: "句子；表达完整意思的一组词。",
    example: "Practice one sentence at a time."
  },
  deepseek: {
    phonetic: "/deep seek/",
    type: "专有名词",
    definition: "可用于翻译优化、学习讲解和笔记生成的大模型供应商。",
    example: "DeepSeek helps polish the translation and notes."
  },
  polish: {
    phonetic: "/pol-ish/",
    type: "动词",
    definition: "润色；让表达更清晰、更自然。",
    example: "The model can polish a rough translation."
  },
  translation: {
    phonetic: "/trans-lay-shuhn/",
    type: "名词",
    definition: "翻译；从一种语言转换成另一种语言的文本。",
    example: "The translation keeps the meaning natural."
  }
}

const fallbackWord = {
  phonetic: "/.../",
  type: "单词",
  definition: "AI 可以根据上下文生成音标、词性、释义和用法说明。",
  example: "Clicking a word opens a focused vocabulary panel."
}

function normalizeWord(token) {
  return token.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "")
}

function setPlaybackPaused(paused) {
  playButton?.classList.toggle("paused", paused)
  if (playButton) {
    playButton.textContent = paused ? "II" : "▶"
  }
  if (playbackState) {
    playbackState.textContent = paused ? "悬浮单词，视频已暂停" : "00:18 / 01:02"
  }
}

function updateWordDetail(rawWord) {
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

function getActiveCaptionRow() {
  return document.querySelector(".caption-row.active") || captionRows[0]
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
  if (!row) {
    return
  }

  const englishText = row.dataset.text
  const chineseText = row.dataset.translation

  focusTime.textContent = row.dataset.time

  if (captionMode === "english") {
    renderInteractiveText(focusText, englishText)
    focusTranslation.hidden = true
    videoCaptionTranslation.hidden = true
    renderInteractiveText(videoCaptionText, englishText)
    wordPanel.hidden = false
    return
  }

  if (captionMode === "chinese") {
    renderPlainText(focusText, chineseText)
    focusTranslation.hidden = true
    videoCaptionTranslation.hidden = true
    renderPlainText(videoCaptionText, chineseText)
    wordPanel.hidden = true
    return
  }

  renderInteractiveText(focusText, englishText)
  focusTranslation.hidden = false
  focusTranslation.textContent = chineseText
  renderInteractiveText(videoCaptionText, englishText)
  videoCaptionTranslation.hidden = false
  videoCaptionTranslation.textContent = chineseText
  wordPanel.hidden = false
}

function setCaptionMode(mode) {
  captionMode = mode
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.captionMode === mode)
  })
  updateCaptionRowsForMode()
  updateCurrentCaption()
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

providerSelect?.addEventListener("change", () => {
  const provider = providerSelect.value
  modelInput.value = providerDefaultModels[provider] || ""
  routeProviders.forEach((node) => {
    node.textContent = provider
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
updateWordDetail("subtitles")
