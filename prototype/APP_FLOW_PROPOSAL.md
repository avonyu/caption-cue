# CaptionCue - 幕听浏览器插件方案

## 1. 产品目标

构建一个名为“CaptionCue - 幕听”的浏览器插件应用，帮助用户基于在线视频字幕学习英语。插件需要能够识别视频页面、提取或生成字幕、按字幕时间戳控制视频播放进度，并支持在字幕片段之间跳转、循环、翻译优化、时间校对和 AI 辅助学习。

核心体验是：用户打开视频页面后，插件自动识别视频和字幕，展示一个可交互的字幕学习面板。用户点击某句字幕即可跳转到对应时间点，也可以按句循环、查看翻译、AI 解释、生词和语法分析。

指定技术栈：

1. Plasmo：浏览器扩展开发框架。
2. TypeScript：核心逻辑、数据模型、扩展消息协议。
3. React：Popup、Side Panel、页面浮层和设置页 UI。
4. Zustand：前端状态管理，维护字幕、播放、AI 任务和学习状态。
5. Tailwind CSS：React UI 的样式系统，负责快速构建响应式布局、状态样式和主题化界面。

## 2. 目标用户场景
  
1. 用户在抖音、YouTube、Bilibili、Coursera、Udemy 或其他网页观看英文视频。
2. 插件检测到页面中的视频元素，尝试读取原始字幕轨道。
3. 如果页面已有字幕，插件解析字幕并生成按句切分的字幕列表。
4. 如果页面没有字幕，插件自动提取视频音频，使用 AI 将音频转换为文本，并格式化为标准字幕格式后应用到当前视频。
5. 插件根据字幕时间戳控制视频播放，支持点击字幕跳转、上一句、下一句、单句循环、区间循环。
6. AI 对字幕进行翻译、润色、断句、校对时间轴，并生成学习材料。

## 3. 整体架构

应用由四部分组成：

1. 浏览器扩展前端
   - 使用 Plasmo 管理扩展入口、构建和 Manifest V3 配置。
   - Popup：React 实现，提供快速入口、当前视频状态、最近学习记录。
   - Content Script：Plasmo content script 注入到视频页面，负责识别视频、读取字幕、控制播放、挂载学习面板。
   - Side Panel 或 Floating Panel：React 实现主要学习界面，展示字幕、翻译、AI 解释和控制按钮。
   - Options Page：React 实现，配置 AI 服务、快捷键、字幕显示偏好、隐私设置。
   - Tailwind CSS：用于组件级样式、暗色学习模式、响应式布局和常用交互状态。

2. 页面适配层
   - 统一封装不同网站的视频识别逻辑。
   - 识别 `video` 元素。
   - 读取 `<track>` 字幕、平台接口字幕，或在无字幕时触发音频提取和 AI 转写。
   - 对无法直接读取字幕的平台，统一降级为音频提取转写流程。
   - 首批支持抖音页面 `https://www.douyin.com/*`，针对短视频流、详情页、搜索页和用户主页做动态视频识别。

3. 字幕处理引擎
   - 字幕解析：支持 VTT、SRT、ASS、JSON 字幕。
   - 字幕标准化：统一为内部 CaptionSegment 数据结构。
   - 字幕切分：按时间、标点、语义和最大长度切成学习句。
   - 时间校对：修正字幕偏移、重叠、过短、过长、断句不自然等问题。
   - 双语对齐：英文字幕与中文翻译按句对齐。
   - 字幕生成：将 AI 转写结果格式化为标准 WebVTT，并注入为视频可使用的字幕轨道。

4. AI 服务层
   - 本地或云端 API 代理。
   - 支持用户指定大模型供应商和模型，例如 DeepSeek、OpenAI、通义千问、豆包、Claude 等。
   - 文本大模型用于翻译优化、字幕断句、学习解释、时间校对建议等。
   - 语音识别模型用于音频转文字，和文本大模型分开配置。
   - 完成语音转文字、翻译优化、语义断句、时间轴修复、词汇解释、语法分析、例句生成。
   - 可根据成本和隐私设置选择是否上传音频、字幕或上下文。

5. Zustand 状态层
   - 在 React UI 中维护当前视频、字幕列表、当前字幕、循环模式、AI 任务状态。
   - 将短期 UI 状态放在 Zustand store。
   - 将持久化数据同步到 `chrome.storage.local` 或 IndexedDB。
   - Content Script 与 Side Panel 之间通过 Plasmo messaging 同步必要状态。

## 4. 核心数据模型

### VideoContext

```ts
type VideoContext = {
  pageUrl: string;
  site: string;
  title: string;
  duration: number;
  videoElementId?: string;
  sourceUrl?: string;
};
```

### CaptionSegment

```ts
type CaptionSegment = {
  id: string;
  index: number;
  startMs: number;
  endMs: number;
  text: string;
  normalizedText: string;
  translation?: string;
  optimizedTranslation?: string;
  words?: WordItem[];
  notes?: LearningNote[];
  confidence?: number;
  source: "native" | "platform" | "ai-transcribed" | "manual-corrected";
};
```

### LearningState

```ts
type LearningState = {
  currentSegmentId?: string;
  playbackMode: "normal" | "segment-loop" | "range-loop" | "shadowing";
  captionDisplayMode: "english" | "chinese" | "bilingual";
  loopRange?: {
    startSegmentId: string;
    endSegmentId: string;
  };
  showTranslation: boolean;
  playbackRate: number;
  completedSegmentIds: string[];
  difficultSegmentIds: string[];
};
```

### AiProviderConfig

```ts
type AiProviderType =
  | "deepseek"
  | "openai"
  | "qwen"
  | "doubao"
  | "claude"
  | "custom-openai-compatible";

type AiTaskType =
  | "transcribe-audio"
  | "optimize-translation"
  | "split-caption"
  | "align-timeline"
  | "generate-learning-notes";

type AiProviderConfig = {
  provider: AiProviderType;
  baseUrl?: string;
  apiKeyRef: string;
  textModel: string;
  speechModel?: string;
  embeddingModel?: string;
  enabledTasks: AiTaskType[];
  requestTimeoutMs: number;
};
```

配置原则：

1. DeepSeek 等文本大模型优先用于翻译优化、语义断句、语法讲解和学习笔记。
2. 如果指定模型不支持语音转文字，需要额外配置语音识别模型。
3. 支持 OpenAI-compatible 接口，便于接入 DeepSeek 或其他兼容 `/chat/completions` 的服务。
4. API Key 只保存在本地安全存储或用户自建代理服务中，不进入 content script。
5. 每类 AI 任务都可以独立指定模型，避免用同一个模型处理所有任务。

### Zustand Store 划分

建议拆分为多个 store，避免单一 store 过大：

```ts
type VideoStore = {
  videoContext?: VideoContext;
  currentTimeMs: number;
  durationMs: number;
  isPlaying: boolean;
  playbackRate: number;
};

type CaptionStore = {
  segments: CaptionSegment[];
  activeSegmentId?: string;
  selectedSegmentId?: string;
  captionStatus: "idle" | "detecting" | "transcribing" | "ready" | "failed";
};

type LearningStore = LearningState & {
  setPlaybackMode: (mode: LearningState["playbackMode"]) => void;
  toggleTranslation: () => void;
  markCompleted: (segmentId: string) => void;
  markDifficult: (segmentId: string) => void;
};

type AiTaskStore = {
  tasks: AiTask[];
  enqueueTask: (task: AiTask) => void;
  cancelTask: (taskId: string) => void;
};
```

原则：

1. Content Script 负责真实 video 控制，不直接依赖 React UI。
2. React UI 通过消息调用 Content Script 的播放器能力。
3. Zustand 负责 UI 和学习状态，不把大音频 Blob 放进 store。
4. 字幕文本可放在 store，长视频完整字幕和 AI 结果需要落 IndexedDB。

## 5. 插件运行流程

### 5.1 页面加载与视频识别

1. Content Script 在页面加载后启动。
2. 扫描页面中的 `video` 元素。
3. 如果存在多个视频，选择正在播放、面积最大或可见性最高的视频。
4. 监听 SPA 路由变化、视频源变化、DOM 变化。
5. 生成 VideoContext，并通知扩展后台当前页面可用。
6. 如果当前域名是 `www.douyin.com`，启用抖音页面适配器。

处理逻辑：

```text
页面加载
  -> 扫描 video 元素
  -> 绑定 video 事件：play、pause、timeupdate、seeked、ratechange
  -> 识别平台类型
  -> 尝试加载字幕
  -> 初始化学习面板
```

Plasmo 落地方式：

1. 使用 `contents/` 编写视频页面 content script。
2. 使用 `sidepanel.tsx` 或对应 Plasmo 页面实现字幕学习面板。
3. 使用 `popup.tsx` 实现插件入口。
4. 使用 `options.tsx` 实现设置页。
5. 使用 `background/messages/` 或 Plasmo messaging 处理 UI 与 content script、background 之间的调用。
6. 使用 `background.ts` 管理 AI 队列、缓存索引和跨页面任务。

### 5.2 字幕获取流程

字幕来源按优先级处理：

1. 页面原生字幕
   - 读取 `<track>`。
   - 请求 VTT/SRT 文件。
   - 解析为 CaptionSegment。

2. 平台字幕接口
   - 对 YouTube、Bilibili 等平台编写 Adapter。
   - 优先获取官方字幕，其次获取自动字幕。

3. AI 生成字幕
   - 当页面没有字幕、平台字幕不可用，或原始字幕质量过低时触发。
   - 提取音频片段或使用浏览器录制能力。
   - 分段上传给语音识别服务。
   - 返回带时间戳的转写文本。
   - 经过断句、时间校对和格式化后生成标准 WebVTT 字幕。
   - 将生成的字幕应用到当前视频，并进入正常学习流程。

字幕获取状态：

```text
idle
  -> detecting
  -> found-native | found-platform | require-transcription
  -> extracting-audio
  -> transcribing
  -> formatting-caption
  -> parsing
  -> normalizing
  -> ready
```

不支持用户手动导入字幕文件。无字幕场景统一由插件自动完成音频提取和 AI 转写，保证用户流程一致。

### 5.3 字幕解析与标准化

处理步骤：

1. 解析不同字幕格式。
2. 清理 HTML 标签、样式标签、重复空格、音效描述。
3. 修正常见时间问题：
   - 开始时间晚于结束时间。
   - 相邻字幕重叠。
   - 字幕间隔过短。
   - 单句持续时间异常。
4. 合并过短片段。
5. 拆分过长片段。
6. 生成稳定的 segment id。

标准化原则：

1. 内部统一使用毫秒时间戳。
2. 字幕文本保留原文，同时提供 normalizedText。
3. 所有 AI 处理结果都作为增量字段存储，不覆盖原始字幕。
4. 所有自动修正都保留 revision 记录，便于撤销。
5. AI 转写生成的字幕也必须先转换为同一套 CaptionSegment，再生成标准字幕轨道。

### 5.4 字幕切分逻辑

切分目标是让每个片段适合作为学习单位，而不是完全依赖原始字幕行。

规则优先级：

1. 时间边界不可越过太多原始字幕范围。
2. 优先按完整句号、问号、感叹号切分。
3. 其次按分号、冒号、连接词、停顿切分。
4. 单个片段建议 3 到 18 个英文词。
5. 超过 25 个词必须尝试拆分。
6. 少于 2 个词且时长很短的片段可与相邻片段合并。
7. AI 可参与语义断句，但最终结果需要满足时间轴约束。

示例：

```text
原字幕：
00:10.000 - 00:15.000
I was going to tell you the truth but I didn't know how you would react.

切分后：
00:10.000 - 00:12.300
I was going to tell you the truth,

00:12.300 - 00:15.000
but I didn't know how you would react.
```

### 5.5 视频播放控制

插件通过 video 元素控制播放：

1. 点击字幕：
   - 设置 `video.currentTime = segment.startMs / 1000`。
   - 可选自动播放。

2. 上一句 / 下一句：
   - 根据 currentTime 找到当前 segment。
   - 跳到相邻 segment。

3. 单句循环：
   - 当前时间到达 `segment.endMs` 后回到 `segment.startMs`。
   - 为避免频繁 seek，允许 80 到 150ms 容忍区间。

4. 区间循环：
   - 用户选择起始句和结束句。
   - 播放到区间末尾后跳回区间开始。

5. 跟读模式：
   - 播放一句。
   - 自动暂停。
   - 等待用户跟读或录音。
   - 用户确认后播放下一句。

6. 字幕显示模式：
   - 纯英文：只显示英文字幕，支持单词悬浮和单词详情。
   - 纯中文：只显示中文翻译，适合快速理解内容。
   - 中英双语：同时显示英文原文和中文翻译，作为默认学习模式。
   - 模式切换只影响展示层，不改变原始 CaptionSegment 和翻译缓存。

核心逻辑：

```text
video timeupdate
  -> 根据 currentTime 定位当前字幕
  -> 高亮当前字幕
  -> 如果处于循环模式且超过结束时间
       -> seek 到循环开始时间
  -> 同步学习状态
```

### 5.6 AI 处理流程

AI 功能不应一次性全部执行，建议按需触发和缓存。

#### 音频提取与字幕生成

输入：

1. 当前视频的音频片段。
2. 已知或自动检测的视频语言。
3. 可选上下文：标题、章节、页面描述、平台元数据。

输出：

1. 英文转写文本。
2. 句级或词级时间戳。
3. 置信度。
4. 标准 WebVTT 字幕文本。
5. 内部 CaptionSegment 列表。

处理策略：

1. 优先复用浏览器可访问的媒体流或视频源音频。
2. 长视频按 5 到 10 分钟切片。
3. 切片之间保留 1 到 2 秒重叠，避免边界丢词。
4. 转写后合并重叠片段。
5. 使用标点恢复和语义断句生成可学习的字幕句子。
6. 将句子格式化为 WebVTT。
7. 通过动态创建 `TextTrack` 或注入 `track` 的方式应用到视频。
8. 低置信度片段标记为待校对，但不阻断字幕使用。
9. 如果当前指定的大模型不支持语音识别，则使用单独的 speech provider 完成转写，再把转写文本交给 DeepSeek 等文本模型做断句、翻译和校对。

无字幕视频处理流程：

```text
检测不到字幕
  -> 提取视频音频
  -> 按时间窗口切片
  -> AI 转写音频为文本和时间戳
  -> 合并切片边界
  -> 标点恢复和语义断句
  -> 时间轴校对
  -> 生成 CaptionSegment
  -> 导出 WebVTT
  -> 应用到当前 video
  -> 展示字幕学习面板
```

#### 翻译优化

输入：

1. 英文字幕片段。
2. 相邻上下文。
3. 用户目标语言。
4. 学习水平。

输出：

1. 自然中文翻译。
2. 直译辅助。
3. 重点表达解释。

处理策略：

1. 保留英文原句。
2. 中文翻译优先表达自然，而不是逐词直译。
3. 对口语、省略、俚语、固定搭配额外解释。
4. 对专有名词保持一致翻译。
5. 当用户指定 DeepSeek 等大模型时，翻译优化任务通过统一的 LLM Provider 接口调用对应模型。

#### 时间校对

输入：

1. 原始字幕时间轴。
2. 音频转写结果。
3. 可选词级时间戳。

输出：

1. 修正后的 startMs 和 endMs。
2. 每个片段的修正原因。
3. 校对置信度。

处理策略：

1. 如果整条字幕整体偏移，先计算全局 offset。
2. 如果局部漂移，再按窗口做局部 offset。
3. 不直接覆盖原始时间，生成一个 corrected track。
4. 用户可切换“原始时间轴”和“AI 校对时间轴”。
5. 文本大模型只负责给出时间校对建议或异常判断；精确时间戳仍优先由语音识别的词级时间戳和规则算法决定。

#### 学习辅助

可为每个片段生成：

1. 关键词和短语。
2. 语法结构说明。
3. 自然表达改写。
4. 适合跟读的重音提示。
5. Cloze 填空练习。
6. 听写模式题目。

### 5.7 学习面板交互

主面板建议分为三栏或两栏：

1. 视频同步字幕列表
   - 当前句高亮。
   - 点击跳转。
   - 收藏困难句。
   - 显示完成状态。

2. 当前句学习区
   - 英文原文。
   - 中文翻译。
   - AI 解释。
   - 单词和短语。
   - 跟读、听写、循环按钮。

3. 控制区
   - 上一句 / 下一句。
   - 播放 / 暂停。
   - 循环当前句。
   - 选择区间循环。
   - 播放速度。
   - 显示 / 隐藏翻译。

建议快捷键：

| 快捷键 | 功能 |
| --- | --- |
| Alt + J | 上一句 |
| Alt + K | 播放 / 暂停 |
| Alt + L | 下一句 |
| Alt + R | 循环当前句 |
| Alt + T | 显示 / 隐藏翻译 |
| Alt + S | 收藏困难句 |

### 5.8 单词级学习交互

用户在字幕学习时，可以对当前字幕句中的单词进行精细学习。

交互流程：

```text
鼠标悬浮字幕单词
  -> 暂停当前 video
  -> 高亮该单词
  -> 保持当前字幕上下文

点击字幕单词
  -> 打开单词详情面板
  -> 展示音标、读音、词性、中文解释、上下文释义
  -> 展示来自当前字幕句的例句
  -> 可选调用 AI 生成更详细的用法说明
```

处理逻辑：

1. 字幕渲染时将英文句子切分为 word token，但保留原始字幕文本。
2. `mouseenter` 触发 `video.pause()`，并记录暂停来源为 `word-hover`。
3. `mouseleave` 不强制自动播放，避免用户正在查看单词时视频突然继续；是否自动恢复播放可作为设置项。
4. 点击单词后，优先查询本地词典缓存。
5. 本地无缓存时，调用指定文本大模型生成上下文相关解释。
6. 单词详情结果写入 IndexedDB，缓存 key 包含 `word + sentence + provider + model`。
7. 读音优先使用浏览器 SpeechSynthesis 或本地音频词典；后续可接入第三方词典音频。

单词详情面板字段：

```ts
type WordDetail = {
  word: string;
  lemma: string;
  phonetic?: string;
  partOfSpeech?: string;
  definitions: string[];
  contextMeaning: string;
  exampleSentence: string;
  pronunciationAudioUrl?: string;
  source: "local-dictionary" | "ai-generated" | "speech-synthesis";
};
```

### 5.9 抖音页面适配流程

抖音网页版通常是动态加载页面，视频可能出现在推荐流、搜索结果、用户主页、视频详情页或弹窗中。适配时不要依赖固定 DOM 结构，应以运行时视频元素和播放状态为准。

支持范围：

1. 域名：`https://www.douyin.com/*`。
2. 页面类型：推荐流、搜索页、用户主页、视频详情页。
3. 视频类型：普通短视频优先；直播、图文、合集、广告视频先做识别和跳过，不作为 MVP 核心场景。

抖音适配器职责：

1. 检测当前页面是否为抖音页面。
2. 扫描所有 `video` 元素。
3. 在多个视频中选择当前主视频：
   - 正在播放的视频优先。
   - 可见面积最大的视频优先。
   - 距离视口中心最近的视频优先。
   - 详情页弹层中的视频优先于背景列表视频。
4. 监听视频切换：
   - `MutationObserver` 监听 DOM 增删。
   - `popstate` 和 History API patch 监听 SPA 路由变化。
   - `play`、`pause`、`loadedmetadata`、`durationchange` 监听视频状态变化。
5. 为每个视频生成稳定的 videoFingerprint：
   - 优先使用页面 URL、视频标题、作者、时长。
   - 如果 URL 不稳定，补充 video src、poster、页面可见文案生成 hash。
6. 读取页面可见文案作为上下文：
   - 视频标题。
   - 作者昵称。
   - 描述文案。
   - 话题标签。
   - 评论不作为默认上下文，避免噪声过大。

抖音字幕处理策略：

1. 优先检测页面是否存在可访问的字幕轨道或平台字幕文本。
2. 如果没有字幕，直接进入音频提取和 AI 转写流程。
3. AI 转写结果生成 WebVTT 后，应用到当前主视频。
4. 用户切换到下一条短视频时：
   - 暂停当前视频的字幕任务。
   - 保存已生成的字幕和学习状态。
   - 对新主视频重新检测字幕。
5. 如果用户快速连续刷视频，转写任务需要防抖：
   - 视频稳定停留 1.5 到 3 秒后再启动音频提取。
   - 用户离开当前视频后取消未开始的任务。
   - 已完成的字幕结果写入缓存，避免重复转写。

抖音无字幕处理流程：

```text
进入 www.douyin.com 页面
  -> 启用 DouyinAdapter
  -> 识别当前主 video
  -> 提取标题、作者、描述作为 AI 上下文
  -> 检测不到可用字幕
  -> 等待视频稳定停留
  -> 提取当前视频音频
  -> AI 转写并生成 CaptionSegment
  -> 格式化为 WebVTT
  -> 应用到当前 video
  -> 打开字幕学习面板
```

抖音适配风险：

1. 页面 DOM class 名可能频繁变化，因此适配器不能依赖具体 class。
2. 视频源可能使用 blob、MSE 或跨域资源，音频提取可能失败。
3. 页面可能存在预加载视频，不能把预加载视频误判为当前学习视频。
4. 短视频切换频繁，需要避免后台 AI 任务堆积。
5. 如果视频包含原生硬字幕但没有文本字幕，仍然需要走音频转写；后续可考虑 OCR 辅助，但不纳入 MVP。

## 6. 状态管理与缓存

### 本地存储内容

1. 视频与字幕的关联关系。
2. 原始字幕和处理后的字幕。
3. AI 翻译、解释、时间校对结果。
4. 用户学习进度。
5. 用户收藏和困难句。
6. 插件配置和 AI API 设置。

### 推荐存储方式

1. `chrome.storage.local`：配置、轻量学习状态。
2. IndexedDB：字幕、AI 结果、长文本缓存。
3. 可选云同步：用户登录后同步学习记录。

缓存 key 建议：

```text
videoFingerprint = hash(pageUrl + videoTitle + duration)
captionTrackKey = hash(videoFingerprint + language + source + version)
aiResultKey = hash(captionSegmentId + taskType + promptVersion + model)
```

## 7. 后台任务队列

AI 处理可能耗时，建议设计任务队列：

任务类型：

1. `fetch_caption`
2. `parse_caption`
3. `split_caption`
4. `translate_caption`
5. `transcribe_audio`
6. `align_timeline`
7. `generate_learning_notes`

模型路由策略：

| 任务 | 推荐模型类型 | 示例 |
| --- | --- | --- |
| `transcribe_audio` | 语音识别模型 | Whisper、云厂商 ASR、其他 speech-to-text 服务 |
| `split_caption` | 文本大模型 | DeepSeek、OpenAI、Qwen、Doubao |
| `translate_caption` | 文本大模型 | DeepSeek、OpenAI、Qwen、Claude |
| `align_timeline` | 规则算法 + 词级时间戳 + 文本大模型辅助 | ASR 词级时间戳 + DeepSeek 判断异常 |
| `generate_learning_notes` | 文本大模型 | DeepSeek、OpenAI、Qwen、Claude |

任务状态：

```text
pending
  -> running
  -> succeeded
  -> failed
  -> cancelled
```

队列策略：

1. 当前播放附近的字幕优先处理。
2. 用户点击的字幕优先处理。
3. 翻译和解释可懒加载。
4. 长视频任务分片执行，避免阻塞浏览器。
5. 失败任务允许重试，但限制次数。

## 8. 异常处理

需要重点处理：

1. 页面没有 video 元素。
2. 页面有多个 video 元素。
3. 字幕跨域无法直接请求。
4. 平台接口变化。
5. 字幕时间戳与视频不匹配。
6. AI 处理超时或额度不足。
7. 用户切换视频后旧任务仍在运行。
8. SPA 页面路由变化后上下文失效。
9. 视频广告阶段误识别。
10. 用户隐私设置禁止上传音频。
11. 页面禁止直接访问视频源，导致音频提取失败。
12. 视频使用 DRM、加密媒体或跨域限制，无法转写。

处理原则：

1. 页面适配失败时降级为音频提取和 AI 转写。
2. 如果音频提取失败，明确提示当前视频无法自动生成字幕。
3. AI 失败不影响已有字幕的基础跳转功能。
3. 所有耗时任务展示状态和取消入口。
4. 对 AI 生成的数据明确标记来源。

## 9. 隐私与权限

建议浏览器权限：

1. `activeTab`：访问当前视频页面。
2. `storage`：保存配置和学习记录。
3. `scripting`：注入内容脚本。
4. `sidePanel`：展示学习面板。
5. 可选 host permissions：仅对用户启用的网站授权。
6. 抖音适配需要申请或按需授予 `https://www.douyin.com/*` 页面访问权限。

隐私策略：

1. 默认优先使用页面已有字幕，不上传音频。
2. 页面无字幕时，如果用户启用自动生成字幕，需要明确提示音频片段会发送给 AI 服务。
3. 用户可以选择关闭“无字幕时自动转写”，关闭后无字幕视频不生成字幕。
4. API Key 优先保存在本地。
5. 提供清理当前视频缓存和全部缓存的入口。

## 10. MVP 范围

第一阶段只做最小可用闭环：

1. 识别页面 video 元素。
2. 自动读取页面原生字幕或平台字幕。
3. 页面无字幕时，自动提取视频音频并调用 AI 生成字幕。
4. 将 AI 结果格式化为 WebVTT，并应用到当前视频。
5. 解析字幕并展示字幕列表。
6. 点击字幕跳转视频进度。
7. 当前字幕高亮。
8. 上一句、下一句、单句循环。
9. 手动调整字幕整体偏移。
10. 调用 AI 优化当前句翻译。
11. 本地保存字幕和学习进度。
12. 支持抖音 `https://www.douyin.com/*` 页面的视频识别、字幕生成和字幕跳转。

暂不做：

1. 全平台自动字幕抓取。
2. 复杂的词级时间轴对齐。
3. 云同步和账号系统。
4. 发音评分。
5. 用户手动导入字幕文件。
6. 抖音直播、图文、广告视频的完整适配。

## 11. 第二阶段能力

1. 适配 YouTube 和 Bilibili 字幕接口。
2. 优化长视频音频切片、断点续传和转写缓存。
3. 批量翻译整段字幕。
4. AI 语义断句。
5. AI 时间轴校对。
6. 生词本和困难句复习。
7. 跟读模式和听写模式。
8. 区间循环。
9. 字幕导出。
10. 增强抖音适配：支持搜索结果批量缓存、用户主页学习列表、短视频连续学习队列。

## 12. 第三阶段能力

1. 词级时间戳。
2. 发音录音与 AI 反馈。
3. 用户学习数据分析。
4. 多设备同步。
5. 课程化学习路径。
6. 插件与 Web App 账号体系打通。

## 13. 推荐技术路线

浏览器扩展：

1. Plasmo。
2. Manifest V3。
3. TypeScript。
4. React 构建 Popup、Side Panel、Options Page 和页面浮层。
5. Tailwind CSS 构建 UI 样式、暗色主题和响应式布局。
6. Zustand 管理 React UI 状态和学习状态。
7. Plasmo Content Script 控制 video 和页面字幕。
8. Background Service Worker 管理 AI 任务、缓存和消息。

建议目录结构：

```text
src/
  background/
    index.ts
    ai-task-queue.ts
    storage.ts
  contents/
    video-detector.ts
    douyin-adapter.ts
    video-controller.ts
    caption-injector.ts
  components/
    CaptionList.tsx
    CurrentSegmentPanel.tsx
    PlaybackControls.tsx
    AiTaskStatus.tsx
  stores/
    video-store.ts
    caption-store.ts
    learning-store.ts
    ai-task-store.ts
  lib/
    caption/
      parse-vtt.ts
      format-vtt.ts
      normalize-segments.ts
      split-segments.ts
      align-timeline.ts
    ai/
      transcribe-audio.ts
      optimize-translation.ts
      generate-notes.ts
    platform/
      adapter-types.ts
      douyin.ts
  popup.tsx
  sidepanel.tsx
  options.tsx
  style.css
tailwind.config.js
postcss.config.js
```

字幕处理：

1. 自研轻量 SRT/VTT parser，或使用成熟字幕解析库。
2. 内部统一 CaptionSegment。
3. 使用 IndexedDB 存储字幕和 AI 结果。

AI 能力：

1. 翻译优化和学习解释：文本模型。
2. 字幕转写：语音识别模型。
3. 时间校对：优先用词级时间戳和规则算法，AI 用于辅助判断。

开发顺序：

1. 搭建扩展基础结构。
2. 打通 content script 与 side panel 通信。
3. 建立 Zustand store：video、caption、learning、aiTask。
4. 实现 video 控制器。
5. 实现 DouyinAdapter，支持抖音主视频识别和 SPA 切换监听。
6. 实现原生字幕和平台字幕读取。
7. 实现无字幕时的音频提取、AI 转写和 WebVTT 生成。
8. 实现字幕解析和展示。
9. 实现字幕点击跳转和高亮同步。
10. 实现单句循环和快捷键。
11. 接入 AI 翻译当前句。
12. 加入缓存和学习状态。
13. 再扩展平台字幕抓取和 AI 批处理。

Plasmo 开发约束：

1. Content Script 只做页面探测、视频控制和必要 DOM 注入。
2. AI API 调用优先放在 Background，避免页面上下文泄露密钥。
3. API Key 不进入 content script。
4. React UI 不直接操作页面 video，统一通过消息调用 video-controller。
5. Zustand store 中只保存可序列化状态，音频 Blob、MediaStream、AbortController 等对象由任务模块内部管理。

## 14. 关键处理逻辑伪代码

### 当前字幕定位

```ts
function findActiveSegment(segments: CaptionSegment[], currentMs: number) {
  // segments 按 startMs 升序排列，可用二分查找优化
  return segments.find(segment => {
    return currentMs >= segment.startMs && currentMs < segment.endMs;
  });
}
```

### 点击字幕跳转

```ts
function seekToSegment(video: HTMLVideoElement, segment: CaptionSegment, autoplay = true) {
  video.currentTime = segment.startMs / 1000;

  if (autoplay) {
    void video.play();
  }
}
```

### 单句循环

```ts
function handleLoop(video: HTMLVideoElement, state: LearningState, segment?: CaptionSegment) {
  if (state.playbackMode !== "segment-loop" || !segment) {
    return;
  }

  const currentMs = video.currentTime * 1000;
  const toleranceMs = 120;

  if (currentMs >= segment.endMs - toleranceMs) {
    video.currentTime = segment.startMs / 1000;
  }
}
```

### 字幕整体偏移

```ts
function applyOffset(segments: CaptionSegment[], offsetMs: number) {
  return segments.map(segment => ({
    ...segment,
    startMs: Math.max(0, segment.startMs + offsetMs),
    endMs: Math.max(0, segment.endMs + offsetMs),
  }));
}
```

## 15. 需要进一步确认的问题

1. 首批重点适配哪些视频网站？
2. AI 服务使用用户自己的 API Key，还是应用内置服务端代理？
3. 是否需要账号系统和云同步？
4. 无字幕自动转写是否默认开启，还是由用户手动点击“生成字幕”触发？
5. 插件 UI 使用 Side Panel、页面浮窗，还是两者都支持？
6. 是否需要支持非英语视频学习英语，还是主要处理英文视频？
7. 是否需要将学习记录导出到 Anki、Notion 或 CSV？
8. 对 DRM 或跨域限制导致无法提取音频的视频，是否需要提示用户切换平台或视频源？
9. 抖音短视频是否需要“连续学习模式”，自动在用户停留的视频上生成字幕并缓存？
