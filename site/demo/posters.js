// Example data for /?demo only. Shows how a posted day looks and behaves before the challenge starts.
// The real wall never loads this file.
window.DEMO = true;
window.SITE.start = new Date(Date.now() - 30 * 36e5).toISOString(); // day one began 30 hours ago
window.POSTERS = [{
  day: 1,
  date: new Date(Date.now() - 30 * 36e5).toISOString().slice(0, 10),
  title: 'No Hands.',
  note: 'A clock with all sixty seconds and no hands. The rules, as a poster.',
  prompt: 'Everyday for 30 days ill create a poster only using Claude code and my prompts. Rules: 1. Generative AI Can be used. 2. You only get 60 Seconds to do your prompt. 3. You can only answer any question The LLM asks 4. hands off 5. post it as is',
  process: 'Code only, no generative model. Built as one HTML page in Claude Code: the clock face is 60 SVG lines drawn in a loop, the type is Archivo Black and IBM Plex Mono, and the paper grain is an SVG noise filter. Rendered to A3 with Playwright.',
  tools: ['Claude Code', 'HTML and CSS', 'SVG', 'Playwright'],
  thumb: 'demo/thumb.jpg',
  image: 'demo/poster.jpg'
}];
