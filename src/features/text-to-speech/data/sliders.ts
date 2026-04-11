interface Slider {
  id: "pace" | "speechSampleRate";
  label: string;
  leftLabel: string;
  rightLabel: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export const sliders: Slider[] = [
  {
    id: "pace",
    label: "Speed",
    leftLabel: "Slow",
    rightLabel: "Fast",
    min: 0.5,
    max: 2,
    step: 0.1,
    defaultValue: 1.0,
  }
];