import { LoginHandler } from "../../handlers/login-handler"
import { SignUpHandler } from "../../handlers/sign-up-handler"
import { html, Template, type TemplateRenderable } from "../template"
import { readFileSync } from 'fs'

let signupAndLogin = html`<li><a href="${SignUpHandler.route}">Sign Up</a></li><li><a href="${LoginHandler.route}">Login</a></li>`

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
      text-align: center;
    }

    #logo a {
      font-size: 28px;
      text-transform: uppercase;
      font-family: "Routed Gothic Wide";
      text-decoration: none;
      background-color: rgb(45, 45, 45);
      color: transparent;
      text-shadow: 0px 2px 3px rgba(255, 255, 255, 0.5);
      background-clip: text;
      letter-spacing: 0.05em;
    }

    :root {
      --square-width: 5px;
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
    .knurling-container {
      margin: 0 calc(4 * var(--triangle-height));
      vertical-align: middle;
      display: inline-block;
      position: relative;
      top: -0.1em;

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

    #logo:hover .knurling {
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
      <filter id="filter-bend" x="0" y="0" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage id="map" href="" result="displacement" preserveAspectRatio="none"/>
        <feDisplacementMap in="SourceGraphic" in2="displacement" xChannelSelector="B" yChannelSelector="G" scale="20"/>
      </filter>
    </defs>
  </svg>
  <div id="debug-map"></div>
  <script>${new Template(readFileSync('./src/views/templates/script.ts', 'utf-8'))}</script>
  <h1 id="logo">
    <a href="/"><div class="knurling-container" style="filter: url(#filter-bend);"><div class="knurling"></div></div>knurl.ing</a>
  </h1>
  <h1 id="logo">
    <a href="/"><div class="knurling-container"><div class="knurling"></div></div>knurl.ing</a>
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