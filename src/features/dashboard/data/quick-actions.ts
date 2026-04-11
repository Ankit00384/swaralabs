export interface QuickAction {
  title: string;
  description: string;
  gradient: string;
  href: string;
};

export const quickActions: QuickAction[] = [
  {
    title: "Narrate an Indian Story",
    description: "Bring rich cultural stories to life with expansive Indian voices",
    gradient: "from-sky-500 to-cyan-200",
    href: "/text-to-speech?text=In a small village in Rajasthan, there lived an old clockmaker whose clocks never told the right time — but they always told the truth. One rainy evening, a stranger walked in and asked for a clock that could show him his future.",
  },
  {
    title: "Record a Local Ad",
    description: "Create professional advertisements targeted for regional Indian markets",
    gradient: "from-rose-500 to-orange-200",
    href: "/text-to-speech?text=Introducing BrightBean Chai — the smoothest roast you'll ever taste. Sourced from the hills of Assam, slow-roasted to perfection, and delivered fresh to your door every single week. Wake up to something extraordinary. Try BrightBean today and get your first bag free.",
  },
  {
    title: "Direct a Bollywood Scene",
    description: "Generate dramatic dialogue for regional film and video",
    gradient: "from-indigo-500 to-blue-200",
    href: "/text-to-speech?text=The monsoon rain hammered against the window as she turned to face him. 'You knew, didn't you?' she whispered, her voice barely holding together. He stepped forward, jaw clenched. 'I did what I had to do.' The silence between them was louder than the storm outside.",
  },
  {
    title: "Voice a Game Character",
    description: "Build immersive worlds with dynamic, culturally resonant voices",
    gradient: "from-amber-500 to-orange-200",
    href: "/text-to-speech?text=Listen up, adventurer. The ancient temple is crumbling, and the Crystal has been shattered into seven pieces. You are the only one who can reassemble it. Gather your courage, sharpen your blade, and meet me at the gates. Time is not on our side.",
  },
  {
    title: "Introduce Your Podcast",
    description: "Hook your regional listeners from the very first second",
    gradient: "from-blue-600 to-sky-200",
    href: "/text-to-speech?text=Namaste everyone, welcome back to another episode of The Curious Mind — the podcast where we dig into the stories, science, and strange ideas that shape our world. I'm your host, and today we have an incredible guest who's going to challenge everything you thought you knew.",
  },
  {
    title: "Guide a Meditation",
    description: "Craft soothing, calming audio for wellness and yoga content",
    gradient: "from-emerald-500 to-lime-200",
    href: "/text-to-speech?text=Close your eyes and take a deep breath in. Hold it gently... and release. Feel the weight of the day slowly melting away. With each breath, you're sinking deeper into calm. There is nowhere else you need to be. Just here. Just now. Breathe in peace, breathe out tension.",
  },
];
