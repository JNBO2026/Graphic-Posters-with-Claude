# Logo library

Every logo the site can show for a tool or model. One mono SVG per brand, `fill="currentColor"`, 24 × 24, so it takes the colour of the text around it.

- Sources: [LobeHub Icons](https://github.com/lobehub/lobe-icons) 1.102.0 (MIT) for the AI brands, [Simple Icons](https://simpleicons.org) 13.21.0 (CC0) for the rest. The logos themselves are the trademarks of their owners and are used only to say which tool made a poster.
- `logos.json` lists each file with its brand, what it covers, source and licence.
- `scripts/tools.json` says which name or model word gets which logo. `python3 -I scripts/make-tool-icons.py` turns both into `site/vendor/tool-icons.js`; the site build ships only the logos in use.

## Adding one
1. Save a mono SVG here as `slug.svg` (viewBox, `fill="currentColor"`, a `<title>`, no ids or gradients) and add it to `logos.json`.
2. Map the tool name in `tools` and the model words in `models` in `scripts/tools.json`.
3. Run `python3 -I scripts/make-tool-icons.py`, then `node scripts/build-site.js`.

## Still missing (a lettered badge until James supplies them)
| Brand | Models | Shows meanwhile |
|---|---|---|
| Moonvalley | Marey | letter M on hover, Flora logo in the write-up |
| Hyper3D / Deemos | Rodin | letter R |
| Quiver AI | Arrow | letter A |
| Hi3D | Hi3D | letter H |
| Magnific | Magnific upscaler | Freepik logo (its owner) |
| Google Veo, Imagen, Lyria | own marks | Google DeepMind logo |
| ByteDance Seedream, Seedance | own marks | ByteDance logo |
| Alibaba Wan | own mark | Alibaba logo |
| Playwright | the renderer | left off the hover row on purpose |

## Platforms
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="flora.svg" width="20" height="20" alt=""> | `flora.svg` Flora | Flora canvas (runs most of the models below) | LobeHub |
| <img src="figma.svg" width="20" height="20" alt=""> | `figma.svg` Figma | Figma, Figma image and vector generation | LobeHub |
| <img src="canva.svg" width="20" height="20" alt=""> | `canva.svg` Canva | Canva, Canva image generation | Simple Icons |
| <img src="comfyui.svg" width="20" height="20" alt=""> | `comfyui.svg` ComfyUI | ComfyUI workflows | LobeHub |
| <img src="replicate.svg" width="20" height="20" alt=""> | `replicate.svg` Replicate | Replicate | LobeHub |
| <img src="fal.svg" width="20" height="20" alt=""> | `fal.svg` fal | fal.ai | LobeHub |
| <img src="huggingface.svg" width="20" height="20" alt=""> | `huggingface.svg` Hugging Face | Hugging Face models and Spaces | Simple Icons |
| <img src="civitai.svg" width="20" height="20" alt=""> | `civitai.svg` Civitai | Civitai models and LoRAs | LobeHub |

## Image models
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="adobefirefly.svg" width="20" height="20" alt=""> | `adobefirefly.svg` Adobe Firefly | Firefly Image | LobeHub |
| <img src="flux.svg" width="20" height="20" alt=""> | `flux.svg` FLUX | FLUX 1.1 Pro, FLUX Kontext, FLUX 2, every FLUX model | LobeHub |
| <img src="dalle.svg" width="20" height="20" alt=""> | `dalle.svg` DALL·E | DALL·E 2 and 3 | LobeHub |
| <img src="midjourney.svg" width="20" height="20" alt=""> | `midjourney.svg` Midjourney | Midjourney (not on Flora) | LobeHub |
| <img src="gemini.svg" width="20" height="20" alt=""> | `gemini.svg` Gemini | Gemini, Gemini Omni, Gemini image models | LobeHub |
| <img src="nanobanana.svg" width="20" height="20" alt=""> | `nanobanana.svg` Nano Banana | Nano Banana, Nano Banana Pro | LobeHub |
| <img src="ideogram.svg" width="20" height="20" alt=""> | `ideogram.svg` Ideogram | Ideogram 3 and every Ideogram model | LobeHub |
| <img src="recraft.svg" width="20" height="20" alt=""> | `recraft.svg` Recraft | Recraft V3 and vectors | LobeHub |
| <img src="krea.svg" width="20" height="20" alt=""> | `krea.svg` Krea | Krea 1, Krea realtime | LobeHub |
| <img src="reve.svg" width="20" height="20" alt=""> | `reve.svg` Reve | Reve Image | LobeHub |
| <img src="briaai.svg" width="20" height="20" alt=""> | `briaai.svg` Bria | Bria image models | LobeHub |
| <img src="stability.svg" width="20" height="20" alt=""> | `stability.svg` Stability AI | Stable Diffusion, Stable Audio | LobeHub |
| <img src="jimeng.svg" width="20" height="20" alt=""> | `jimeng.svg` Jimeng | Jimeng (ByteDance) | LobeHub |
| <img src="qwen.svg" width="20" height="20" alt=""> | `qwen.svg` Qwen | Qwen Image, Qwen Image Edit | LobeHub |
| <img src="kolors.svg" width="20" height="20" alt=""> | `kolors.svg` Kolors | Kolors (Kuaishou) | LobeHub |
| <img src="grok.svg" width="20" height="20" alt=""> | `grok.svg` Grok | Grok Imagine | LobeHub |
| <img src="topazlabs.svg" width="20" height="20" alt=""> | `topazlabs.svg` Topaz Labs | Topaz upscale and enhance | LobeHub |

## Video models
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="runway.svg" width="20" height="20" alt=""> | `runway.svg` Runway | Gen-4, Gen-4.5, Aleph, every Runway model | LobeHub |
| <img src="kling.svg" width="20" height="20" alt=""> | `kling.svg` Kling | Kling 2.x video and image | LobeHub |
| <img src="sora.svg" width="20" height="20" alt=""> | `sora.svg` Sora | Sora 2, Sora 2 Pro | LobeHub |
| <img src="luma.svg" width="20" height="20" alt=""> | `luma.svg` Luma | Ray 2, Ray 3, Photon | LobeHub |
| <img src="hailuo.svg" width="20" height="20" alt=""> | `hailuo.svg` Hailuo | Hailuo video (MiniMax) | LobeHub |
| <img src="pika.svg" width="20" height="20" alt=""> | `pika.svg` Pika | Pika (not on Flora) | LobeHub |
| <img src="vidu.svg" width="20" height="20" alt=""> | `vidu.svg` Vidu | Vidu (not on Flora) | LobeHub |
| <img src="pixverse.svg" width="20" height="20" alt=""> | `pixverse.svg` PixVerse | PixVerse (not on Flora) | LobeHub |
| <img src="hedra.svg" width="20" height="20" alt=""> | `hedra.svg` Hedra | Hedra character video | LobeHub |
| <img src="haiper.svg" width="20" height="20" alt=""> | `haiper.svg` Haiper | Haiper | LobeHub |
| <img src="lightricks.svg" width="20" height="20" alt=""> | `lightricks.svg` Lightricks | LTX Video, LTX-2 | LobeHub |

## Audio models
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="elevenlabs.svg" width="20" height="20" alt=""> | `elevenlabs.svg` ElevenLabs | Voices, sound effects, music | LobeHub |
| <img src="suno.svg" width="20" height="20" alt=""> | `suno.svg` Suno | Suno music | LobeHub |
| <img src="udio.svg" width="20" height="20" alt=""> | `udio.svg` Udio | Udio music | LobeHub |

## 3D models
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="hunyuan.svg" width="20" height="20" alt=""> | `hunyuan.svg` Hunyuan | Hunyuan3D, HunyuanImage, HunyuanVideo | LobeHub |
| <img src="meshy.svg" width="20" height="20" alt=""> | `meshy.svg` Meshy | Meshy 3D | LobeHub |
| <img src="tripo.svg" width="20" height="20" alt=""> | `tripo.svg` Tripo | Tripo 3D | LobeHub |

## Language models
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="claude.svg" width="20" height="20" alt=""> | `claude.svg` Claude | Claude models | LobeHub |

## Makers (used for models with no mark of their own)
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="adobe.svg" width="20" height="20" alt=""> | `adobe.svg` Adobe | Adobe | Simple Icons |
| <img src="bfl.svg" width="20" height="20" alt=""> | `bfl.svg` Black Forest Labs | Maker of FLUX | LobeHub |
| <img src="openai.svg" width="20" height="20" alt=""> | `openai.svg` OpenAI | GPT Image, GPT models | LobeHub |
| <img src="google.svg" width="20" height="20" alt=""> | `google.svg` Google | Google | LobeHub |
| <img src="deepmind.svg" width="20" height="20" alt=""> | `deepmind.svg` Google DeepMind | Veo, Imagen, Lyria (no own marks) | LobeHub |
| <img src="bytedance.svg" width="20" height="20" alt=""> | `bytedance.svg` ByteDance | Seedream, Seedance, Seed models (no own marks) | LobeHub |
| <img src="doubao.svg" width="20" height="20" alt=""> | `doubao.svg` Doubao | Doubao (ByteDance) | LobeHub |
| <img src="alibaba.svg" width="20" height="20" alt=""> | `alibaba.svg` Alibaba | Wan 2.x video and image (no own mark) | LobeHub |
| <img src="xai.svg" width="20" height="20" alt=""> | `xai.svg` xAI | Maker of Grok | LobeHub |
| <img src="freepik.svg" width="20" height="20" alt=""> | `freepik.svg` Freepik | Magnific upscaler (stand-in until Magnific has its own mark here) | Simple Icons |
| <img src="kwaikat.svg" width="20" height="20" alt=""> | `kwaikat.svg` Kuaishou | Maker of Kling and Kolors | LobeHub |
| <img src="minimax.svg" width="20" height="20" alt=""> | `minimax.svg` MiniMax | MiniMax video, speech and music | LobeHub |
| <img src="tencent.svg" width="20" height="20" alt=""> | `tencent.svg` Tencent | Maker of Hunyuan | LobeHub |
| <img src="meta.svg" width="20" height="20" alt=""> | `meta.svg` Meta | SAM 3D, Segment Anything | LobeHub |
| <img src="microsoft.svg" width="20" height="20" alt=""> | `microsoft.svg` Microsoft | Trellis 3D | LobeHub |
| <img src="nvidia.svg" width="20" height="20" alt=""> | `nvidia.svg` NVIDIA | NVIDIA models | LobeHub |
| <img src="anthropic.svg" width="20" height="20" alt=""> | `anthropic.svg` Anthropic | Anthropic | LobeHub |

## Code and build
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="claudecode.svg" width="20" height="20" alt=""> | `claudecode.svg` Claude Code | Claude Code | LobeHub |
| <img src="html5.svg" width="20" height="20" alt=""> | `html5.svg` HTML | HTML | Simple Icons |
| <img src="css3.svg" width="20" height="20" alt=""> | `css3.svg` CSS | CSS | Simple Icons |
| <img src="svg.svg" width="20" height="20" alt=""> | `svg.svg` SVG | SVG | Simple Icons |
| <img src="javascript.svg" width="20" height="20" alt=""> | `javascript.svg` JavaScript | JavaScript, Canvas | Simple Icons |
| <img src="greensock.svg" width="20" height="20" alt=""> | `greensock.svg` GSAP | GSAP | Simple Icons |
| <img src="threedotjs.svg" width="20" height="20" alt=""> | `threedotjs.svg` Three.js | Three.js | Simple Icons |
| <img src="webgl.svg" width="20" height="20" alt=""> | `webgl.svg` WebGL | WebGL, shaders | Simple Icons |
| <img src="p5dotjs.svg" width="20" height="20" alt=""> | `p5dotjs.svg` p5.js | p5.js | Simple Icons |
| <img src="ffmpeg.svg" width="20" height="20" alt=""> | `ffmpeg.svg` FFmpeg | FFmpeg | Simple Icons |
| <img src="googlefonts.svg" width="20" height="20" alt=""> | `googlefonts.svg` Google Fonts | Google Fonts | Simple Icons |
| <img src="nodedotjs.svg" width="20" height="20" alt=""> | `nodedotjs.svg` Node.js | Node.js | Simple Icons |
| <img src="blender.svg" width="20" height="20" alt=""> | `blender.svg` Blender | Blender | Simple Icons |

## Site and socials
| Logo | File | Covers | Source |
|---|---|---|---|
| <img src="github.svg" width="20" height="20" alt=""> | `github.svg` GitHub | GitHub | Simple Icons |
| <img src="instagram.svg" width="20" height="20" alt=""> | `instagram.svg` Instagram | Instagram | Simple Icons |
| <img src="linkedin.svg" width="20" height="20" alt=""> | `linkedin.svg` LinkedIn | LinkedIn | Simple Icons |
| <img src="x.svg" width="20" height="20" alt=""> | `x.svg` X | X | Simple Icons |
| <img src="threads.svg" width="20" height="20" alt=""> | `threads.svg` Threads | Threads | Simple Icons |
| <img src="whatsapp.svg" width="20" height="20" alt=""> | `whatsapp.svg` WhatsApp | WhatsApp | Simple Icons |
