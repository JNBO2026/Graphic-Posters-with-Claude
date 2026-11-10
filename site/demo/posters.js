// Example data for /?demo only. Shows how posted days look and behave before the challenge starts.
// The real wall never loads this file. Sources for the example posters are in demo/src/.
window.DEMO = true;
(() => {
  const H = 36e5, start = Date.now() - 54 * H; // day one began 54 hours ago, so day 03 is open now
  const d = h => new Date(start + h * H).toISOString().slice(0, 10);
  window.SITE.start = new Date(start).toISOString();
  window.POSTERS = [{
    day: 1, date: d(0), title: 'No Hands.',
    note: 'A clock with all sixty seconds and no hands. The rules, as a poster.',
    prompt: 'Everyday for 30 days ill create a poster only using Claude code and my prompts. Rules: 1. Generative AI Can be used. 2. You only get 60 Seconds to do your prompt. 3. You can only answer any question The LLM asks 4. hands off 5. post it as is',
    process: 'Code only, no generative model. Built as one HTML page in [[Claude Code]]: the clock face is 60 [[SVG]] lines drawn in a loop, the type is Archivo Black and IBM Plex Mono from [[Google Fonts]], and the paper grain is an SVG noise filter. Rendered to A3 with [[Playwright]].',
    tools: ['Claude Code', 'HTML and CSS', 'SVG', 'Google Fonts', 'Playwright'],
    thumb: 'demo/thumb.jpg', image: 'demo/poster.jpg'
  }, {
    day: 2, date: d(26), title: 'Hands Off.',
    note: 'Example poster. Two words, as big as A3 allows.',
    prompt: 'example prompt for the preview, two words big type hands off',
    process: 'Code only, no generative model. Pure type set in [[HTML and CSS]] with Anton from [[Google Fonts]], laid out in [[Claude Code]] and rendered with [[Playwright]].',
    tools: ['Claude Code', 'HTML and CSS', 'Google Fonts', 'Playwright'],
    thumb: 'demo/thumb-02.jpg', image: 'demo/poster-02.jpg'
  }, {
    day: 3, date: d(50), title: 'Ten Seconds.',
    note: 'Example animated poster. The last ten seconds of a sixty second brief, on a loop.',
    prompt: 'example prompt for the preview, animated countdown poster',
    process: 'Code only, no generative model. The digits roll with a stepped [[CSS]] animation and the hand sweeps once every ten seconds. [[Playwright]] captured all 240 frames one by one and [[FFmpeg]] encoded them to an MP4 that loops.',
    tools: ['Claude Code', 'CSS', 'Playwright', 'FFmpeg'],
    skills: [{ name: 'canvas-design', url: 'https://github.com/anthropics/skills/tree/main/skills/canvas-design' }],
    thumb: 'demo/thumb-03.jpg', image: 'demo/poster-03.jpg', video: 'demo/poster-03.mp4'
  }];
})();
