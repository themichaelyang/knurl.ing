
/// <reference lib="dom" />
// Don't forget to generateSVG = true if you are changing this script at all

window.onload = () => {
  // This is the size of the unfiltered knurling. If off by a tiny amount so sometimes there are subpixel artifacts zooming in/out?
  let height = 58
  let width = 80
  // Why this gradient? Manual tweaking, using the x and y displacement both set to G, 
  // trying to get the same linear offset slopes + same number of "triangle" rows displaced on top and bottom.
  // It's not perfect. I also don't get why it isn't centered at 50%.
  // Changing the color-interpolation to linearRGB messes things up too.
  //
  // Alpha is 0.5 for x-channel. Omitting x-channel displaced x by a large fixed amount. Using R or B displaced the x nonlinearly by small amounts, 
  // maybe how the gradient is calculated?
  // Maybe this is the Safari issue: https://github.com/emilbjorklund/svg-weirdness/issues/22
  let svg = `<svg id="svg-displacement-gradient" filterUnits="userSpaceOnUse" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="displacement-gradient" x1="0" x2="0" y1="0%" y2="100%" color-interpolation="sRGB">
      <stop offset="0%"   stop-color="rgba(128,  0, 128, 0.5)"/>
      <stop offset="20%"  stop-color="rgba(128, 128, 128, 0.5)"/>
      <stop offset="60%"  stop-color="rgba(128, 128, 128, 0.5)"/>
      <stop offset="100%" stop-color="rgba(128, 255, 128, 0.5)"/>
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#displacement-gradient)" />
  </svg>`
  const mapSvg = document.getElementById('map')
  const debugMapSvg = document.getElementById('debug-map')
  if (!mapSvg) return
  mapSvg.setAttribute('href', `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
  // mapSvg.setAttribute('href', `#svg-displacement-gradient`)

  if (debugMapSvg) {
    debugMapSvg.innerHTML = svg
  }
}