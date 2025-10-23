
/// <reference lib="dom" />

window.onload = () => {
  let height = 28
  let width = 39
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="displacementGradient" x1="0" x2="0" y1="0%" y2="100%" color-interpolation="linearRGB">
      <stop offset="0%"   stop-color="#809880"/>  <!-- (128,152,128) -->
      <stop offset="25%"  stop-color="#808C80"/>  <!-- (128,140,128) -->
      <stop offset="50%"  stop-color="#807080"/>  <!-- (128,112,128) center "zoom" -->
      <stop offset="75%"  stop-color="#808C80"/>  <!-- (128,140,128) -->
      <stop offset="100%" stop-color="#809880"/>  <!-- (128,152,128) -->
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="100%" height="100%" fill="url(#displacementGradient)" />
  </svg>`
  const mapSvg = document.getElementById('map')
  const debugMapSvg = document.getElementById('debug-map')
  if (!mapSvg) return
  if (!debugMapSvg) return
  mapSvg.setAttribute('href', `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
  debugMapSvg.innerHTML = svg
}