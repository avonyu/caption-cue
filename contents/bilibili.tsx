import iconBase64 from "data-base64:~assets/icon.png"
import cssText from "data-text:~style.css"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useRef, useState } from "react"

import { Menu } from "~components/Menu"
import { OPEN_LEARNING_MODE_EVENT } from "~lib/learning-mode-events"

export const config: PlasmoCSConfig = {
  matches: ["https://www.bilibili.com/video/*"],
  run_at: "document_idle"
}

const FULLSCREEN_SELECTOR = ".bpx-player-ctrl-full"

const getFullscreenButton = () => {
  const fullscreenButton = document.querySelector(FULLSCREEN_SELECTOR)

  return fullscreenButton instanceof HTMLElement ? fullscreenButton : null
}

const waitForFullscreenButton = () =>
  new Promise<HTMLElement>((resolve) => {
    const fullscreenButton = getFullscreenButton()

    if (fullscreenButton) {
      resolve(fullscreenButton)
      return
    }

    const observer = new MutationObserver(() => {
      const fullscreenButton = getFullscreenButton()

      if (!fullscreenButton) {
        return
      }

      observer.disconnect()
      resolve(fullscreenButton)
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    })
  })

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: await waitForFullscreenButton(),
  insertPosition: "afterend"
})

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const BilibiliVideoMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const menu = menuRef.current
      const path = event.composedPath()

      if (menu && !path.includes(menu)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative align-middle">
      <button
        type="button"
        title="打开幕听菜单"
        aria-label="打开幕听菜单"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        className="relative m-0 box-border inline-flex h-[22px] w-10 cursor-pointer items-center justify-center border-0 bg-transparent p-0 align-middle hover:opacity-[0.86]">
        <img
          className="pointer-events-none block h-5 w-5 object-contain"
          src={iconBase64}
          width={32}
          height={32}
          alt="icon"
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <Menu
          onEnterMainPanel={() => {
            setIsOpen(false)
            window.dispatchEvent(new CustomEvent(OPEN_LEARNING_MODE_EVENT))
          }}
        />
      ) : null}
    </div>
  )
}

export default BilibiliVideoMenu
