import libraryHubBanner from '../assets/images/library-hub-banner-web.png';
import libraryDesk from '../assets/images/desk.png';
import mainBanner from '../assets/images/Main Banner.png';


export const galleryCategories = [
  'All',
  'Brand Identity',
  'Study Hall',
  'Desks & Cabins',
  'Amenities',
  'Exterior',
];

export const galleryItems = [
  {
    id: 1,
    title: 'Official Library Hub Main Facilities Banner',
    category: 'Brand Identity',
    description: 'Official Library Hub Nawalpur facilities banner: Daily newspaper, 24/7 access, AC cabins, lockers, and zero disturbance environment.',
    aspectRatio: 'aspect-[6/5]',
    objectFit: 'object-contain',
    src: mainBanner,
    dimensions: '780 × 648 (Official Banner)',
  },
  {
    id: 2,
    title: 'Main Reading Hall Overview',
    category: 'Study Hall',
    description: 'Spacious, air-conditioned main study hall with wide central aisle and glare-free lighting.',
    aspectRatio: 'aspect-[4/3]',
    src: null,
    dimensions: '1920 × 1080 (Landscape)',
  },
  {
    id: 3,
    title: 'Individual Study Cabins & Overhead Lockers',
    category: 'Desks & Cabins',
    description: 'Actual photograph of Library Hub Nawalpur wooden study cabins with private partitions, personal book storage, and secure overhead key-locked lockers.',
    aspectRatio: 'aspect-[4/3]',
    objectFit: 'object-cover',
    imageClassName: 'object-top',
    src: libraryDesk,
    dimensions: '684 × 770 (Actual Photo)',
  },
  {
    id: 4,
    title: 'Dedicated Silence & Focus Zone',
    category: 'Study Hall',
    description: 'Zero-distraction zone designed for prolonged deep work, mock tests, and intense revision.',
    aspectRatio: 'aspect-[4/3]',
    src: null,
    dimensions: '1600 × 1200 (Silence Zone)',
  },
  {
    id: 4,
    title: 'High-Speed Wi-Fi & Power Backup Hub',
    category: 'Amenities',
    description: 'Optical fiber connectivity hardware and automated inverter power backup infrastructure.',
    aspectRatio: 'aspect-[4/3]',
    src: null,
    dimensions: '1200 × 900 (Infrastructure)',
  },
  {
    id: 5,
    title: 'RO Drinking Water & Refreshment Area',
    category: 'Amenities',
    description: 'Hygienic multi-stage RO water dispenser and dedicated area for quiet study breaks.',
    aspectRatio: 'aspect-[4/3]',
    src: null,
    dimensions: '1200 × 900 (Amenities)',
  },
  {
    id: 6,
    title: 'Library Exterior & Entrance Facade',
    category: 'Exterior',
    description: 'Front entrance, welcoming reception desk, and secure student entry in Nawalpur.',
    aspectRatio: 'aspect-[4/3]',
    src: null,
    dimensions: '1920 × 1080 (Exterior View)',
  },
  {
    id: 7,
    title: 'Personal Book Storage Lockers',
    category: 'Amenities',
    description: 'Secure personal locker units for safely storing reference volumes and binders.',
    aspectRatio: 'aspect-[4/3]',
    src: null,
    dimensions: '1200 × 900 (Storage)',
  },
  {
    id: 8,
    title: 'Evening Shift Ambience & Lighting',
    category: 'Study Hall',
    description: 'Warm, eye-friendly LED illumination designed to prevent eye strain during night shifts.',
    aspectRatio: 'aspect-[4/3]',
    src: null,
    dimensions: '1600 × 1200 (Night Ambience)',
  },
];

