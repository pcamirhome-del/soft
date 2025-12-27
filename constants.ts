
import { Product } from './types';

export const DEFAULT_MARKETS = [
  "محلاوي الحي العاشر",
  "محلاوي التجمع الخامس",
  "محلاوي مارت فيل",
  "جمال سلامه الشيراتون",
  "جمال سلامه ميدان الجامع",
  "علوش ماركت",
  "محلاوي الطيران"
];

export const DEFAULT_COMPANIES = [
  "شركة سوفت روز",
  "شركة فاين",
  "شركة زينة",
  "شركة بابيا فاميليا",
  "شركة وايت",
  "شركة كلاسي"
];

export const SOFT_ROSE_PRODUCTS: Product[] = [
  // Facial Tissues (مناديل سحب)
  { id: 'sr1', name: 'Soft 500 singel', category: 'مناديل السحب' },
  { id: 'sr2', name: 'Soft 600 singel', category: 'مناديل السحب' },
  { id: 'sr3', name: 'Soft 400 3*1', category: 'مناديل السحب' },
  { id: 'sr4', name: 'Soft 500 3*1 (3ply)', category: 'مناديل السحب' },
  { id: 'sr5', name: 'Soft 500 (3*1) classic', category: 'مناديل السحب' },
  { id: 'sr6', name: 'Soft 500 (3*1) smart', category: 'مناديل السحب' },
  { id: 'sr7', name: 'Soft 600 (3*1) 3ply', category: 'مناديل السحب' },
  { id: 'sr8', name: 'New mazika 220 (4*1)', category: 'مناديل السحب' },
  { id: 'sr9', name: 'New Mazika 250 (5*1)', category: 'مناديل السحب' },
  
  // Kitchen Rolls (مناديل مطبخ)
  { id: 'sr10', name: 'Kitchen 2 Rolls', category: 'مناديل المطبخ' },
  { id: 'sr11', name: 'Kitchen 4 Rolls', category: 'مناديل المطبخ' },
  { id: 'sr12', name: 'Kitchen 6 Rolls', category: 'مناديل المطبخ' },
  { id: 'sr13', name: '2 Rolls compress', category: 'مناديل المطبخ' },
  { id: 'sr14', name: '6 Rolls compress', category: 'مناديل المطبخ' },
  { id: 'sr15', name: 'Mega Roll L', category: 'مناديل المطبخ' },
  { id: 'sr16', name: 'Soft Rose XL', category: 'مناديل المطبخ' },
  { id: 'sr17', name: 'Soft Rose XXL', category: 'مناديل المطبخ' },

  // Toilet Paper (تواليت)
  { id: 'sr18', name: 'Soft 2 Hotels Jumbo', category: 'مناديل تواليت' },
  { id: 'sr19', name: 'Soft 2 Hotels mauve', category: 'مناديل تواليت' },
  { id: 'sr20', name: 'Soft 2 Hotel Compress', category: 'مناديل تواليت' },
  { id: 'sr21', name: 'Soft 6 Hotels Jumbo', category: 'مناديل تواليت' },
  { id: 'sr22', name: 'Soft 6 Hotels mauve', category: 'مناديل تواليت' },
  { id: 'sr23', name: 'Soft 6 Hotel Compress', category: 'مناديل تواليت' },

  // Dolphin (دولفن)
  { id: 'sr24', name: 'Dolphin 2 Toilet Rolls', category: 'مناديل دولفن' },
  { id: 'sr25', name: 'Dolphin 9 Toilet Rolls', category: 'مناديل دولفن' },
  { id: 'sr26', name: 'Dolphin 18 Toilet Rolls', category: 'مناديل دولفن' },
  { id: 'sr27', name: 'Dolphin 24 Toilet Rolls', category: 'مناديل دولفن' },
];
