/**
 * Processed product media on Cloudinary (cloud `dmlolrov`), 2026-09-21.
 * Images: 1200x1500 (4:5) on cream #F5F1EA, claim/text overlays removed, faint contact shadow.
 * Videos: real CJ supplier clips, muted (ac_none), 12 s, 4:5, with a poster frame. Never AI-generated.
 * Source + edit notes: ../OneDrive/Claude projets/cmac-store/media/media-report.md
 * Used by prisma/seed.ts only while a product still shows untouched CJ photos (see seed rules).
 */

export type ProductVideo = { mp4: string; poster: string };
export type ProductMedia = { images: string[]; videos: ProductVideo[] };

export const MEDIA: Record<string, ProductMedia> = {
  "led-red-light-mask": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013183/cmac/products/led-red-light-mask/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013185/cmac/products/led-red-light-mask/final-1"
    ],
    "videos": []
  },
  "microcurrent-facial-lift-device": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013186/cmac/products/microcurrent-facial-lift-device/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013187/cmac/products/microcurrent-facial-lift-device/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011248/cmac/products/microcurrent-facial-lift-device/final-2"
    ],
    "videos": []
  },
  "ems-sculpting-v-roller": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013177/cmac/products/ems-sculpting-v-roller/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013178/cmac/products/ems-sculpting-v-roller/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013179/cmac/products/ems-sculpting-v-roller/final-2"
    ],
    "videos": []
  },
  "under-eye-glow-wand": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013203/cmac/products/under-eye-glow-wand/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013204/cmac/products/under-eye-glow-wand/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013204/cmac/products/under-eye-glow-wand/final-2"
    ],
    "videos": [
      {
        "mp4": "https://res.cloudinary.com/dmlolrov/video/upload/so_0,eo_12/c_fill,ar_4:5,g_auto,w_720/ac_none/q_auto/cmac/videos/under-eye-glow-wand.mp4",
        "poster": "https://res.cloudinary.com/dmlolrov/video/upload/so_1/c_fill,ar_4:5,g_auto,w_720/q_auto/cmac/videos/under-eye-glow-wand.jpg"
      }
    ]
  },
  "sonic-silicone-cleansing-brush": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013197/cmac/products/sonic-silicone-cleansing-brush/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011244/cmac/products/sonic-silicone-cleansing-brush/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013198/cmac/products/sonic-silicone-cleansing-brush/final-2",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011246/cmac/products/sonic-silicone-cleansing-brush/final-3"
    ],
    "videos": []
  },
  "facial-ice-roller": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013180/cmac/products/facial-ice-roller/colour-pink",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013180/cmac/products/facial-ice-roller/colour-green",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013181/cmac/products/facial-ice-roller/colour-purple",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013182/cmac/products/facial-ice-roller/colour-red",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013182/cmac/products/facial-ice-roller/colour-yellow",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011252/cmac/products/facial-ice-roller/final-1"
    ],
    "videos": []
  },
  "electric-scalp-massager": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013176/cmac/products/electric-scalp-massager/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011254/cmac/products/electric-scalp-massager/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011254/cmac/products/electric-scalp-massager/final-2",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011255/cmac/products/electric-scalp-massager/final-3"
    ],
    "videos": [
      {
        "mp4": "https://res.cloudinary.com/dmlolrov/video/upload/so_0,eo_12/c_fill,ar_4:5,g_auto,w_720/ac_none/q_auto/cmac/videos/electric-scalp-massager.mp4",
        "poster": "https://res.cloudinary.com/dmlolrov/video/upload/so_1/c_fill,ar_4:5,g_auto,w_720/q_auto/cmac/videos/electric-scalp-massager.jpg"
      }
    ]
  },
  "satin-sleep-mask": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013196/cmac/products/satin-sleep-mask/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011257/cmac/products/satin-sleep-mask/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011258/cmac/products/satin-sleep-mask/final-2",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011258/cmac/products/satin-sleep-mask/final-3"
    ],
    "videos": []
  },
  "spa-headband": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013199/cmac/products/spa-headband/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011260/cmac/products/spa-headband/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013200/cmac/products/spa-headband/final-2"
    ],
    "videos": []
  },
  "electric-makeup-brush-cleaner": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013173/cmac/products/electric-makeup-brush-cleaner/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011262/cmac/products/electric-makeup-brush-cleaner/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013174/cmac/products/electric-makeup-brush-cleaner/final-2",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790011263/cmac/products/electric-makeup-brush-cleaner/final-3"
    ],
    "videos": []
  },
  "satin-beauty-sleep-set": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013193/cmac/products/satin-beauty-sleep-set/final-0"
    ],
    "videos": []
  },
  "satin-scrunchie": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013194/cmac/products/satin-scrunchie/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013194/cmac/products/satin-scrunchie/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013195/cmac/products/satin-scrunchie/final-2"
    ],
    "videos": []
  },
  "pink-shell-makeup-pouch": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013188/cmac/products/pink-shell-makeup-pouch/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013188/cmac/products/pink-shell-makeup-pouch/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013189/cmac/products/pink-shell-makeup-pouch/final-2"
    ],
    "videos": []
  },
  "travel-makeup-organizer": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013201/cmac/products/travel-makeup-organizer/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013202/cmac/products/travel-makeup-organizer/final-1"
    ],
    "videos": [
      {
        "mp4": "https://res.cloudinary.com/dmlolrov/video/upload/so_2,eo_14/c_fill,ar_4:5,g_auto,w_720/ac_none/q_auto/cmac/videos/travel-makeup-organizer.mp4",
        "poster": "https://res.cloudinary.com/dmlolrov/video/upload/so_3/c_fill,ar_4:5,g_auto,w_720/q_auto/cmac/videos/travel-makeup-organizer.jpg"
      }
    ]
  },
  "cozy-fleece-socks": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013172/cmac/products/cozy-fleece-socks/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013172/cmac/products/cozy-fleece-socks/final-1"
    ],
    "videos": [
      {
        "mp4": "https://res.cloudinary.com/dmlolrov/video/upload/so_0,eo_12/c_fill,ar_4:5,g_auto,w_720/ac_none/q_auto/cmac/videos/cozy-fleece-socks.mp4",
        "poster": "https://res.cloudinary.com/dmlolrov/video/upload/so_1/c_fill,ar_4:5,g_auto,w_720/q_auto/cmac/videos/cozy-fleece-socks.jpg"
      }
    ]
  },
  "reusable-cleansing-puff": {
    "images": [
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013190/cmac/products/reusable-cleansing-puff/final-0",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013191/cmac/products/reusable-cleansing-puff/final-1",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013192/cmac/products/reusable-cleansing-puff/final-2",
      "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013193/cmac/products/reusable-cleansing-puff/final-3"
    ],
    "videos": []
  }
};
