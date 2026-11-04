import libraryHubBanner from '../assets/images/library-hub-banner-web.png';
import libraryHubLogo from '../assets/images/library-hub-logo.png';
import libraryDesk from '../assets/images/desk.png';
import mainBanner from '../assets/images/Main Banner.png';

/**
 * Centralized Image Registry for Library Hub Nawalpur.
 * 
 * Instructions:
 * - When real photographs are provided, place them inside `src/assets/images/`
 * - Import them here and assign them to the corresponding key.
 * - Components will automatically render the supplied image instead of the placeholder.
 */

export const libraryImages = {
  logo: {
    src: libraryHubLogo,
    alt: "Library Hub Official Logo",
    label: "Library Hub Wordmark Logo",
    aspectRatio: "aspect-[1024/158]",
    category: "Brand Identity",
  },
  banner: {
    src: mainBanner,
    alt: "Library Hub Nawalpur Official Facilities Banner - Now You Forget Your Disturbance",
    label: "Official Library Hub Main Banner",
    aspectRatio: "aspect-[6/5]",
    category: "Official Banner",
  },
  hero: {
    src: mainBanner,
    alt: "Library Hub Nawalpur Official Facilities Banner",
    label: "Official Library Hub Main Banner",
    aspectRatio: "aspect-[6/5]",
    category: "Official Banner",
  },
  exterior: {
    src: null,
    alt: "Library Hub Nawalpur Exterior Entrance",
    label: "Library Exterior & Entrance",
    aspectRatio: "16/9",
    category: "Exterior",
  },
  desks: {
    src: libraryDesk,
    alt: "Library Hub Nawalpur - Individual Wooden Study Cabins with Personal Lockers",
    label: "Individual Study Cabins & Overhead Lockers",
    aspectRatio: "aspect-[4/3]",
    category: "Desks & Lockers",
  },
  quietZone: {
    src: null,
    alt: "Dedicated Silence Study Zone",
    label: "Silent Study Zone",
    aspectRatio: "4/3",
    category: "Environment",
  },
  facilities: {
    src: null,
    alt: "Library Amenities and Facilities",
    label: "Amenities & Comfort Area",
    aspectRatio: "4/3",
    category: "Facilities",
  },
  readingRoom: {
    src: null,
    alt: "Spacious Reading Room",
    label: "Air Conditioned Reading Room",
    aspectRatio: "16/9",
    category: "Study Environment",
  },
};
