import { SITE_DESCRIPTION, SITE_TITLE } from "./seo";

export type LandingCard = {
  title: string;
  description: string;
  href?: string;
};

export type LandingFaq = {
  question: string;
  answer: string;
};

export type DownloaderLandingContent = {
  slug: string;
  path: string;
  navLabel: string;
  metadataTitle: string;
  metadataDescription: string;
  keywords: string[];
  h1: string;
  intro: string;
  platformHeading: string;
  platformIntro: string;
  platformCards: LandingCard[];
  qualityHeading: string;
  qualityIntro: string;
  qualityPoints: string[];
  faqs: LandingFaq[];
  supportedSites?: string[];
};

export const SUPPORTED_SITES = [
  "YouTube",
  "YouTube Shorts",
  "YouTube Music",
  "Instagram",
  "Instagram Reels",
  "TikTok",
  "Twitter / X",
  "Facebook",
  "Reddit",
  "Vimeo",
  "Dailymotion",
  "Twitch",
  "SoundCloud",
  "Bilibili",
  "Pinterest",
  "Tumblr",
];

export const landingPages = {
  home: {
    slug: "",
    path: "/",
    navLabel: "All Video Downloader",
    metadataTitle: SITE_TITLE,
    metadataDescription: SITE_DESCRIPTION,
    keywords: [
      "video downloader",
      "online video downloader",
      "youtube downloader",
      "instagram downloader",
      "twitter video downloader",
      "mp4 downloader",
      "mp3 downloader",
    ],
    h1: "YouTube, Instagram & Twitter/X Video Downloader",
    intro:
      "Paste a YouTube, Instagram, Twitter/X, TikTok, or other public video link to download MP4 video or MP3 audio in the best available quality.",
    platformHeading: "Online video downloader for every major platform",
    platformIntro:
      "Stream Save is built for high-intent video download searches: YouTube downloader, Instagram downloader, Twitter video downloader, TikTok downloader, MP4 downloader, and MP3 audio downloader.",
    platformCards: [
      {
        title: "YouTube Downloader",
        description:
          "Save supported public YouTube videos as MP4 or extract clean audio as MP3, M4A, or OPUS with selectable quality.",
        href: "/youtube-video-downloader",
      },
      {
        title: "Instagram Downloader",
        description:
          "Download supported public Instagram videos, Reels, and clips from a browser without installing another app.",
        href: "/instagram-video-downloader",
      },
      {
        title: "Twitter/X Downloader",
        description:
          "Convert public Twitter/X video posts into direct MP4 downloads for offline viewing and archiving.",
        href: "/twitter-video-downloader",
      },
      {
        title: "TikTok and 1,800+ Sites",
        description:
          "Use one online video downloader for TikTok and many other supported platforms when downloadable formats are available.",
        href: "/tiktok-video-downloader",
      },
    ],
    qualityHeading: "Fast MP4 video and MP3 audio downloads",
    qualityIntro:
      "Fetch available formats first, then choose the video quality or audio format that fits the source. The downloader keeps the workflow direct for phones, tablets, laptops, and desktops.",
    qualityPoints: [
      "Download from YouTube, Instagram, Twitter/X, TikTok, and 1,800+ other supported sites in one place.",
      "Save MP4 video with quality choices from 144p to 8K whenever the source provides them.",
      "Extract audio as MP3, M4A, or OPUS with practical bitrate options shown after the link is fetched.",
      "Follow live job progress through queued, processing, completed, and failed states.",
      "No account, app install, or browser extension required — it runs in any modern browser.",
    ],
    supportedSites: SUPPORTED_SITES,
    faqs: [
      {
        question: "Can I download YouTube videos?",
        answer:
          "The downloader supports public YouTube links when formats are available. Only download videos you own, created, or have permission to save.",
      },
      {
        question: "Does it work with Instagram videos and Reels?",
        answer:
          "Yes. Public Instagram video and Reel links are supported when the source exposes downloadable media formats.",
      },
      {
        question: "Can I download Twitter/X videos?",
        answer:
          "Public Twitter/X video posts can be processed into MP4 downloads when the video source is available.",
      },
      {
        question: "Which audio formats can I export?",
        answer:
          "Audio can be exported as MP3, M4A, or OPUS, with bitrate choices shown after the link is fetched.",
      },
      {
        question: "Do I need to install an app or extension?",
        answer:
          "No. The downloader runs entirely in your browser on desktop and mobile, so there is nothing to install and no extension to add.",
      },
      {
        question: "Is there a download limit or sign-up?",
        answer:
          "No account is required to use the downloader for supported public links, and you can fetch formats as often as you need.",
      },
      {
        question: "Which sites are supported?",
        answer:
          "Alongside YouTube, Instagram, Twitter/X, and TikTok, the tool can process links from Facebook, Reddit, Vimeo, Dailymotion, and 1,800+ other sites when downloadable media is available.",
      },
    ],
  },
  video: {
    slug: "video-downloader",
    path: "/video-downloader",
    navLabel: "Video Downloader",
    metadataTitle: "Free Online Video Downloader - MP4 & MP3",
    metadataDescription:
      "Use a free online video downloader for YouTube, Instagram, Twitter/X, TikTok, and 1,800+ sites. Download MP4 video or MP3 audio from public links.",
    keywords: [
      "video downloader",
      "online video downloader",
      "free video downloader",
      "download video online",
      "mp4 downloader",
      "mp3 downloader",
    ],
    h1: "Free Online Video Downloader",
    intro:
      "Paste a public video URL and download available MP4 video or MP3 audio from YouTube, Instagram, Twitter/X, TikTok, and many other supported sites.",
    platformHeading: "Download videos online from public links",
    platformIntro:
      "This page targets the broad video downloader search intent with a direct paste-and-download workflow, platform coverage, quality selection, and clear copyright guidance.",
    platformCards: [
      {
        title: "All-in-one link downloader",
        description:
          "Use one downloader for public video links from YouTube, Instagram, TikTok, Twitter/X, Facebook, Reddit, Vimeo, and more.",
      },
      {
        title: "MP4 video downloads",
        description:
          "Choose from available video qualities and save the format that works best for your phone, computer, or editing workflow.",
      },
      {
        title: "MP3 audio extraction",
        description:
          "Switch to audio-only mode to extract MP3, M4A, or OPUS audio with bitrate options shown after the URL is fetched.",
      },
      {
        title: "No software required",
        description:
          "The downloader works in a modern browser, so users can download from desktop, Android, iPhone, tablet, or laptop.",
      },
    ],
    qualityHeading: "Why this video downloader is built for search users",
    qualityIntro:
      "People searching for a video downloader usually want speed, supported platforms, reliable quality choices, and a simple process without account creation.",
    qualityPoints: [
      "One paste-and-download workflow for public links from dozens of major video platforms.",
      "Pick the exact MP4 resolution you need, from small mobile files up to full HD and 4K when available.",
      "Convert any supported video into MP3, M4A, or OPUS audio without extra software.",
      "Real-time progress so you always know whether a download is queued, running, or finished.",
      "Works the same on Android, iPhone, Windows, macOS, and tablets — nothing to install.",
    ],
    supportedSites: SUPPORTED_SITES,
    faqs: [
      {
        question: "How do I download a video online?",
        answer:
          "Copy the public video link, paste it into the downloader, fetch the available formats, choose a video or audio option, and start the download.",
      },
      {
        question: "Can I download videos without installing software?",
        answer:
          "Yes. The downloader runs in the browser and does not require a desktop app, mobile app, or browser extension.",
      },
      {
        question: "Can I convert a video to MP3?",
        answer:
          "Yes. Use audio-only mode and choose MP3, M4A, or OPUS when the source media can be processed.",
      },
      {
        question: "Is every website supported?",
        answer:
          "No downloader can support every website. Public pages with compatible video formats are more likely to work.",
      },
      {
        question: "What video quality can I download?",
        answer:
          "You can pick from the resolutions the source provides, which can range from 144p up to 4K or 8K for high-resolution uploads.",
      },
      {
        question: "Does it work on a phone?",
        answer:
          "Yes. The downloader is responsive and works in mobile browsers on Android and iPhone as well as on desktops and tablets.",
      },
      {
        question: "Is the online video downloader free?",
        answer:
          "Yes, it is free to fetch formats and download supported public links, and no account is required.",
      },
    ],
  },
  youtube: {
    slug: "youtube-video-downloader",
    path: "/youtube-video-downloader",
    navLabel: "YouTube Downloader",
    metadataTitle: "YouTube Video Downloader - MP4 & MP3 Downloads",
    metadataDescription:
      "Download supported public YouTube videos as MP4 or extract YouTube audio as MP3, M4A, or OPUS with quality options up to 8K when available.",
    keywords: [
      "youtube downloader",
      "youtube video downloader",
      "download youtube video",
      "youtube to mp4",
      "youtube to mp3",
      "youtube audio downloader",
    ],
    h1: "YouTube Video Downloader",
    intro:
      "Paste a public YouTube video link to fetch available MP4 video qualities or download audio as MP3, M4A, or OPUS.",
    platformHeading: "Download YouTube videos as MP4 or audio",
    platformIntro:
      "This page is focused on YouTube downloader searches: YouTube video downloader, YouTube to MP4, YouTube to MP3, and YouTube audio downloader.",
    platformCards: [
      {
        title: "YouTube to MP4",
        description:
          "Fetch available YouTube video streams and select the MP4 quality that matches your source and device.",
      },
      {
        title: "YouTube to MP3",
        description:
          "Extract audio from supported YouTube links as MP3, M4A, or OPUS with bitrate options.",
      },
      {
        title: "HD and 4K/8K when available",
        description:
          "If the source provides higher resolutions, the downloader shows available quality choices before processing.",
      },
      {
        title: "Public videos only",
        description:
          "Private, restricted, deleted, or unavailable videos cannot be downloaded by a public online downloader.",
      },
    ],
    qualityHeading: "A focused YouTube downloader workflow",
    qualityIntro:
      "YouTube searchers expect a clear three-step flow: copy the YouTube URL, paste it into the tool, then choose MP4 video or audio-only output.",
    qualityPoints: [
      "Fetch every available YouTube stream and choose the MP4 quality that matches the source.",
      "Pull HD, 4K, or 8K when the original upload provides those resolutions.",
      "Convert YouTube videos and Shorts to MP3, M4A, or OPUS audio with selectable bitrate.",
      "Live progress for each YouTube download job from queue to completed file.",
      "Runs entirely in the browser — no YouTube login, app, or extension needed.",
    ],
    faqs: [
      {
        question: "Can I download YouTube videos in MP4?",
        answer:
          "Yes, supported public YouTube links can be processed as MP4 video downloads when downloadable formats are available.",
      },
      {
        question: "Can I download YouTube audio as MP3?",
        answer:
          "Yes. Switch to audio-only mode and choose MP3, M4A, or OPUS with the available bitrate options.",
      },
      {
        question: "Can this download YouTube Shorts?",
        answer:
          "Supported public YouTube Shorts can be fetched when the source exposes downloadable formats.",
      },
      {
        question: "Is it legal to download YouTube videos?",
        answer:
          "Only download YouTube content you own, created, or have permission to save. Respect copyright and YouTube's terms.",
      },
      {
        question: "Can I download a YouTube video in 4K or 8K?",
        answer:
          "Yes, when the original upload includes those resolutions the downloader lists them so you can pick 4K or 8K before processing.",
      },
      {
        question: "Do I need to sign in to my YouTube account?",
        answer:
          "No. Public YouTube links are processed in the browser without a login, an app, or a browser extension.",
      },
      {
        question: "Why does a YouTube link sometimes fail?",
        answer:
          "Private, age-restricted, members-only, region-locked, or removed videos may not expose downloadable formats and can fail as a result.",
      },
    ],
  },
  instagram: {
    slug: "instagram-video-downloader",
    path: "/instagram-video-downloader",
    navLabel: "Instagram Downloader",
    metadataTitle: "Instagram Video Downloader - Reels, Videos & Stories",
    metadataDescription:
      "Download supported public Instagram videos, Reels, and clips from a browser. Paste an Instagram URL and save available video as MP4.",
    keywords: [
      "instagram video downloader",
      "instagram downloader",
      "instagram reels downloader",
      "download instagram video",
      "instagram to mp4",
      "instagram story downloader",
    ],
    h1: "Instagram Video Downloader",
    intro:
      "Paste a public Instagram video or Reel URL and fetch available MP4 download options directly in your browser.",
    platformHeading: "Save public Instagram videos and Reels",
    platformIntro:
      "This page matches Instagram video downloader intent with focused copy for Instagram Reels, video posts, public clips, and browser-based MP4 downloads.",
    platformCards: [
      {
        title: "Instagram Reels Downloader",
        description:
          "Paste a public Reel link and download the available video file when Instagram exposes compatible media.",
      },
      {
        title: "Instagram Video Downloader",
        description:
          "Save public Instagram video posts as MP4 from a phone, tablet, laptop, or desktop browser.",
      },
      {
        title: "No login required",
        description:
          "The downloader does not ask users to sign in for public links. Private accounts and protected content are not supported.",
      },
      {
        title: "Original quality when available",
        description:
          "Available qualities depend on the source. The tool displays options after fetching the Instagram URL.",
      },
    ],
    qualityHeading: "Built for Instagram downloader searches",
    qualityIntro:
      "Users searching for an Instagram downloader usually need a fast copy-paste flow for Reels and public video posts, plus clear privacy limits.",
    qualityPoints: [
      "Save public Instagram Reels, video posts, and clips as MP4 from any browser.",
      "Fetch the best quality Instagram exposes for the public link before you download.",
      "Optionally extract Instagram audio as MP3, M4A, or OPUS for supported clips.",
      "Track download progress in real time without refreshing the page.",
      "No Instagram login required for public content — nothing to install.",
    ],
    faqs: [
      {
        question: "How do I download an Instagram video?",
        answer:
          "Copy the public Instagram video or Reel link, paste it into the input, fetch formats, and download the available MP4 file.",
      },
      {
        question: "Can I download Instagram Reels?",
        answer:
          "Yes, supported public Instagram Reels can be processed when downloadable media formats are available.",
      },
      {
        question: "Can I download private Instagram videos?",
        answer:
          "No. Private accounts, protected posts, and content that requires login are not supported.",
      },
      {
        question: "Will the Instagram video lose quality?",
        answer:
          "The downloader shows available source formats. Final quality depends on what Instagram provides for the public URL.",
      },
      {
        question: "Can I extract audio from an Instagram Reel?",
        answer:
          "Yes. Use audio-only mode to save the sound from a supported public Reel as MP3, M4A, or OPUS when the source allows it.",
      },
      {
        question: "Do I need the Instagram app to download a video?",
        answer:
          "No. Everything runs in your browser on phone or desktop, so there is no app or extension to install.",
      },
      {
        question: "Why won't my Instagram link download?",
        answer:
          "Links from private accounts, Stories that have expired, or posts that have been removed may not expose downloadable media and can fail.",
      },
    ],
  },
  twitter: {
    slug: "twitter-video-downloader",
    path: "/twitter-video-downloader",
    navLabel: "Twitter/X Downloader",
    metadataTitle: "Twitter/X Video Downloader - Save X Videos in MP4",
    metadataDescription:
      "Download supported public Twitter/X videos as MP4. Paste a tweet or X post URL, fetch formats, and save available video to your device.",
    keywords: [
      "twitter video downloader",
      "x video downloader",
      "download twitter video",
      "download x video",
      "twitter to mp4",
      "save twitter videos",
    ],
    h1: "Twitter/X Video Downloader",
    intro:
      "Paste a public Twitter or X post URL to fetch available video formats and save supported clips as MP4.",
    platformHeading: "Download public Twitter/X videos",
    platformIntro:
      "This page is tuned for Twitter video downloader, X video downloader, save Twitter videos, and Twitter to MP4 search intent.",
    platformCards: [
      {
        title: "Twitter to MP4",
        description:
          "Convert supported public Twitter video posts into downloadable MP4 files for offline viewing.",
      },
      {
        title: "X video downloader",
        description:
          "Both x.com and twitter.com post URLs can be used when the video is public and available.",
      },
      {
        title: "Mobile and desktop ready",
        description:
          "Download from iPhone, Android, Windows, macOS, tablets, and modern desktop browsers.",
      },
      {
        title: "Public posts only",
        description:
          "Protected accounts, deleted posts, private messages, and unavailable media cannot be processed.",
      },
    ],
    qualityHeading: "A focused Twitter/X downloader page",
    qualityIntro:
      "Twitter/X searchers need exact URL guidance, public-post limits, MP4 output, and a no-install download flow.",
    qualityPoints: [
      "Turn public Twitter/X video posts into direct MP4 downloads in a couple of taps.",
      "Works with both x.com and twitter.com post URLs when the media is public.",
      "Extract audio from Twitter/X clips as MP3, M4A, or OPUS when the source allows.",
      "Live job progress shows queued, processing, and completed states for every download.",
      "Download from phone or desktop browsers with no app and no sign-in.",
    ],
    faqs: [
      {
        question: "How do I download a Twitter video?",
        answer:
          "Copy the public tweet or X post URL, paste it into the downloader, fetch the media, and choose an available MP4 option.",
      },
      {
        question: "Does this work with x.com links?",
        answer:
          "Yes. Public x.com and twitter.com post URLs can be processed when the media is available.",
      },
      {
        question: "Can I download videos from protected accounts?",
        answer:
          "No. Protected accounts, private messages, deleted posts, and content behind login restrictions are not supported.",
      },
      {
        question: "Can I extract audio from Twitter/X videos?",
        answer:
          "Yes, switch to audio-only mode and choose MP3, M4A, or OPUS when the source can be processed.",
      },
      {
        question: "Where do I find the link to a Twitter/X video?",
        answer:
          "Open the post, tap the share icon, choose Copy link, then paste that URL into the downloader to fetch available formats.",
      },
      {
        question: "Can I download Twitter/X videos on my phone?",
        answer:
          "Yes. The downloader works in mobile browsers on Android and iPhone as well as on desktop, with nothing to install.",
      },
    ],
  },
  tiktok: {
    slug: "tiktok-video-downloader",
    path: "/tiktok-video-downloader",
    navLabel: "TikTok Downloader",
    metadataTitle: "TikTok Video Downloader - MP4 & MP3 Downloads",
    metadataDescription:
      "Download supported public TikTok videos as MP4 or extract TikTok audio as MP3, M4A, or OPUS from a browser.",
    keywords: [
      "tiktok video downloader",
      "tiktok downloader",
      "download tiktok video",
      "tiktok to mp4",
      "tiktok to mp3",
      "save tiktok videos",
    ],
    h1: "TikTok Video Downloader",
    intro:
      "Paste a public TikTok video URL to fetch available MP4 video formats or extract audio in MP3, M4A, or OPUS.",
    platformHeading: "Download supported public TikTok videos",
    platformIntro:
      "This page targets TikTok downloader searches with a direct copy-paste tool, MP4 video output, audio extraction, and mobile-friendly usage.",
    platformCards: [
      {
        title: "TikTok to MP4",
        description:
          "Save supported public TikTok videos as MP4 files from a browser without installing an app.",
      },
      {
        title: "TikTok to MP3",
        description:
          "Use audio-only mode to extract TikTok audio as MP3, M4A, or OPUS when available.",
      },
      {
        title: "Works on phones and desktops",
        description:
          "The downloader is responsive for Android, iPhone, tablets, laptops, and desktop browsers.",
      },
      {
        title: "Availability depends on source",
        description:
          "Some TikTok links may be restricted, deleted, private, regional, or otherwise unavailable for download.",
      },
    ],
    qualityHeading: "A simple TikTok download flow",
    qualityIntro:
      "TikTok downloader searchers usually want a fast MP4 save option, audio extraction, and no app installation.",
    qualityPoints: [
      "Save supported public TikTok videos as MP4 straight from the browser.",
      "Pick from the available TikTok video qualities shown after fetching the link.",
      "Extract TikTok audio as MP3, M4A, or OPUS for supported sounds and clips.",
      "Real-time progress for each TikTok download from queue to finished file.",
      "No TikTok account or app needed — works on Android, iPhone, and desktop browsers.",
    ],
    faqs: [
      {
        question: "How do I download a TikTok video?",
        answer:
          "Copy the public TikTok video URL, paste it into the downloader, fetch formats, and save an available MP4 option.",
      },
      {
        question: "Can I save TikTok audio as MP3?",
        answer:
          "Yes. Use audio-only mode and choose MP3, M4A, or OPUS if the source can be processed.",
      },
      {
        question: "Does every TikTok link work?",
        answer:
          "No. Private, deleted, restricted, or unavailable videos may fail because the source does not expose downloadable media.",
      },
      {
        question: "Do I need a TikTok account?",
        answer:
          "No account is required for supported public links processed through the browser-based downloader.",
      },
      {
        question: "How do I copy a TikTok video link?",
        answer:
          "Open the video, tap Share, then choose Copy link and paste that URL into the downloader to fetch available formats.",
      },
      {
        question: "Can I download TikTok videos on iPhone or Android?",
        answer:
          "Yes. The downloader runs in mobile browsers on both iPhone and Android, so there is no app to install.",
      },
    ],
  },
} as const satisfies Record<string, DownloaderLandingContent>;

export const allLandingPages = Object.values(landingPages);

export const dynamicLandingPages = allLandingPages.filter(
  (page) => page.slug.length > 0,
);

export function getLandingPageBySlug(slug: string) {
  return dynamicLandingPages.find((page) => page.slug === slug);
}

export const landingNavLinks = allLandingPages.map((page) => ({
  href: page.path,
  label: page.navLabel,
}));
