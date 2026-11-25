# The Gifting Bloom

A Vite and React portfolio with React Router and Nitro for handmade gifting. The app uses the project's existing Lovable Cloud authentication, PostgreSQL tables and Supabase storage policies.

## Run locally

Use Node.js 22.12 or newer and npm. From this folder:

```sh
npm ci
npm run dev
npm test
npm run build
```

The default local address is http://localhost:5173. The Vite build emits Nitro deployment output in `.output` using the Cloudflare preset. Run `npm run dev` for the full app and its server endpoints. Set `NITRO_PRESET=node-server` at build time for a Node deployment. The built-in catalogue includes four labelled concept products.

## Connect the website in Lovable

Use the [existing Lovable project](https://lovable.dev/projects/c0cdfc67-dd09-491e-8bf9-363169801842) for database policies, storage, environment variables, owner access and publishing.

- Keep `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` on the server and their `VITE_` equivalents available for browser authentication. For local owner sign-in, start Node with the project environment available to the process, for example `node --env-file=.env node_modules/vite/bin/vite.js dev`.
- Configure `VITE_SITE_URL` with the public origin before the production build to add canonical links.
- The owner signs in at `/admin/login`. Create their account in Lovable Cloud and assign the `admin` role for its user ID in `user_roles`. The app verifies this role on the server before every dashboard read, write or upload.
- Repair the anonymous catalogue, category, testimonial and reel SELECT policies in Lovable Cloud. Public reads currently return `42501 permission denied for function has_role`. Apply public policies for active or approved rows and authenticated staff policies for private rows, then verify each role.
- Configure the `bloom-media` bucket in Lovable Cloud. The website needs public reads of published media and uploads restricted to owners. The current bucket lookup could not find it.

## Prepare the gallery

Use the owner dashboard to manage gallery items, photos, categories, Instagram Reels, testimonials, and enquiry status. The bouquet builder lets visitors preview a design and send it through the same enquiry form. Upload approved media and set the logo, profile and contact details in Website settings.

## Demo photography

The four concept images in [public/blooms](public/blooms) were generated using built-in ImageGen and cropped for the catalogue.

> Product mockup contact sheet for demo handmade gifts, 2 by 2 perfectly equal quadrants, no margins, no dividers, each product centered and fully contained in its own square with generous inset. Top left dusty pink handmade fuzzy chenille roses bouquet in cream paper with pink ribbon on muted pink backdrop. Top right five golden chenille sunflowers wrapped in kraft on pale warm golden cream. Bottom left a lavender and cream mini chenille daisy posy wrapped in lavender paper on pale lavender. Bottom right a single small pink handmade chenille daisy keychain with a gold ring on pale sage. Natural window light, boutique editorial product photography, visible fluffy pipe cleaner texture, tonal studio shadows, no people, no text, no logos.

## Intro illustration

The [character cutouts](src/assets/story-cast-illustration.webp) were created with built-in ImageGen using the project's existing [storybook image](src/assets/story-couple-optimized.jpg) as a visual reference.

> Create a landscape transparent PNG sprite sheet with exactly two isolated, evenly lit full-body adult character illustrations, one per half. Use the attached art only as a style and character reference. Preserve the original hand-painted warm storybook aesthetic, delicate organic paper grain, grounded human adult proportions, soft faces, brown hair, plum pullover and sand trousers on the young man, dusty blush long-sleeved dress and ribbon on the young woman. The man on the LEFT faces RIGHT in 3/4 profile. The woman on the RIGHT faces LEFT in 3/4 profile. Both stand naturally, shoes visible, with the far arm relaxed alongside the torso. Their NEAR arm extends toward the EMPTY center, with a softly bent elbow and a natural gently curled open hand as if each is about to hold the same small invisible flower stem. Their fingertips must NOT touch one another. Leave a wide transparent gap between the complete silhouettes and a wide transparent margin on every edge. Place feet on the same baseline. Their near hands must reach horizontally towards the middle beyond the torso, with a clearly visible palm in side profile, and stay around waist level so faces are uncovered. Draw exactly two people, adults about 23, no item in either hand, no flower, no ground, no shadow, no decorative objects, no border, no lettering. Crisp clean silhouette with genuine transparency. Art direction is understated vintage gouache and colored pencil illustration for a romantic boutique gift website. Full-figure character poses for 2D puppet animation, not 3D renders, not manga, not caricature. Landscape 3:2.

The earlier garden scene uses a [floral heart](src/assets/story-floral-heart.webp) and a [garden backdrop](src/assets/story-garden.webp), both created using built-in ImageGen. The heart composition takes inspiration from the [Pink Rose Heart Frame](https://www.publicdomainpictures.net/en/view-image.php?image=782986&picture=pink-rose-heart-frame).

**Floral heart prompt**

> Transparent PNG decorative floral heart wreath for a vintage gouache storybook animation. A single large, absolutely unmistakable HEART outline, complete around all sides, rounded lobes up top, deep clear cleft at top center, tapered point at bottom center. Completely hollow OPEN TRANSPARENT interior, since two full-body illustrated people will stand inside it later. The HEART outline is made entirely of clustered detailed flowers and fine curving vines, not a drawn solid band. Hand-painted vintage gouache on unseen paper, delicate naturalistic petal edges, soft pigment grain. Flowers are dusty blush pink garden roses, raspberry and faded burgundy ranunculus, tiny ivory daisies, and pale pink buds, interwoven with muted sage leaves. Make the boldest rose clusters at top shoulders and bottom point, with typically 30 smaller rose blooms and ivory flowers tracing both sides as complete continuous heart. High detail and romantic editorial feel, a few tiny loose petals immediately outside the heart only. Delicate highlights, enough contrast and silhouette definition to read on a pale blush cream background later. Straight-on, centered, full view. Square canvas, 6 percent clear transparent margins around the entire heart. No clouds, glow, board, cast shadow, background color, floor, paper, frame, lettering, ribbon, people, icons or logos. Genuine transparency everywhere except the flowers and foliage.

**Garden backdrop prompt**

> Landscape 3:2 background matte painting only for a romantic handmade-gift storybook animation. Vintage hand-painted gouache and colored-pencil texture, understated elegant fairy-tale atmosphere. Late afternoon spring garden, warm sunrise peach and ivory light from upper left with barely visible luminous dust. Distant washed-out arching hedgerows, hazy sage and dusty blush floral details at the edges only, pale rosy ground path with diffuse shadows and a few petals. Central 70 percent of the frame is subdued and softly lit, general warm ivory through blush gradient, broad flat pale ground for two full-body characters to walk on, keep all foreground decorations off the middle. No people, no silhouette, no outlined heart, no flat heart symbol, no typography, no logos, no dominant structure, no big foreground flowers, no ribbons. Delicate layers of hazy paper grain and soft depth, dreamy, polished and romantic. Fill entire canvas.

## Heart aura and rose handover

The live intro uses the [desktop heart wallpaper](https://tr.pinterest.com/pin/593419688437592182/) and [portrait heart wallpaper](https://www.pinterest.com/pin/968062882395013661/) from Pinterest. The [rose and petal atlas](src/assets/story-rose.webp) was illustrated with built-in ImageGen from the [Pinterest chenille rose reference](https://ph.pinterest.com/pin/648588783867727942/). The [grip atlas](src/assets/story-grip.webp) was illustrated with built-in ImageGen using the site's character artwork.

**Rose prompt**

> Transparent PNG sprite atlas for a romantic illustrated animation. One delicate dusty rose pink handmade chenille-wire rose, as in the supplied Pinterest craft photo, remade as a vintage gouache and colored-pencil illustration with warm paper-textured shading. Layout: exactly ONE complete single-stem rose isolated in the LEFT HALF, with a slender straight vertical sage-green stem, two small leaves only directly below the bloom and a long clear bare stem beneath, and a soft small full layered pink rose head with realistic folded outer petals. The stem ends well above bottom edge. In the RIGHT HALF, exactly THREE separately isolated loose pink rose petals of different shades, each naturally curled and textured, arranged vertically with extremely wide transparent spacing and no contact. The loose petals match the assembled flower. No hands, no table, no lettering, no collage frames, no border, no glow, no cast shadows. True transparent background. Square composition with clear margins. The result should read clearly at small size, with a beautiful pink flower head and distinct green stem.

**Grip prompt**

> Two isolated illustrated adult hands for an animation, one in each half of a transparent landscape PNG, in exactly the hand-painted romantic vintage gouache style and warm flesh tones of the supplied illustrated characters. LEFT hand is for the young man on the left: a small wrist extends horizontally in from the LEFT and the palm is to the RIGHT. RIGHT hand is for the young woman on the right: a small wrist extends horizontally in from the RIGHT and the palm is to the LEFT. Both are natural SIDE/3-quarter views, not palm-up views. Each gently pinches an invisible thin vertical flower stem with softly curled fingers and a visible thumb wrapping over the fingers. Draw delicate subtle knuckle detail and one bent index finger on each hand, normal realistic human anatomy. The man's hand is slightly broader, the woman's hand slightly slimmer. Neither has clothes or jewelry or a flower or a stem. A small amount of forearm at the wrist only, gripping hand tips fully in-frame, midair isolated, no shadow or other graphics, NO background. Both wrists aligned horizontally in their own half of the canvas. Leave generous empty margin between the hands and all edges. Transparent true alpha.

## Walking artwork

The [walking leg atlas](src/assets/story-walking-legs.webp) was created with built-in ImageGen from the original illustrated cast.

> Generate a transparent landscape sprite atlas of TWO isolated painted lower-body puppet cutouts for the illustrated characters in the reference image. Match the source vintage gouache brush texture and the exact costume colors and shapes. On the LEFT HALF, draw ONE full-length relaxed straight tan pleated trouser leg from just above the thigh/hip to toe, like the tan beige trousers on the young man, with exactly ONE complete brown Oxford lace-up shoe pointing RIGHT in clear side profile. Garment and shoe remain attached with subtle overlap at the ankle, the sole is FLAT and fully visible, with a distinct heel and toe. Hip area gently rounded and complete, long leg with subtle folds, no cut seam above shoe, trouser leg seen from the side. On the RIGHT HALF draw ONE slim feminine LOWER LEG ONLY (bare skin calf below the knee to ankle and one exact matching dark brown vintage Mary Jane strapped flat pointing LEFT), matching the woman's skin warmth and source shoe, ankle shape softly rounded and shoe sole horizontal. Leg is straight neutral standing pose. Keep both complete isolated cutouts fully visible and vertically aligned at the soles with generous margins around each, each confined to own half. Genuinely transparent background, no duplicate legs, no extra feet, no scene, no logo or text, no shadows, no mannequin or disembodied fabric accessories. Beautiful delicate grounded human proportions in antique storybook gouache. The shoes must be distinct intact side-view silhouettes so each ankle and whole shoe can be rigged and rotated independently.

## Crimson flower

The intro uses a [crimson flower and matching petals](src/assets/story-crimson-flower.webp), created with built-in ImageGen using the earlier crimson bloom and the previous sprite layout as references.

> Create a transparent square sprite atlas for the flower in a vintage gouache storybook animation. Use the first image ONLY for atlas layout: a complete single stem on the left and three isolated loose petals stacked on the right. Completely replace the pink spiral rose shape with the single handmade deep RED open flower shown between the characters in the second image. Keep that earlier distinctive rounded ruffled daisy-like silhouette: 7 full rounded petals in rich crimson and wine red radiating outwards, small textured antique golden yellow round center, slight irregular natural petal shape. Elevate it with beautiful soft handmade chenille and felt fibers painted with warm colored-pencil detail and soft shaded ridges. Main color ruby crimson #a22b43 and maroon #751e38, highlights muted warm strawberry red, no bubblegum pink. One thin mostly straight moss green stem with two elegant small green leaves directly below the red blossom and lots of BARE stalk under them for fingers to grip. Centre line of stem vertical at about x=30% of the atlas, end near y=94%. Bloom in top left below 5% and above 40% of canvas. Exactly 3 isolated individual rounded crimson petals from the same open flower in the right half, stacked at around 20%, 51%, and 78% height, all separated by clear blank space. No scene, no characters, no outline border, no cast shadows, no aura, no handwriting. True transparent background with clean alpha. Compact warm romantic boutique illustration, unmistakably dark reddish like the original early flower.
