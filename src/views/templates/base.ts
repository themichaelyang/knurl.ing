import { LoginHandler } from "../../handlers/login-handler"
import { SignUpHandler } from "../../handlers/sign-up-handler"
import { html, Template, type TemplateRenderable } from "../template"
import { readFileSync } from 'fs'

let signupAndLogin = html`<li><a href="${SignUpHandler.route}">Sign Up</a></li><li><a href="${LoginHandler.route}">Login</a></li>`
let generateSvg = true

export default function base(children: TemplateRenderable, username: string | null = null): Template {
  let loggedIn = username !== null

  return html`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title></title>
  <meta name="description" content="">
  <!-- <link rel="stylesheet" href="stylesheets/style.css"> -->
  <!-- This isn't bundled by Bun because it's in typescript, so we need to make sure the paths are right. -->
  <link rel="stylesheet" href="/static/routed-gothic/stylesheet.css">
  <!-- <link rel="stylesheet" href=""> -->
  <style>
    body {
      font-family: "Source Serif Pro", Charter, "Times New Roman", Times, serif;
      background-color: rgb(230, 230, 230);
      color: rgba(65, 65, 65, 0.8);
      width: 90%;
      max-width: 42em;
      margin: 0 auto;
      font-size: 24px;
    }

    .feed, .activities, #top-nav {
      list-style-type: none;
      padding: 0;
    }

    .display-post {
      display: grid;
      /* grid-template-areas: "box"; */
      /* display: flex; */
      /* flex-direction: row; */
      /* gap: 0.5em; */
      border: 1px dotted grey;
      padding: 5px;
      margin-bottom: 5px;
    }
    .display-post > * {
      grid-area: 1 / 1;
    }
    .display-post-url {}
    .display-post-metadata {
      place-self: end;
      display: flex;
      flex-direction: column;
      text-align: right;
      font-size: 0.5em;
    }

    .activity {
      border: 1px dotted grey;
      padding: 5px;
      margin-bottom: 5px;
    }

    a {
      transition-duration: 0.2s;
      color: rgb(32, 80, 203);
    }

    a:visited {
      color: rgb(71, 24, 133);
    }

    a:hover {
      font-weight: bold;
    }

    #logo {
      /* text-align: center; */
      margin: 1em auto;
      width: fit-content;
      line-height: 1;
    }

    #logo a {
      /* Normalize line height for Chrome */
      line-height: 1;
      margin: 1em 0;
      /* TODO: Okay, so display: flex and display:block on the a href causes Firefox to fill in with black! I have to display: block this... */
      /* vertical align */
      /* align-items: center; */
      font-size: var(--logo-font-size);
      text-transform: uppercase;
      font-family: "Routed Gothic Wide";
      /* Need to disable font synthesis so text inset shadow faking works in Safari */
      /* TODO: I kind of prefer the fake bold, so maybe switch to SVG text with read insets, if that works better in Safari */
      font-variation-settings: "wght" 400;
      font-synthesis: none;
      text-decoration: none;
      background-color: rgb(45, 45, 45);
      color: transparent;
      text-shadow: 0px 2px 3px rgba(255, 255, 255, 0.5);
      background-clip: text;
      /* if bold: letter-spacing: 0.05em; */
      letter-spacing: 0.02em;
    }

    :root {
      --logo-font-size: 48px;
      /* Round number needed or Safari will jitter the animation with artifacting on the base knurling texture */
      --square-width: round(calc(var(--logo-font-size) / 14 * 3), 1px);
      /* Knurling triangles are right isosceles embedded in squares. */
      --triangle-height: calc(var(--square-width) / sqrt(2));

      --container-height-triangles: 8;
      --container-width-triangles: 10;

      --container-height: calc(var(--container-height-triangles) * var(--triangle-height));
      --container-width: calc(var(--container-width-triangles) * var(--triangle-height));

      /* Since we are rotating 45 degrees, we need to make a larger square */
      --inner-width: calc(var(--container-width) * sqrt(2) * 2);
      --inner-height: calc(var(--container-width) * sqrt(2) * 2);
    }

    @keyframes rotate {
      from {margin-top: calc(var(--container-height) * -2);}
      to {margin-top: 0;}
    }

    @supports (-moz-appearance:none) {
      /* For some ungodly reason the knurling is completely off baseline if line-height: 1 in Firefox (but fine in Chrome + Safari) */
      #logo { 
        line-height: 1.2;
      }
    }

    .knurling-container {
      margin: 0 calc(4 * var(--triangle-height));
      /* Manually adjust to line up with baseline. Also, font doesn't sit nicely in middle even when vertical-aligned */
      /* margin-top: -8px; */
      /* display: inline-block causes over-edge sampling in Firefox to be black. Dunno.*/
      display: block;
      float: left;

      height: var(--container-height);
      width: var(--container-width);

      overflow: hidden;
      border-radius: calc(var(--triangle-height) / 2);
      border-right: calc(var(--triangle-height) / 2) solid grey;
      border-left: calc(var(--triangle-height) / 2) solid grey;
    }

    .knurling-container::before {
      height: var(--container-height);
      width: var(--container-width);

      content: '';
      display: block;
      position: absolute;
      z-index: 1;
      /* Metallic highlights */
      background: linear-gradient(
          to bottom,
          transparent 0%,
          rgba(255, 255, 255, 0.5) 12%,
          transparent 45%,
          rgba(255, 255, 255, 0.3) 65%,
          rgba(0, 0, 0, 0.7) 100%
      );
    }

    .knurling {
      /* Width is always larger, so use the width */
      --translate-y: calc(var(--container-width) * -0.5);
      --translate-x: calc(var(--container-width) * 0.5);

      padding: 0;
      width: var(--inner-width);
      height: var(--inner-height);
      /* Solid quadrants for knurling */
      background: conic-gradient(
        from 45deg, 
        rgb(152, 152, 152) 0deg 90deg, 
        rgb(123, 123, 123) 90deg 180deg, 
        rgb(57, 57, 57) 180deg 270deg, 
        rgb(214, 214, 214) 270deg 360deg
      );
      background-repeat: repeat;

      /* Background size is side of square = length of hypotenuse. Side of triangle is hypotenuse / sqrt(2) */
      background-size: var(--square-width) var(--square-width);
      transform-origin: top left;
      /* Rotate by 45 degrees so triangles point up */
      transform: translate(var(--translate-x), var(--translate-y)) rotate(45deg);
    }

    #logo a:hover .knurling {
      animation-name: rotate;
      animation-duration: 1.5s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      /* animation-timing-function: ease-in-out; */
    }

    #gradient-svg {
      display: none;
    }

    #debug-map {
      position: absolute;
      height: 100%;
      display: block;
    }
  </style>
</head>
<body>
  <svg width="0" height="0" style="position: absolute;">
    <defs>
      <filter id="filter-bend" x="0" y="0" color-interpolation-filters="sRGB">
        <feImage id="map" href="data:image/svg+xml;charset=utf-8,%3Csvg%20id%3D%22svg-displacement-gradient%22%20filterUnits%3D%22userSpaceOnUse%22%20width%3D%2247%22%20height%3D%2234%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%3Cdefs%3E%0A%20%20%20%20%20%20%3ClinearGradient%20id%3D%22displacement-gradient%22%20x1%3D%220%22%20x2%3D%220%22%20y1%3D%220%25%22%20y2%3D%22100%25%22%20color-interpolation%3D%22sRGB%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20%20%20stop-color%3D%22rgba(128%2C%20%200%2C%20128%2C%200.5)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2220%25%22%20%20stop-color%3D%22rgba(128%2C%20128%2C%20128%2C%200.5)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2260%25%22%20%20stop-color%3D%22rgba(128%2C%20128%2C%20128%2C%200.5)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22rgba(128%2C%20255%2C%20128%2C%200.5)%22%2F%3E%0A%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%3C%2Fdefs%3E%0A%0A%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2247%22%20height%3D%2234%22%20fill%3D%22url(%23displacement-gradient)%22%20%2F%3E%0A%20%20%3C%2Fsvg%3E" result="displacement" />
        <feDisplacementMap in="SourceGraphic" in2="displacement" xChannelSelector="A" yChannelSelector="G" scale="20" result="out"/>
        <!-- Crop the filtered to source size -->
        <feComposite in="out" in2="SourceAlpha" operator="in"/>
      </filter>
    </defs>
  </svg>
  <!-- <div id="debug-map"></div> -->
  ${generateSvg ? new Template('<script>' + readFileSync('./src/views/templates/script.ts', 'utf-8') + '</script>') : ''}
  <h1 id="logo">
    <!-- translateZ(0) fixes Safari weirdness where filter disappears when tabbing away -->
    <!-- Also fixes some Firefox subpixel artifacts -->
    <!-- Also, if you refresh repeatedly quickly in Safari sometimes the filter gets garbled -->
    <!-- Also, it's ever so slightly thicker in Safari?? -->
    <a href="/">
      <div class="knurling-container" style="filter: url(#filter-bend); transform: translateZ(0);">
        <div class="knurling"></div>
      </div>
      knurl.ing
    </a>
  </h1>
  <h1 id="logo">
    <!-- translateZ(0) fixes Safari weirdness where filter disappears when tabbing away -->
    <!-- Also fixes some Firefox subpixel artifacts -->
    <!-- Also, if you refresh repeatedly quickly in Safari sometimes the filter gets garbled -->
    <!-- Also, it's ever so slightly thicker in Safari?? -->
    <a href="/">
      <div class="knurling-container">
        <div class="knurling"></div>
      </div>
      knurl.ing
    </a>
  </h1>
  <nav id="top-nav">
    ${loggedIn ? html`<li>Logged in as <a href="/user/${username}">${username}</a></li>
      <li><a href="/logout">Logout</a></li>` : signupAndLogin}
  </nav>
  ${children}
</body>
</html>
`
}