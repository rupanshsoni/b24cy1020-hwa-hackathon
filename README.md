# PawVault

## Live Deployment

- Live App: https://b24cy1020-hwa-hackathon.vercel.app
- Repository: https://github.com/rupanshsoni/b24cy1020-hwa-hackathon

## Project Overview

PawVault is a three tier modular canine enrichment tower designed to keep dogs calm and engaged during the workday. It turns an empty house into a structured, rewarding routine of licking, scratching, sniffing and problem solving that runs from the moment the door closes until you get home.

The product ships in two editions:

- **Pure** a fully mechanical edition with all five physical puzzle mechanisms and no electronics.
- **Smart** an app connected edition that adds a speaker and camera, owner voice callouts, rotating soundscapes and a seven day learning window for audio habituation.

The accompanying web application is an interactive product experience. It introduces the daily routine, takes the vault apart layer by layer, explains the canine science behind each mechanism, lets visitors play a five stage puzzle simulator, and supports configuring and buying a vault with a working cart, checkout and order tracking flow.

## Key Interactive Features

### 1. Branded Loading Curtain

A full screen loading curtain (`src/components/LoadingScreen.tsx`) is synchronized to the first rendered WebGL frame of the 3D hero. It advances toward a held percentage, then completes and slides away when the hero signals readiness through a `pawvault:hero-ready` event, with a safety timeout and reduced motion support.

### 2. Scroll Choreographed 3D Hero Stage

The hero (`src/components/sections/HeroScene.tsx`) drives a WebGL stage with GSAP ScrollTrigger across four daily routine beats:

- **08:30** Door Closes
- **09:00** First Lick and Scratch
- **12:00** Ball Drop and Paddle
- **16:30** Nose Spin and Calm

Scrolling scrubs the stage and swaps the headline, line and sub copy for each beat with staggered animations. A Tier 2 scale sculptural dog companion is built procedurally in `src/components/three/dogBuilder.ts` and posed against progress in `src/components/three/heroStage.ts`. Visitors can enter their dog's name, and the beat rail buttons jump directly to a chosen moment using Lenis.

### 3. Interactive 3D Exploded Vault Explorer

The explorer (`src/components/sections/Explorer.tsx`) renders a rotatable Three.js model of the vault with six mechanism chapters:

1. Insulated Frozen Lick Dome
2. Ball Drop Seesaw Vault
3. Big Paw Paddle Vault
4. Nose Spin Forage Wheel
5. Scratch to Unlock Nail Pad
6. Rear Scent and Audio Bay

Scrolling through the chapter deck highlights the matching 3D part and peels back the shell. Controls include a shell color switcher, a Pure and Smart toggle, an explode and assemble action, a static real photo fallback, reset, and a Canine Dichromatic Vision mode that recolors the model to reflect how dogs perceive blue and yellow. Geometry and part keys live in `src/components/three/vaultGeometry.ts`, the assembly in `src/components/three/vaultModel.ts`, and the scene controller in `src/components/three/vaultScene.ts`.

### 4. Canine Science Section

The science section (`src/components/sections/Science.tsx`) presents six cited studies with expandable citation cards. It includes:

- A **dichromatic vision slider** comparing a human trichromatic image with a canine dichromatic simulation using an SVG color matrix and a draggable split handle.
- A **six hour routine timeline** (`src/components/sections/ScienceTimeline.tsx`) with six selectable moments from T-10m through 6:00, each mapped to the hardware behavior and the peer reviewed study behind it.
- A **Web Audio Sound Lab** (`src/components/sections/SoundLab.tsx`) that synthesizes five acoustic modes live in the browser: Solo Piano, Soft Reggae Pulse, Soft Rock Acoustic, Calm Owner Voice Prompt, and Gentle Rain and Audiobook Hum. Every mode runs through a low pass filter, a safe zone volume cap and an animated level meter, with no audio files required.

### 5. Five Stage Try PawVault Puzzle Simulator

The simulator (`src/components/sections/TryPawVault.tsx`) lets visitors play the same sequence a dog experiences, with synthesized feedback and an accessibility conscious interface:

1. **Grit Scratch Pad** scrape the pad four times, then the safety cap locks to prevent over filing.
2. **Ball Drop Seesaw Vault** drag or click the ball into the funnel to tip the kibble tray.
3. **Paw Paddle** press the paddle to slide open the drawer and reveal a dental chew.
4. **Forage Wheel** spin the wheel to align the scent window and drop hidden treats.
5. **Lick Dome** rub the dome until the dog is fully calm.

A calmness meter and journey list track progress, completing all five stages triggers a celebration and unlocks the GOODBOY15 discount code.

### 6. Configurator, Cart, Checkout and Order Tracking

The product configurator (`src/components/sections/Configurator.tsx`) lets visitors choose an edition, shell color, dog size and dog name, then add the result to the cart. A slide over cart drawer (`src/components/CartDrawer.tsx`) manages quantities, promo codes and free delivery progress, backed by the store in `src/store/StoreContext.tsx` with local persistence.

The checkout flow lives at `/checkout` (`src/app/checkout/page.tsx` with `src/components/CheckoutClient.tsx`) and submits to the `/api/orders` endpoint, which validates the payload and returns an order receipt. The `/track` page (`src/app/track/page.tsx` with `src/components/TrackClient.tsx`) looks up orders through `/api/orders/[id]`. A contact form posts to `/api/contact`. Validation, order creation, seeded sample orders and persistence are implemented in `src/lib/orders.ts`.

## Tech Stack

- **Next.js 15** with the App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Three.js** for the 3D hero and exploded vault
- **GSAP** with **ScrollTrigger** for scroll choreography and transitions
- **Lenis** for smooth scrolling
- **Web Audio API** for the Sound Lab and simulator feedback

## Project Structure

```
src/
  app/
    page.tsx                    home page composing all landing sections
    layout.tsx                  root layout, providers, fonts and metadata
    globals.css                 global styles and Tailwind layers
    icon.svg                    site icon
    checkout/page.tsx           checkout route
    track/page.tsx              order tracking route
    api/
      contact/route.ts          contact form endpoint
      orders/route.ts           order creation endpoint
      orders/[id]/route.ts      order lookup endpoint
  components/
    three/
      heroStage.ts              hero WebGL stage, render loop and progress API
      dogBuilder.ts             procedural sculptural dog and pose logic
      vaultGeometry.ts          geometry builders, materials, colors and part keys
      vaultModel.ts             assembly of the exploded vault model
      vaultScene.ts             vault scene controller and interaction API
    sections/
      HeroScene.tsx             scroll choreographed hero and routine beats
      Explorer.tsx              exploded vault explorer and chapter deck
      ExplorerShowcase.tsx      supporting explorer showcase
      Science.tsx               studies, vision slider and lab wrappers
      ScienceTimeline.tsx       six hour routine timeline
      SoundLab.tsx              Web Audio sound lab
      Comparison.tsx            Pure versus Smart comparison
      TryPawVault.tsx           five stage puzzle simulator
      Reviews.tsx               customer reviews
      Faq.tsx                   frequently asked questions
      Configurator.tsx          product configurator
      Mission.tsx               brand mission
      Contact.tsx               contact form
    icons/
      PawVaultIcons.tsx         interface and mechanism icons
      PuzzleSvgs.tsx            simulator puzzle and dog mood illustrations
    LoadingScreen.tsx           branded loading curtain
    SmoothScrollProvider.tsx    Lenis, GSAP ticker and custom cursor
    Navbar.tsx                  navigation
    Footer.tsx                  footer
    CartDrawer.tsx              slide over cart
    MotionPrimitives.tsx        shared animation and button primitives
    PawIcon.tsx                 paw mark
    CheckoutClient.tsx          checkout client logic
    TrackClient.tsx             order tracking client logic
  data/
    products.ts                 editions, prices, shell colors and dog sizes
    addons.ts                   purchasable add ons
    promos.ts                   promo codes and free delivery threshold
    studies.ts                  cited canine science studies
    reviews.ts                  customer review content
    faqs.ts                     FAQ content
    comparison.ts               Pure versus Smart comparison rows
  lib/
    orders.ts                   validation, creation and lookup of orders
  store/
    StoreContext.tsx            cart, dog name, promo and drawer state
```

## Local Development and Verification

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Run the TypeScript type check:

```
npm run typecheck
```

Create a production build:

```
npm run build
```

Serve the production build locally:

```
npm run start
```
