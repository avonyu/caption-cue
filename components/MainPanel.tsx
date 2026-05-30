import {
  BookOpenText,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Star,
  X
} from "lucide-react"

import { demoCaptions } from "~data/demo-captions"
import {
  captionModeLabels,
  type CaptionDisplayMode,
  type DemoCaption
} from "~types/caption"

type MainPanelProps = {
  activeCaption: DemoCaption
  activeCaptionId: string
  captionDisplayMode: CaptionDisplayMode
  onCaptionChange: (captionId: string) => void
  onCaptionDisplayModeChange: (mode: CaptionDisplayMode) => void
  onExit: () => void
  videoContainerRef: React.RefObject<HTMLDivElement | null>
}

export { demoCaptions, type CaptionDisplayMode, type DemoCaption }

export const MainPanel = ({
  activeCaption,
  activeCaptionId,
  captionDisplayMode,
  onCaptionChange,
  onCaptionDisplayModeChange,
  onExit,
  videoContainerRef
}: MainPanelProps) => (
  <section
    aria-label="学习模式"
    className="fixed inset-0 z-[200] flex flex-col bg-[#070a09] text-[#dbe2df]">
    <div className="flex h-full w-full overflow-hidden">
      <main className="flex-1 relative border-[#222b28] max-[980px]:border-r-0">
        {/* Video area */}
        <div className="h-[70%] relative m-4 mb-0 min-h-[300px] overflow-hidden rounded border border-[#252d2b] bg-[#070a09]">
          {/* 视频容器 — 页面 video 元素会被移入此处 */}
          <div ref={videoContainerRef} className="absolute inset-0" />

          {/* subtitle overlay */}
          {/*<div className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid w-[min(520px,calc(100%-60px))] -translate-x-1/2 -translate-y-1/2 gap-2 rounded-lg border border-white/15 bg-[#070a09]/75 p-5 text-center text-white">
            <span className="text-[12px] font-bold uppercase text-[#f2c65d]">
              Vlog / English Input
            </span>
            <strong className="text-[24px] leading-snug">
              {activeCaption.text}
            </strong>
          </div>*/}
        </div>

        <div className="h-[30%] flex flex-col">
          {/* Captions */}
          <div className="flex-1 flex flex-col items-center gap-2 px-4 py-5 text-center">
            {captionDisplayMode !== "chinese" ? (
              <p className="m-0 max-w-[860px] text-[26px] leading-snug text-[#e3e8e6]">
                {activeCaption.text}
              </p>
            ) : null}
            {captionDisplayMode !== "english" ? (
              <p className="m-0 text-[20px] text-[#b4bdb8]">
                {activeCaption.translation}
              </p>
            ) : null}
          </div>

          {/* Controls */}
          <div className="w-full grid content-center gap-3 border-t border-[#27302d] bg-[#0f1413] px-4 py-3">
            <div className="grid grid-cols-[50px_minmax(0,1fr)_50px] items-center gap-2.5 text-[12px] text-[#9ba7a2]">
              <span>{activeCaption.shortTime}</span>
              <div className="h-1 overflow-hidden rounded-full bg-[#303a37]">
                <span className="block h-full w-[28%] bg-[#f2c65d]" />
              </div>
              <span>01:02</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#303b38] bg-[#151c1a] px-3 text-[13px] text-[#e4ebe7]">
                <SkipBack className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="播放或暂停"
                className="inline-grid h-11 w-11 place-items-center rounded-full border border-[#e9f0ed] bg-[#e9f0ed] text-[#111817]">
                <Play className="h-5 w-5 fill-current" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#303b38] bg-[#151c1a] px-3 text-[13px] text-[#e4ebe7]">
                <SkipForward className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <aside className="w-80 flex-shrink-0 min-h-0 border-l bg-[#0d1110] text-[#d8dfdc] max-[980px]:hidden">
        <header className="flex items-start justify-between gap-3 border-b border-[#27302d] p-[18px]">
          <div>
            <p className="m-0 text-[11px] font-bold uppercase text-[#f2c65d]">
              字幕列表
            </p>
            <h2 className="m-0 mt-1 text-[18px] font-bold text-[#f2f6f4]">
              所有时间段字幕
            </h2>
          </div>
          <button
            type="button"
            title="退出学习模式"
            aria-label="退出学习模式"
            onClick={onExit}
            className="inline-grid h-8 w-8 place-items-center rounded border border-[#303b38] bg-[#151c1a] text-[#e4ebe7] hover:bg-[#202a27]">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-col max-h-[calc(100vh-74px)] gap-2 overflow-auto p-3">
          {demoCaptions.map((caption) => {
            const isActive = caption.id === activeCaptionId

            return (
              <button
                key={caption.id}
                type="button"
                onClick={() => onCaptionChange(caption.id)}
                className={`flex min-h-[86px] gap-2 rounded-lg border border-transparent p-3 text-left ${
                  isActive
                    ? "border-[#f2c65d]/45 bg-[#f2c65d]/10"
                    : "bg-transparent hover:border-white/10 hover:bg-white/5"
                }`}>
                <span
                  className={`text-[12px] ${
                    isActive ? "text-[#f8d873]" : "text-[#8e9b96]"
                  }`}>
                  {caption.shortTime}
                </span>
                <span className="flex flex-col gap-1 min-w-0">
                  <strong
                    className={`text-[13px] leading-snug ${
                      isActive ? "text-[#f8d873]" : "text-[#d8dfdc]"
                    }`}>
                    {caption.text}
                  </strong>
                  <em className="text-[12px] not-italic text-[#919d98]">
                    {caption.translation}
                  </em>
                </span>
              </button>
            )
          })}
        </div>
      </aside>
    </div>
  </section>
)
