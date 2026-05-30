import { create } from "zustand"
import { devtools } from "zustand/middleware"

import { demoCaptions } from "~data/demo-captions"
import type { CaptionDisplayMode } from "~types/caption"

export type AppState = {
  activeCaptionId: string
  captionDisplayMode: CaptionDisplayMode
  isOpenMainPanel: boolean
}

export type AppActions = {
  openMainPanel: () => void
  closeMainPanel: () => void
  setActiveCaptionId: (captionId: string) => void
  setCaptionDisplayMode: (mode: CaptionDisplayMode) => void
}

export type AppStore = AppState & AppActions

const initialState: AppState = {
  activeCaptionId: demoCaptions[1]?.id ?? demoCaptions[0].id,
  captionDisplayMode: "bilingual",
  isOpenMainPanel: false
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,
      openMainPanel: () => set({ isOpenMainPanel: true }, false, "openMainPanel"),
      closeMainPanel: () =>
        set({ isOpenMainPanel: false }, false, "closeMainPanel"),
      setActiveCaptionId: (captionId) =>
        set({ activeCaptionId: captionId }, false, "setActiveCaptionId"),
      setCaptionDisplayMode: (mode) =>
        set({ captionDisplayMode: mode }, false, "setCaptionDisplayMode")
    }),
    { name: "app-store" }
  )
)
