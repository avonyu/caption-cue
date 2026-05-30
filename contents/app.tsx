import cssText from "data-text:~style.css"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useRef } from "react"

import { demoCaptions, MainPanel } from "~components/MainPanel"
import { OPEN_LEARNING_MODE_EVENT } from "~lib/learning-mode-events"
import { useAppStore } from "~stores"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.douyin.com/jingxuan*",
    "https://www.douyin.com/user/self*",
    "https://www.bilibili.com/video/*"
  ],
  run_at: "document_idle"
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.documentElement,
  insertPosition: "beforeend"
})

const findActiveVideo = (): HTMLVideoElement | null => {
  const videos = document.querySelectorAll<HTMLVideoElement>("video")

  // Prefer the currently playing video
  for (const video of videos) {
    if (
      !video.paused &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return video
    }
  }

  // Fallback: largest by video resolution
  let best: HTMLVideoElement | null = null
  let bestArea = 0
  for (const video of videos) {
    const area = video.videoWidth * video.videoHeight
    if (area > bestArea) {
      bestArea = area
      best = video
    }
  }

  return best
}

type VideoRestoreState = {
  video: HTMLVideoElement
  parent: HTMLElement
  styles: Record<string, string>
}

const AppContent = () => {
  const activeCaptionId = useAppStore((state) => state.activeCaptionId)
  const captionDisplayMode = useAppStore((state) => state.captionDisplayMode)
  const isOpenMainPanel = useAppStore((state) => state.isOpenMainPanel)
  const openMainPanel = useAppStore((state) => state.openMainPanel)
  const closeMainPanel = useAppStore((state) => state.closeMainPanel)
  const setActiveCaptionId = useAppStore((state) => state.setActiveCaptionId)
  const setCaptionDisplayMode = useAppStore(
    (state) => state.setCaptionDisplayMode
  )
  const activeCaption =
    demoCaptions.find((caption) => caption.id === activeCaptionId) ??
    demoCaptions[0]
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const videoRestoreRef = useRef<VideoRestoreState | null>(null)

  // Move page video into the panel when opened, restore when closed
  useEffect(() => {
    if (!isOpenMainPanel) {
      return
    }

    const raf = requestAnimationFrame(() => {
      const container = videoContainerRef.current
      if (!container) {
        return
      }

      const video = findActiveVideo()
      if (!video?.parentElement) {
        return
      }

      videoRestoreRef.current = {
        video,
        parent: video.parentElement,
        styles: {
          width: video.style.width,
          height: video.style.height,
          position: video.style.position,
          top: video.style.top,
          left: video.style.left,
          objectFit: video.style.objectFit
        }
      }

      video.style.position = "absolute"
      video.style.top = "0"
      video.style.left = "0"
      video.style.width = "100%"
      video.style.height = "100%"
      video.style.objectFit = "contain"

      container.appendChild(video)
    })

    return () => {
      cancelAnimationFrame(raf)

      // Restore video on close or unmount
      const restoreState = videoRestoreRef.current
      if (restoreState) {
        const { video, parent, styles } = restoreState
        Object.assign(video.style, styles)
        parent.appendChild(video)
        videoRestoreRef.current = null
      }
    }
  }, [isOpenMainPanel])

  useEffect(() => {
    window.addEventListener(OPEN_LEARNING_MODE_EVENT, openMainPanel)

    return () => {
      window.removeEventListener(OPEN_LEARNING_MODE_EVENT, openMainPanel)
    }
  }, [openMainPanel])

  useEffect(() => {
    if (!isOpenMainPanel) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMainPanel()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [closeMainPanel, isOpenMainPanel])

  return isOpenMainPanel ? (
    <MainPanel
      activeCaption={activeCaption}
      activeCaptionId={activeCaptionId}
      captionDisplayMode={captionDisplayMode}
      onCaptionChange={setActiveCaptionId}
      onCaptionDisplayModeChange={setCaptionDisplayMode}
      onExit={closeMainPanel}
      videoContainerRef={videoContainerRef}
    />
  ) : null
}

export default AppContent
