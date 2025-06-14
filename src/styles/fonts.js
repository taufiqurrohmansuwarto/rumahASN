import {
  Inter,
  Plus_Jakarta_Sans,
  Roboto,
  Source_Sans_3,
  Open_Sans,
} from "@next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

export const useFontJakarta = () => {
  return `${plusJakartaSans.style.fontFamily}, ${roboto.style.fontFamily},-apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, Arial, sans-serif `;
};

export const useFontInterRoboto = () => {
  return `${inter.style.fontFamily}, ${roboto.style.fontFamily},-apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, Arial, sans-serif `;
};

export const useFontSourceSans3 = () => {
  return `${sourceSans3.style.fontFamily}, ${openSans.style.fontFamily},-apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, Arial, sans-serif `;
};
