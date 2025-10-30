
/// <reference lib="dom" />
window.onload = () => {
  let height = 28.8
  let width = 38.8
  // Alpha is 0.5 for x-channel. Omitting x-channel displaced x by a large fixed amount. Using R or B displaced the x nonlinearly by small amounts, 
  // maybe how the gradient is calculated?
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="displacementGradient" x1="0" x2="0" y1="0%" y2="100%" color-interpolation="sRGB">
      <stop offset="0%"   stop-color="rgba(128,  0, 128, 0.5)"/>
      <stop offset="20%"  stop-color="rgba(128, 128, 128, 0.5)"/>
      <stop offset="60%"  stop-color="rgba(128, 128, 128, 0.5)"/>
      <stop offset="100%" stop-color="rgba(128, 255, 128, 0.5)"/>
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#displacementGradient)" />
  </svg>`
  const mapSvg = document.getElementById('map')
  const debugMapSvg = document.getElementById('debug-map')
  if (!mapSvg) return
  if (!debugMapSvg) return
  mapSvg.setAttribute('href', `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
  debugMapSvg.innerHTML = svg
}