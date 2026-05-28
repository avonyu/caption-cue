# CaptionCue - 幕听

AI-powered browser extension for learning English from video captions with sentence seeking, bilingual subtitles, word lookup, and transcription.

## GitHub Description

AI-powered browser extension for learning English from video captions, with sentence-level seeking, bilingual subtitle modes, word lookup, and automatic transcription for videos without captions.

## Overview

CaptionCue - 幕听 helps learners turn online videos into interactive English-learning material. It detects the current video, reads or generates captions, syncs captions with playback, and lets users jump between subtitle segments. When captions are missing, it extracts audio, uses AI transcription to generate timestamped subtitles, and applies them back to the video.

## Planned Features

- Detect and control the active video on supported web pages.
- Support Douyin pages under `https://www.douyin.com/*`.
- Generate captions from video audio when no captions are available.
- Format generated captions as WebVTT.
- Switch subtitle display modes: English, Chinese, and bilingual.
- Click a caption segment to seek the video.
- Loop the current sentence or a selected subtitle range.
- Hover a word to pause the video.
- Click a word to view phonetics, pronunciation, definitions, and examples.
- Use configurable AI providers such as DeepSeek for translation polish and learning notes.

## Tech Stack

- Plasmo
- TypeScript
- React
- Zustand

## Prototype

Open the static prototype at:

```text
prototype/index.html
```

The product proposal is available at:

```text
prototype/APP_FLOW_PROPOSAL.md
```
