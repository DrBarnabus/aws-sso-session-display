export const getContrastingTextColour = (hexColour: string): string => {
  if (hexColour.startsWith('#')) {
    hexColour = hexColour.slice(1);
  }

  const r = parseInt(hexColour.substring(0, 2), 16);
  const g = parseInt(hexColour.substring(2, 4), 16);
  const b = parseInt(hexColour.substring(4, 6), 16);

  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance >= 128 ? '#000000' : '#ffffff';
};
