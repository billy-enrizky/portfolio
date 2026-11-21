// The film's screen content: the request typed into its input, the page it makes, the notifications it sets off, the
// people, the pictures, the plans. The hero shots (src/hero) fill themselves from it. Write it from the brief:
//   node scripts/content.mjs --brief BRIEF.md --fetch --force   (--fetch downloads the faces and the pictures; --force
//   replaces this stand-in), then read it: keep what is true of the product, change the rest; node scripts/content.mjs --check.
import type { FilmContent } from './kit/screens';

export const CONTENT: FilmContent = {
  "meta": {
    "product": "Enrizky Brillian",
    "does": "builds software that saves teams time",
    "domain": "engineering",
    "date": "2026-11-01",
    "weekday": "Sunday",
    "now": "3:00 PM",
    "seed": "Enrizky Brillian",
    "currency": "$"
  },
  "people": [
    {
      "name": "Noor Novak",
      "first": "Noor",
      "handle": "noor-nov5"
    },
    {
      "name": "Mei Okafor",
      "first": "Mei",
      "handle": "mei.okafor"
    },
    {
      "name": "Kai Ibrahim",
      "first": "Kai",
      "handle": "kaii_81"
    },
    {
      "name": "Jade Brooks",
      "first": "Jade",
      "handle": "jade.brooks"
    },
    {
      "name": "Hana Rivera",
      "first": "Hana",
      "handle": "hana-riv2"
    },
    {
      "name": "Diego Osei",
      "first": "Diego",
      "handle": "diego_hq"
    },
    {
      "name": "Elias Jensen",
      "first": "Elias",
      "handle": "eliasj_81"
    },
    {
      "name": "Sofia Larsen",
      "first": "Sofia",
      "handle": "sofia_hq"
    },
    {
      "name": "Isaac Patel",
      "first": "Isaac",
      "handle": "isaac.patel"
    },
    {
      "name": "Victor Romero",
      "first": "Victor",
      "handle": "victor-rom6"
    },
    {
      "name": "Luca Alvarez",
      "first": "Luca",
      "handle": "lucaa_97"
    },
    {
      "name": "Talia Kaur",
      "first": "Talia",
      "handle": "talia-kau4"
    },
    {
      "name": "Elena Mercer",
      "first": "Elena",
      "handle": "elena_works"
    },
    {
      "name": "Jamal Quinn",
      "first": "Jamal",
      "handle": "jamalq_84"
    }
  ],
  "prompt": {
    "text": "Cut our AI cost per million tokens.",
    "placeholder": "Ask Enrizky to build it",
    "model": "Opus"
  },
  "url": {
    "url": "mail.google.com/mail/u/0/#inbox",
    "logo": "gmail",
    "action": "Connect inbox",
    "busy": "Syncing",
    "done": "Connected",
    "placeholder": "Connect an account"
  },
  "profile": {
    "name": "Enrizky Brillian",
    "handle": "@billy-enrizky",
    "verified": false,
    "stats": [
      "30 projects",
      "47 credentials"
    ],
    "action": "View my work",
    "done": "Opened"
  },
  "thumbs": [
    {
      "title": "Library meeting room",
      "meta": "4.7 · 7 min away"
    },
    {
      "title": "Studio by the river",
      "meta": "4.8 · 7 min away"
    },
    {
      "title": "Private room at Halden",
      "meta": "4.5 · 20 min away"
    },
    {
      "title": "Corner table at Lune",
      "meta": "4.8 · 5 min away"
    },
    {
      "title": "Conference room 4B",
      "meta": "4.6 · 11 min away"
    },
    {
      "title": "Rooftop room, 12 people",
      "meta": "4.9 · 17 min away"
    },
    {
      "title": "Garden terrace, heated",
      "meta": "4.9 · 4 min away"
    },
    {
      "title": "Quiet café near the office",
      "meta": "4.9 · 6 min away"
    },
    {
      "title": "Hotel bar, open late",
      "meta": "4.7 · 25 min away"
    }
  ],
  "comments": {
    "comments": [
      {
        "name": "Mei Okafor",
        "handle": "Mei Okafor",
        "ago": "11 hours ago",
        "text": "Can you send me the notes from yesterday?",
        "likes": 293,
        "replies": 1
      },
      {
        "name": "Kai Ibrahim",
        "handle": "Kai Ibrahim",
        "ago": "20 hours ago",
        "text": "Lunch is on me if we finish by noon.",
        "likes": 263,
        "replies": 1
      },
      {
        "name": "Jade Brooks",
        "handle": "Jade Brooks",
        "ago": "22 hours ago",
        "text": "Approved. Go ahead and send it.",
        "likes": 43
      },
      {
        "name": "Hana Rivera",
        "handle": "Hana Rivera",
        "ago": "23 hours ago",
        "text": "Sent the deck, have a look before 3.",
        "likes": 16,
        "replies": 12
      },
      {
        "name": "Diego Osei",
        "handle": "Diego Osei",
        "ago": "1 day ago",
        "text": "Can we move the sync to Thursday?",
        "likes": 161
      },
      {
        "name": "Elias Jensen",
        "handle": "Elias Jensen",
        "ago": "1 day ago",
        "text": "Booked the room for Friday, it fits all of us.",
        "likes": 105
      }
    ],
    "header": {
      "label": "Reading {n} messages",
      "total": 858
    }
  },
  "notices": {
    "items": [
      {
        "app": "slack",
        "glyph": "chat",
        "title": "Text-to-SQL",
        "body": "93% accuracy in eight weeks",
        "ago": "now"
      },
      {
        "app": "slack",
        "glyph": "check",
        "title": "Cross-cloud agents",
        "body": "73% fewer API calls",
        "ago": "1m ago"
      },
      {
        "app": "slack",
        "glyph": "bolt",
        "title": "Browser automation",
        "body": "15+ manual steps replaced",
        "ago": "2m ago"
      },
      {
        "app": "slack",
        "glyph": "database",
        "title": "Finance pipeline",
        "body": "1,400,883 rows published",
        "ago": "3m ago"
      },
      {
        "app": "slack",
        "glyph": "doc",
        "title": "Document platform",
        "body": "984 files in 24 weeks",
        "ago": "4m ago"
      }
    ]
  },
  "payments": {
    "items": [
      {
        "title": "Lunch with a client",
        "sub": "Sun, Nov 1",
        "value": "$135.04",
        "glyph": "card"
      },
      {
        "title": "Train to the airport",
        "sub": "Thu, Oct 29",
        "value": "$37.64",
        "glyph": "card"
      },
      {
        "title": "Hotel, one night",
        "sub": "Thu, Oct 29",
        "value": "$115",
        "glyph": "card"
      },
      {
        "title": "Taxi to the venue",
        "sub": "Sun, Nov 1",
        "value": "$135.56",
        "glyph": "card"
      },
      {
        "title": "Team coffee",
        "sub": "Wed, Oct 28",
        "value": "$216.43",
        "glyph": "card"
      },
      {
        "title": "Printing for the workshop",
        "sub": "Sun, Nov 1",
        "value": "$59.46",
        "glyph": "card"
      }
    ],
    "header": {
      "title": "Expenses this week",
      "value": 699.13,
      "money": true,
      "currency": "$"
    }
  },
  "products": {
    "items": [
      {
        "title": "Review the venue contract",
        "sub": "30 min · video call",
        "value": "3:30 PM",
        "glyph": "mail"
      },
      {
        "title": "Call with Kai",
        "sub": "Due Thu, Nov 5",
        "value": "4:45 PM",
        "glyph": "calendar"
      },
      {
        "title": "Send the Q4 numbers",
        "sub": "Room 4B · 15 min",
        "value": "6:00 PM",
        "glyph": "doc"
      },
      {
        "title": "Pick up the passports",
        "sub": "Due today",
        "value": "7:00 PM",
        "glyph": "check"
      }
    ]
  },
  "steps": {
    "title": "What I shipped",
    "sub": "AI and automation at IBM",
    "steps": [
      {
        "label": "Text-to-SQL, 93% accuracy"
      },
      {
        "label": "Agents across two clouds"
      },
      {
        "label": "15+ manual steps automated"
      }
    ]
  },
  "progress": {
    "label": "Planning your week · {n}%",
    "to": 71
  },
  "plans": {
    "plans": [
      {
        "name": "Cross-cloud agents",
        "price": "73%",
        "period": "fewer API calls",
        "features": [
          "Five domain agents",
          "Three orchestration modes",
          "124 unit tests"
        ],
        "cta": "Azure and AWS"
      },
      {
        "name": "Text-to-SQL",
        "price": "93%",
        "period": "accuracy in eight weeks",
        "featured": true,
        "badge": "$300K+ contract",
        "features": [
          "Six agents",
          "Five production databases",
          "Non-SQL staff can query"
        ],
        "cta": "AWS"
      },
      {
        "name": "Browser automation",
        "price": "15+",
        "period": "manual steps replaced",
        "features": [
          "Seven SAP use cases",
          "51 seconds on average",
          "75% lower inference cost"
        ],
        "cta": "OpenBrowser"
      }
    ],
    "currency": ""
  },
  "doc": {
    "brand": "Enrizky Brillian",
    "title": "Cost per million tokens",
    "accentWord": "tokens",
    "lead": "Gemma 4 31B on eight A100 GPUs, served with vLLM.",
    "section": "What changed",
    "body": [
      "Served the model inside the VPC and tuned how requests are batched. Throughput reached 10,410.60 tokens a second at 512 concurrent requests, with zero errors at 1,024.",
      "The cost per million tokens fell from $132.56 with one request at a time to $0.19 at 512, after FP8 weights and multi-token prediction added a further 4.05x."
    ],
    "table": {
      "head": [
        "#",
        "Concurrent requests",
        "Cost per million tokens"
      ],
      "rows": [
        [
          "1",
          "1",
          "$132.56"
        ],
        [
          "2",
          "512",
          "$0.19"
        ]
      ],
      "numbered": true
    }
  },
  "code": {
    "file": "week.json",
    "lang": "json",
    "code": "[\n  { \"time\": \"9:00 AM\", \"with\": \"Mei\", \"what\": \"Venue walkthrough\" },\n  { \"time\": \"10:15 AM\", \"with\": \"Kai\", \"what\": \"Contract review\" },\n  { \"time\": \"11:30 AM\", \"with\": \"Jade\", \"what\": \"Team sync\" },\n  { \"time\": \"12:45 PM\", \"with\": \"Hana\", \"what\": \"Call with the bank\" }\n]",
    "tabs": []
  },
  "reply": {
    "ask": "What is left for me to finish today?",
    "who": {
      "name": "Enrizky Brillian"
    },
    "text": "I read your calendar, inbox and tasks. Three things matter today:",
    "items": [
      {
        "text": "Reply to Kai about the contract",
        "glyph": "checkCircle"
      },
      {
        "text": "Review the new venue photos",
        "glyph": "calendar"
      },
      {
        "text": "Daily sync at 3:30 PM",
        "glyph": "doc"
      }
    ],
    "close": "Shall I deal with the first two for you?"
  },
  "request": {
    "label": "Asked most this week",
    "text": "Can we move the sync?",
    "people": [
      {
        "name": "Luca Alvarez"
      },
      {
        "name": "Talia Kaur"
      },
      {
        "name": "Elena Mercer"
      }
    ],
    "count": 14,
    "countLabel": "{n} messages"
  },
  "cover": {
    "kicker": "Enrizky Brillian",
    "items": [
      {
        "title": "Your week, planned",
        "sub": "Plan · 12 tasks"
      },
      {
        "title": "Board meeting prep",
        "sub": "Brief · 6 pages"
      },
      {
        "title": "Trip to Lisbon",
        "sub": "Itinerary · 3 days"
      }
    ]
  }
};

/**
 * What the newer house scenes take beyond CONTENT (acts/bank.tsx fillOf reads it; a film without this export plays the
 * scenes' own defaults): the phone app phone-pullback opens (its feed cards, the two rows its "+" opens, the search
 * field and the tabs), and the real photographs some scenes stand on, fetched at film time with scripts/assets.mjs
 * (open collections, no credit needed) and written here with their corners in the photograph's own pixels, read off a
 * gridded copy: `street` 1-4 street or wall photographs with the four corners of each board (street-poster puts the
 * product's output on them), `room` a room photograph with the four corners of its screen (room-push pushes into it),
 * `clouds` a cloud-sea plate (`node scripts/assets.mjs plate clouds`) for cloud-dome. Empty `street` / null `room`: the
 * deal never plays those scenes (src/bank.ts CONTENT_HAVE); no `clouds`: cloud-dome paints its own cloud sea.
 */
type Pt = readonly [number, number];
export const SCENE_CONTENT: {
  phone: { search?: string; tabs?: readonly [string, string]; menu: readonly [string, string]; nav?: readonly [string, string, string, string]; cards: readonly { who: string; meta?: string; photo?: string; title: string; body?: string; tags?: readonly string[]; action?: string }[] };
  plates: { clouds?: string; street: readonly { src: string; w: number; h: number; boards: readonly (readonly [Pt, Pt, Pt, Pt])[]; night?: boolean }[]; room: { src: string; w: number; h: number; screen: readonly [Pt, Pt, Pt, Pt] } | null };
} = {
  phone: {
    search: 'What did he ship?',
    tabs: ['Systems', 'Research'],
    menu: ['New request', 'Import'],
    nav: ['Home', 'Work', 'Papers', 'Contact'],
    cards: [
      { who: 'Text-to-SQL', meta: 'now', title: '93% accuracy in eight weeks', body: 'Six agents across five production databases.', tags: ['AWS', 'SQL'] },
      { who: 'Cross-cloud agents', meta: '1m ago', title: '73% fewer API calls' },
    ],
  },
  plates: { street: [], room: null },
};
