export type CaptionDisplayMode = "bilingual" | "english" | "chinese"

export const captionModeLabels: Record<CaptionDisplayMode, string> = {
  bilingual: "中英双语",
  english: "纯英文",
  chinese: "纯中文"
}

export type DemoCaption = {
  id: string
  time: string
  shortTime: string
  text: string
  translation: string
}
