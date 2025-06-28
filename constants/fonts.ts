const FontFamilies = {
  heading: "BlackOpsOne",
  body: "SpaceMono",
};

// To make it easy to change fonts, we define them here
export const Fonts = {
  // Headings
  h1: {
    fontFamily: FontFamilies.heading,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: FontFamilies.heading,
    fontSize: 24,
    lineHeight: 32,
  },
  // Body Text
  body_lg: {
    fontFamily: FontFamilies.body,
    fontSize: 18,
    lineHeight: 24,
  },
  body_md: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    lineHeight: 22,
  },
  body_sm: {
    fontFamily: FontFamilies.body,
    fontSize: 14,
    lineHeight: 20,
  },
  // Special cases
  button: {
    fontFamily: FontFamilies.heading,
    fontSize: 16,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
  },
};
