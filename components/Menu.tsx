import {
  BookOpenText,
  Captions,
  ChevronRight,
  Clock3,
  Heart,
  Info,
  Languages,
  MoreHorizontal,
  PanelBottom,
  Settings,
  Sparkles,
  Text as TextIcon,
  WandSparkles
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type MenuItem = {
  Icon: LucideIcon
  label: string
  value?: string
  iconClassName?: string
}

const menuItems: MenuItem[] = [
  { Icon: Clock3, label: "临时开启", value: "Alt+C" },
  {
    Icon: Captions,
    label: "AI 字幕",
    iconClassName: "rounded border border-[#6a80ff] text-[#75e2ff]"
  },
  { Icon: TextIcon, label: "主字幕", value: "English" },
  { Icon: Languages, label: "翻译字幕", value: "中文" },
  { Icon: Sparkles, label: "AI 总结" },
  { Icon: Heart, label: "收藏视频" },
  { Icon: WandSparkles, label: "翻译引擎", value: "DeepSeek" },
  { Icon: PanelBottom, label: "字幕显示", value: "双语字幕" },
  { Icon: Settings, label: "字幕样式" },
  { Icon: MoreHorizontal, label: "更多功能" }
]

type MenuProps = {
  onEnterMainPanel: () => void
}

export const Menu = ({ onEnterMainPanel }: MenuProps) => (
  <div
    role="menu"
    className="absolute bottom-[calc(100%+12px)] right-0 z-[2147483647] w-[344px] rounded-lg border border-white/15 bg-[#252220] p-2.5 text-[13px] text-[#f2f0ee] shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
    <div className="grid min-h-[38px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2 pb-2 pt-0.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="inline-grid h-[22px] w-[22px] place-items-center rounded border border-[#c6c2bc] text-[#f2f0ee]">
          <Captions className="h-[14px] w-[14px]" aria-hidden="true" />
        </span>
        <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold">
          CaptionCue 幕听
        </strong>
        <span className="inline-grid h-4 w-4 place-items-center rounded-full border border-[#8d8984] text-[#aaa5a0]">
          <Info className="h-[11px] w-[11px]" aria-hidden="true" />
        </span>
      </div>
      <button
        type="button"
        aria-label="启用幕听"
        className="relative h-6 w-[42px] rounded-full border-0 bg-[#44403c] p-0">
        <span className="absolute left-[21px] top-[3px] h-[18px] w-[18px] rounded-full bg-[#f6f3ef]" />
      </button>
    </div>

    {/*{menuItems.map((item) => (
      <button
        key={item.label}
        type="button"
        role="menuitem"
        className="grid min-h-[45px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-[9px] border-0 border-t border-solid border-white/10 bg-transparent px-2 py-0 text-left text-[#f2f0ee] hover:rounded-md hover:bg-white/10">
        <span
          className={`inline-grid h-6 w-6 place-items-center text-sm font-extrabold text-[#ece8e3] ${
            item.iconClassName ?? ""
          }`}>
          <item.Icon className="h-[15px] w-[15px]" aria-hidden="true" />
        </span>
        <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold">
          {item.label}
        </strong>
        {item.value ? (
          <em className="whitespace-nowrap text-[12px] not-italic text-[#f2f0ee]">
            {item.value}
          </em>
        ) : null}
        <ChevronRight
          className="h-[15px] w-[15px] text-[#aaa5a0]"
          aria-hidden="true"
        />
      </button>
    ))}*/}

    <button
      type="button"
      role="menuitem"
      onClick={onEnterMainPanel}
      className="mt-2.5 grid min-h-10 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[9px] rounded-lg border border-solid border-[#57524e] bg-[#343230] px-2.5 py-0 text-left text-[#f2f0ee] hover:border-[#7f5dff] hover:bg-[#3b3546]">
      <span className="inline-grid h-6 w-6 place-items-center text-sm text-[#f8d873]">
        <BookOpenText className="h-[15px] w-[15px]" aria-hidden="true" />
      </span>
      <strong className="justify-self-center text-sm font-bold">
        学习模式
      </strong>
      <span className="inline-grid h-4 w-4 place-items-center rounded-full border border-[#8d8984] text-[#aaa5a0]">
        <Info className="h-[11px] w-[11px]" aria-hidden="true" />
      </span>
    </button>
  </div>
)
