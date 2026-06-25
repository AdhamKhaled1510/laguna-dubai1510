import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { MenuItem, MenuItemType } from './components/MenuItem';
import { CartSheet } from './components/CartSheet';
import { Input } from './components/ui/input';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import logoUrl from '@/assets/logo.png';

// ── Local menu images (user-provided, from src/assets/menu/) ─────────────
const _menuFiles = import.meta.glob('@/assets/menu/*.{jpg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const _menuImageMap: Record<string, string> = {};
for (const [path, url] of Object.entries(_menuFiles)) {
  const name = path.split('/').pop()?.replace(/\.(jpg|png|webp)$/, '');
  if (name) _menuImageMap[name] = url;
}

function localImage(nameAr: string): string {
  return _menuImageMap[nameAr] || '';
}

// ── Fallback images (used when local image is not available) ─────────────
// Hot drinks
const IMG_TURKISH   = 'https://images.unsplash.com/photo-1757079649052-a24c6ab32c64?w=800&q=80';
const IMG_TEA       = 'https://images.unsplash.com/photo-1769791650175-6858ef4780bb?w=800&q=80';
const IMG_HOT_CHOC  = 'https://images.unsplash.com/photo-1720664282854-6081564f7e88?w=800&q=80';

// Espresso-based
const IMG_ESPRESSO  = 'https://images.unsplash.com/photo-1775512825412-6a94a01b99ef?w=800&q=80';
const IMG_CAPPUCCINO= 'https://images.unsplash.com/photo-1720214931419-7cb11ee42c59?w=800&q=80';
const IMG_LATTE     = 'https://images.unsplash.com/photo-1762402519375-a29d7971a761?w=800&q=80';
const IMG_MOCHA     = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80';

// Iced drinks
const IMG_ICED      = 'https://images.unsplash.com/photo-1549652127-2e5e59e86a7a?w=800&q=80';
const IMG_ICED_COFFEE='https://images.unsplash.com/photo-1759259639354-830bc3120807?w=800&q=80';
const IMG_COLD2     = 'https://images.unsplash.com/photo-1642647391072-6a2416f048e5?w=800&q=80';

// Matcha
const IMG_MATCHA    = 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80';
const IMG_MATCHA2   = 'https://images.unsplash.com/photo-1717398804885-a6c22b3e5c2f?w=800&q=80';

// Frappe
const IMG_FRAPPE    = 'https://images.unsplash.com/photo-1526909445923-d35b52b98c22?w=800&q=80';
const IMG_FRAPPE2   = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80';

// Milkshake & smoothie
const IMG_SHAKE     = 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=800&q=80';
const IMG_SMOOTHIE  = 'https://images.unsplash.com/photo-1622597467821-df79dcb4f94d?w=800&q=80';

// Juice
const IMG_JUICE     = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80';
const IMG_JUICE2    = 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=800&q=80';
const IMG_LEMON     = 'https://images.unsplash.com/photo-1575596510825-f748919a2bf7?w=800&q=80';

// Cocktails & mojito
const IMG_COCKTAIL  = 'https://images.unsplash.com/photo-1749314374163-185677265d63?w=800&q=80';
const IMG_MOJITO    = 'https://images.unsplash.com/photo-1507281549113-040fcfef650e?w=800&q=80';

// Other
const IMG_YOGURT    = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80';
const IMG_CAN       = 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=800&q=80';
const IMG_POPCORN   = 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=800&q=80';

const WA_NUMBER = '201234567890';

const menuData: MenuItemType[] = [
  // ════════════════════════════════════════
  //  القهوة التركي والنكهات
  // ════════════════════════════════════════
  { id: 1, name: 'Single Turkish',    nameAr: 'سنجل تركي',     descriptionAr: 'قهوة تركية سنجل',      price: 30,  image: IMG_TURKISH,  category: 'hot', popular: false },
  { id: 2, name: 'Double Turkish',    nameAr: 'دبل تركي',      descriptionAr: 'قهوة تركية دبل',        price: 35,  image: IMG_TURKISH,  category: 'hot', popular: false },
  { id: 4, name: 'French Coffee',     nameAr: 'فرنساوي',       descriptionAr: 'قهوة فرنساوي',          price: 40,  image: IMG_TURKISH,  category: 'hot', popular: false },
  { id: 5, name: 'Flavored Coffee',   nameAr: 'قهوة نكهات',    descriptionAr: 'قهوة بنكهات مميزة',     price: 60,  image: IMG_TURKISH,  category: 'hot', popular: true  },
  // ════════════════════════════════════════
  //  الشاي والأعشاب
  // ════════════════════════════════════════
  { id: 6,  name: 'Red Tea',          nameAr: 'شاي أحمر',      descriptionAr: 'شاي أحمر',              price: 20,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 7,  name: 'Green Tea',        nameAr: 'شاي أخضر',      descriptionAr: 'شاي أخضر',              price: 20,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 8,  name: 'Flavored Tea',     nameAr: 'شاي نكهات',     descriptionAr: 'شاي بنكهات متنوعة',     price: 35,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 9,  name: 'Milk Tea',         nameAr: 'شاي بلبن',      descriptionAr: 'شاي بالحليب الطازج',    price: 50,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 10, name: 'Karak Tea',        nameAr: 'شاي كرك',       descriptionAr: 'شاي كرك بالحليب',       price: 50,  image: IMG_TEA,      category: 'hot', popular: true  },
  { id: 11, name: 'Tea Pot',          nameAr: 'براد شاي',      descriptionAr: 'برّاد شاي للمجموعة',    price: 60,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 12, name: 'Herbal Tea',       nameAr: 'أعشاب',         descriptionAr: 'مشروب أعشاب طبيعية',    price: 35,  image: IMG_TEA,      category: 'hot', popular: false },
  // ════════════════════════════════════════
  //  مشروبات الإسبرسو
  // ════════════════════════════════════════
  { id: 13, name: 'Single Espresso',  nameAr: 'سنجل إسبرسو',  descriptionAr: 'إسبريسو سنجل',          price: 35,  image: IMG_ESPRESSO,  category: 'hot', popular: false },
  { id: 14, name: 'Double Espresso',  nameAr: 'دبل إسبرسو',   descriptionAr: 'إسبريسو دبل',            price: 50,  image: IMG_ESPRESSO,  category: 'hot', popular: false },
  { id: 15, name: 'Cappuccino',       nameAr: 'كابتشينو',     descriptionAr: 'كابتشينو كريمي',        price: 60,  image: IMG_CAPPUCCINO,category: 'hot', popular: true  },
  { id: 16, name: 'Dark Mocha',       nameAr: 'دارك موكا',     descriptionAr: 'موكا داكن غني',          price: 60,  image: IMG_MOCHA,     category: 'hot', popular: false },
  { id: 17, name: 'White Mocha',      nameAr: 'وايت موكا',     descriptionAr: 'موكا أبيض لذيذ',        price: 65,  image: IMG_MOCHA,     category: 'hot', popular: true  },
  { id: 18, name: 'Cortado',          nameAr: 'كورتادو',       descriptionAr: 'كورتادو مكثف',           price: 70,  image: IMG_ESPRESSO,  category: 'hot', popular: false },
  { id: 19, name: 'Latte',            nameAr: 'لاتيه',         descriptionAr: 'لاتيه بالحليب',          price: 60,  image: IMG_LATTE,     category: 'hot', popular: true  },
  // ════════════════════════════════════════
  //  مشروبات ساخنة أخرى
  // ════════════════════════════════════════
  { id: 20, name: 'Cinnamon',         nameAr: 'قرفة',          descriptionAr: 'مشروب قرفة ساخن',       price: 20,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 21, name: 'Fenugreek',        nameAr: 'حلبة',          descriptionAr: 'مشروب حلبة',             price: 20,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 22, name: 'Cocoa',            nameAr: 'كاكاو',         descriptionAr: 'كاكاو ساخن',             price: 20,  image: IMG_HOT_CHOC, category: 'hot', popular: false },
  { id: 23, name: 'Ginger',           nameAr: 'زنجبيل',        descriptionAr: 'زنجبيل طازج ساخن',      price: 20,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 24, name: 'Cinnamon Milk',    nameAr: 'قرفة حليب',     descriptionAr: 'قرفة بالحليب الساخن',   price: 30,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 25, name: 'Fenugreek Milk',   nameAr: 'حلبة حليب',     descriptionAr: 'حلبة بالحليب الساخن',   price: 30,  image: IMG_TEA,      category: 'hot', popular: false },
  { id: 26, name: 'Hot Chocolate',    nameAr: 'هوت شوكلت',     descriptionAr: 'شوكولاتة ساخنة كريمية', price: 30,  image: IMG_HOT_CHOC, category: 'hot', popular: false },
  { id: 27, name: 'Sahlab',           nameAr: 'سحلب',          descriptionAr: 'سحلب ساخن',              price: 50,  image: IMG_HOT_CHOC, category: 'hot', popular: false },
  { id: 28, name: 'Sahlab w/ Nuts',   nameAr: 'سحلب مكسرات',  descriptionAr: 'سحلب ساخن بالمكسرات',   price: 50,  image: IMG_HOT_CHOC, category: 'hot', popular: true  },

  // ════════════════════════════════════════
  //  آيس كوفي
  // ════════════════════════════════════════
  { id: 29, name: 'Iced Mocha',       nameAr: 'آيس موكا',      descriptionAr: 'موكا بارد على الثلج',   price: 60,  image: IMG_ICED,     category: 'iced', popular: false },
  { id: 30, name: 'Iced Coffee',      nameAr: 'آيس كوفي',      descriptionAr: 'قهوة باردة',             price: 60,  image: IMG_ICED_COFFEE,category: 'iced', popular: false },
  { id: 31, name: 'Iced Latte',       nameAr: 'آيس لاتيه',     descriptionAr: 'لاتيه بارد',             price: 60,  image: IMG_ICED,     category: 'iced', popular: true  },
  { id: 32, name: 'Iced Chocolate',   nameAr: 'آيس شوكلت',     descriptionAr: 'شوكولاتة باردة',        price: 70,  image: IMG_COLD2,    category: 'iced', popular: false },
  { id: 33, name: 'Iced Coffee Flav', nameAr: 'آيس كوفي نكهات',descriptionAr: 'قهوة باردة بنكهات',      price: 70,  image: IMG_ICED_COFFEE,category: 'iced', popular: false },
  { id: 34, name: 'Spanish Latte',    nameAr: 'اسبانش لاتيه',  descriptionAr: 'لاتيه اسباني مميز',     price: 70,  image: IMG_ICED,     category: 'iced', popular: true  },
  { id: 35, name: 'Iced Americano',   nameAr: 'آيس أمريكان',   descriptionAr: 'أمريكانو على الثلج',    price: 70,  image: IMG_ICED_COFFEE,category: 'iced', popular: false },
  // ════════════════════════════════════════
  //  ماتشا
  // ════════════════════════════════════════
  { id: 36, name: 'Matcha',              nameAr: 'ماتشا',             descriptionAr: 'ماتشا ساخنة',          price: 60,  image: IMG_MATCHA,   category: 'matcha', popular: false },
  { id: 37, name: 'Iced Matcha',         nameAr: 'آيس ماتشا',        descriptionAr: 'ماتشا على الثلج',      price: 75,  image: IMG_MATCHA2,  category: 'matcha', popular: true  },
  { id: 38, name: 'Matcha Frappe',       nameAr: 'ماتشا فرابيه',     descriptionAr: 'فرابيه ماتشا أخضر',   price: 70,  image: IMG_MATCHA2,  category: 'matcha', popular: false },
  { id: 39, name: 'Iced Matcha Latte',   nameAr: 'آيس ماتشا لاتيه',  descriptionAr: 'لاتيه ماتشا بارد',    price: 90,  image: IMG_MATCHA,   category: 'matcha', popular: false },
  { id: 40, name: 'Matcha Milk Shake',   nameAr: 'ماتشا ميلك شيك',   descriptionAr: 'ميلك شيك ماتشا',      price: 75,  image: IMG_MATCHA,   category: 'matcha', popular: false },

  // ════════════════════════════════════════
  //  فرابيه
  // ════════════════════════════════════════
  { id: 41, name: 'Vanilla Frappe',      nameAr: 'فرابيه فانيليا',   descriptionAr: 'فرابيه فانيليا',     price: 60, image: IMG_FRAPPE,   category: 'frappe', popular: false },
  { id: 42, name: 'Caramel Frappe',      nameAr: 'فرابيه كارميل',    descriptionAr: 'فرابيه بالكراميل',   price: 65, image: IMG_FRAPPE,   category: 'frappe', popular: true  },
  { id: 43, name: 'White Choc Frappe',   nameAr: 'فرابيه وايت شوكلت',descriptionAr: 'فرابيه شوكولاتة بيضاء',price: 65, image: IMG_FRAPPE, category: 'frappe', popular: false },
  { id: 44, name: 'Lotus Frappe',        nameAr: 'فرابيه لوتس',      descriptionAr: 'فرابيه بالبسكويت',   price: 70, image: IMG_FRAPPE,   category: 'frappe', popular: true  },
  { id: 45, name: 'Chocolate Frappe',    nameAr: 'فرابيه شوكلت',     descriptionAr: 'فرابيه بالشوكولاتة', price: 75, image: IMG_FRAPPE2,  category: 'frappe', popular: false },
  { id: 46, name: 'Hazelnut Frappe',     nameAr: 'فرابيه بندق',      descriptionAr: 'فرابيه بالبندق',     price: 65, image: IMG_FRAPPE,   category: 'frappe', popular: false },
  { id: 47, name: 'Nutella Frappe',      nameAr: 'فرابيه نوتيلا',    descriptionAr: 'فرابيه بالنوتيلا',   price: 65, image: IMG_FRAPPE,   category: 'frappe', popular: true  },
  { id: 48, name: 'Oreo Frappe',         nameAr: 'فرابيه أوريو',     descriptionAr: 'فرابيه بالأوريو',    price: 75, image: IMG_FRAPPE,   category: 'frappe', popular: false },
  { id: 49, name: 'Pistachio Frappe',    nameAr: 'فرابيه بيستاشيو',  descriptionAr: 'فرابيه بالفستق',     price: 70, image: IMG_FRAPPE,   category: 'frappe', popular: false },
  // ════════════════════════════════════════
  //  اسموزي
  // ════════════════════════════════════════
  { id: 50, name: 'Kiwi Smoothie',       nameAr: 'اسموزي كيوي',     descriptionAr: 'سموزي كيوي',         price: 55, image: IMG_SMOOTHIE,    category: 'frappe', popular: false },
  { id: 51, name: 'Lemon Mint Smoothie', nameAr: 'اسموزي ليمون نعناع',descriptionAr: 'سموزي ليمون ونعناع',price: 60, image: IMG_LEMON,      category: 'frappe', popular: false },
  { id: 52, name: 'Lemon Smoothie',      nameAr: 'اسموزي ليمون',    descriptionAr: 'سموزي ليمون',         price: 55, image: IMG_LEMON,      category: 'frappe', popular: false },
  { id: 53, name: 'Blueberry Smoothie',  nameAr: 'اسموزي بلو بيري',  descriptionAr: 'سموزي بلو بيري',     price: 60, image: IMG_SMOOTHIE,    category: 'frappe', popular: false },
  { id: 54, name: 'Laguna Smoothie',     nameAr: 'اسموزي لاجونا',    descriptionAr: 'سموزي لاجونا مميز',  price: 75, image: IMG_SMOOTHIE,    category: 'frappe', popular: true  },
  { id: 55, name: 'Passion Smoothie',    nameAr: 'اسموزي باشن فروت', descriptionAr: 'سموزي باشن فروت',   price: 55, image: IMG_SMOOTHIE,    category: 'frappe', popular: false },
  { id: 56, name: 'Watermelon Smoothie', nameAr: 'اسموزي بطيخ',     descriptionAr: 'سموزي بطيخ منعش',    price: 60, image: IMG_SMOOTHIE,    category: 'frappe', popular: false },
  { id: 57, name: 'Mix Berry Smoothie',  nameAr: 'اسموزي ميكس بيري', descriptionAr: 'سموزي التوت المشكل',price: 65, image: IMG_SMOOTHIE,    category: 'frappe', popular: false },
  { id: 58, name: 'Mango Smoothie',      nameAr: 'اسموزي مانجا',    descriptionAr: 'سموزي مانجا',         price: 60, image: IMG_SMOOTHIE,    category: 'frappe', popular: false },

  // ════════════════════════════════════════
  //  العصائر الفريش
  // ════════════════════════════════════════
  { id: 70, name: 'Lemon Juice',        nameAr: 'ليمون',             descriptionAr: 'عصير ليمون طازج',     price: 55,  image: IMG_LEMON,    category: 'juices', popular: false },
  { id: 71, name: 'Jujube Juice',       nameAr: 'عناب',              descriptionAr: 'عصير عناب',            price: 55,  image: IMG_JUICE2,   category: 'juices', popular: false },
  { id: 72, name: 'Orange Juice',       nameAr: 'برتقال',            descriptionAr: 'عصير برتقال طازج',     price: 60,  image: IMG_JUICE,    category: 'juices', popular: false },
  { id: 73, name: 'Strawberry Juice',   nameAr: 'فراولة',            descriptionAr: 'عصير فراولة طازج',     price: 60,  image: IMG_JUICE2,   category: 'juices', popular: false },
  { id: 74, name: 'Mango Juice',        nameAr: 'مانجا',             descriptionAr: 'عصير مانجا طازج',      price: 60,  image: IMG_JUICE,    category: 'juices', popular: false },
  { id: 75, name: 'Guava Juice',        nameAr: 'جوافة',             descriptionAr: 'عصير جوافة طازج',      price: 60,  image: IMG_JUICE2,   category: 'juices', popular: false },
  { id: 76, name: 'Banana Juice',       nameAr: 'موز',               descriptionAr: 'عصير موز طازج',        price: 60,  image: IMG_JUICE,    category: 'juices', popular: false },
  { id: 77, name: 'Watermelon Juice',   nameAr: 'بطيخ',              descriptionAr: 'عصير بطيخ منعش',       price: 60,  image: IMG_JUICE,    category: 'juices', popular: false },
  { id: 78, name: 'Orange Carrot',      nameAr: 'برتقال جزر',        descriptionAr: 'برتقال وجزر طازج',     price: 65,  image: IMG_JUICE,    category: 'juices', popular: false },
  { id: 79, name: 'Strawberry Milk',    nameAr: 'فراولة لبن',        descriptionAr: 'عصير فراولة بالحليب',  price: 65,  image: IMG_JUICE2,   category: 'juices', popular: true  },
  { id: 80, name: 'Guava Milk',         nameAr: 'جوافة لبن',         descriptionAr: 'عصير جوافة بالحليب',   price: 65,  image: IMG_JUICE2,   category: 'juices', popular: false },
  { id: 81, name: 'Guava Mint',         nameAr: 'جوافة نعناع',       descriptionAr: 'جوافة ونعناع طازج',    price: 70,  image: IMG_JUICE2,   category: 'juices', popular: false },
  { id: 82, name: 'Lemon Mint',         nameAr: 'ليمون نعناع',       descriptionAr: 'ليمون بالنعناع طازج',  price: 55,  image: IMG_LEMON,    category: 'juices', popular: true  },
  { id: 83, name: 'Date Milk',          nameAr: 'بلح بلبن',          descriptionAr: 'بلح بالحليب',           price: 65,  image: IMG_JUICE,    category: 'juices', popular: false },
  { id: 84, name: 'Pomegranate',        nameAr: 'رمان',              descriptionAr: 'عصير رمان طازج',        price: 75,  image: IMG_JUICE,    category: 'juices', popular: false },
  { id: 85, name: 'Kiwi Juice',         nameAr: 'كيوي',              descriptionAr: 'عصير كيوي طازج',        price: 75,  image: IMG_JUICE2,   category: 'juices', popular: false },
  { id: 86, name: 'Avocado Juice',      nameAr: 'أفوكادو',           descriptionAr: 'عصير أفوكادو',          price: 80,  image: IMG_JUICE2,   category: 'juices', popular: false },
  { id: 87, name: 'Avocado Honey Nuts', nameAr: 'أفوكادو عسل مكسرات',descriptionAr: 'عصير أفوكادو بالعسل',  price: 100, image: IMG_JUICE2,   category: 'juices', popular: true  },
  { id: 88, name: 'Laguna Healthy',     nameAr: 'فريش هيلثي لاجونا', descriptionAr: 'عصير هيلثي مميز',      price: 100, image: IMG_JUICE,    category: 'juices', popular: true  },

  // ════════════════════════════════════════
  //  الكوكتيلات
  // ════════════════════════════════════════
  { id: 100, name: 'Hawaii',            nameAr: 'هاواي',             descriptionAr: 'كوكتيل هاواي',           price: 70,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 101, name: 'Larouz',            nameAr: 'الروز',             descriptionAr: 'كوكتيل الروز',           price: 75,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 102, name: 'Green Red',         nameAr: 'جرين ريد',          descriptionAr: 'كوكتيل روز',            price: 85,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 103, name: 'Red Mash',           nameAr: 'ريد ماش',         descriptionAr: 'كوكتيل ريد ماش',         price: 70,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 104, name: 'Blueberry Kiwi',     nameAr: 'بلو بيري كيوي ماش',  descriptionAr: 'كوكتيل بلو بيري كيوي',  price: 80,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 105, name: 'Enabi',             nameAr: 'عنابي',             descriptionAr: 'كوكتيل عنابي',           price: 80,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 106, name: 'Breezy Kiwi',       nameAr: 'بريزي كيوي',        descriptionAr: 'بريزي كيوي',             price: 70,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 107, name: 'White Ocean',       nameAr: 'وايت أوشن',         descriptionAr: 'وايت أوشن',              price: 75,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 108, name: 'Kamba',             nameAr: 'كامبا',             descriptionAr: 'كوكتيل كامبا',           price: 85,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 109, name: 'Paradise Passion',  nameAr: 'بارادايس باشن',     descriptionAr: 'كوكتيل بارادايس',        price: 70,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 110, name: 'Florida',           nameAr: 'فلوريدا',           descriptionAr: 'كوكتيل فلوريدا',         price: 85,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 111, name: 'Galaxy',            nameAr: 'جالاكسي',           descriptionAr: 'كوكتيل جالاكسي',         price: 90,  image: IMG_COCKTAIL, category: 'cocktails', popular: true  },
  { id: 112, name: 'Heartache',         nameAr: 'عوار القلب',        descriptionAr: 'كوكتيل عوار القلب',      price: 90,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },
  { id: 113, name: 'Laguna Signature',  nameAr: 'لاجونا سجنتشر',     descriptionAr: 'كوكتيل لاجونا الخاص',    price: 100, image: IMG_COCKTAIL, category: 'cocktails', popular: true  },
  { id: 114, name: 'Delci',             nameAr: 'ديلسي',             descriptionAr: 'كوكتيل ديلسي',           price: 90,  image: IMG_COCKTAIL, category: 'cocktails', popular: false },

  // ════════════════════════════════════════
  //  موهيتو
  // ════════════════════════════════════════
  { id: 120, name: 'Sun Rise',          nameAr: 'موهيتو صن رايز',    descriptionAr: 'موهيتو صن رايز',       price: 60,  image: IMG_MOJITO,   category: 'mojito', popular: false },
  { id: 121, name: 'Pina Colada',       nameAr: 'بينا كولادا',       descriptionAr: 'بينا كولادا',           price: 65,  image: IMG_MOJITO,   category: 'mojito', popular: false },
  { id: 122, name: 'Blue Passion',      nameAr: 'بلو باشن',          descriptionAr: 'موهيتو بلو باشن',       price: 60,  image: IMG_MOJITO,   category: 'mojito', popular: false },
  { id: 123, name: 'Scotch Mint',       nameAr: 'سكوتش منت',         descriptionAr: 'سكوتش منت',             price: 65,  image: IMG_MOJITO,   category: 'mojito', popular: false },
  { id: 124, name: 'Sun Shine',         nameAr: 'موهيتو صن شاين',    descriptionAr: 'موهيتو صن شاين',        price: 60,  image: IMG_MOJITO,   category: 'mojito', popular: false },
  { id: 125, name: 'Cherry Colada',     nameAr: 'شيري كولادا',       descriptionAr: 'شيري كولادا',           price: 65,  image: IMG_MOJITO,   category: 'mojito', popular: false },
  { id: 126, name: 'Laguna Mojito',     nameAr: 'موهيتو لاجونا',     descriptionAr: 'موهيتو لاجونا الخاص',   price: 100, image: IMG_MOJITO,   category: 'mojito', popular: true  },
  { id: 127, name: 'Red Bull',          nameAr: 'ريد بول',           descriptionAr: 'ريد بول',                price: 80,  image: IMG_CAN,      category: 'mojito', popular: false },

  // ════════════════════════════════════════
  //  ميلك شيك
  // ════════════════════════════════════════
  { id: 130, name: 'Chocolate Shake',    nameAr: 'ميلك شيك شوكلت',   descriptionAr: 'ميلك شيك شوكولاتة',    price: 70,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 131, name: 'Peach Shake',        nameAr: 'ميلك شيك خوخ',     descriptionAr: 'ميلك شيك خوخ',        price: 75,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 132, name: 'Mix Berry Shake',    nameAr: 'ميلك شيك مكس بيري',descriptionAr: 'ميلك شيك التوت',      price: 85,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 133, name: 'Vanilla Shake',      nameAr: 'ميلك شيك فانيليا', descriptionAr: 'ميلك شيك فانيليا',    price: 70,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 134, name: 'Twinkies Shake',     nameAr: 'ميلك شيك توينكيز', descriptionAr: 'ميلك شيك توينكيز',   price: 80,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 135, name: 'White Choc Shake',   nameAr: 'ميلك شيك وايت شوكلت',descriptionAr: 'ميلك شيك شوكولاتة بيضاء',price: 80, image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 136, name: 'Caramel Shake',      nameAr: 'ميلك شيك كراميل',  descriptionAr: 'ميلك شيك كراميل',     price: 70,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 137, name: 'Mango Shake',        nameAr: 'ميلك شيك مانجا',   descriptionAr: 'ميلك شيك مانجا',      price: 75,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 138, name: 'Kit Kat Shake',      nameAr: 'ميلك شيك كيت كات', descriptionAr: 'ميلك شيك كيت كات',   price: 85,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 139, name: 'Strawberry Shake',   nameAr: 'ميلك شيك فراولة',  descriptionAr: 'ميلك شيك فراولة',     price: 70,  image: IMG_SHAKE, category: 'milkshake', popular: true  },
  { id: 140, name: 'Hoho Shake',         nameAr: 'ميلك شيك هوهوز',   descriptionAr: 'ميلك شيك هوهوز',      price: 85,  image: IMG_SHAKE, category: 'milkshake', popular: false },
  { id: 141, name: 'Nutella Shake',      nameAr: 'ميلك شيك نوتيلا',  descriptionAr: 'ميلك شيك نوتيلا',     price: 90,  image: IMG_SHAKE, category: 'milkshake', popular: true  },
  { id: 142, name: 'Oreo Shake',         nameAr: 'ميلك شيك أوريو',   descriptionAr: 'ميلك شيك أوريو',      price: 90,  image: IMG_SHAKE, category: 'milkshake', popular: true  },
  { id: 143, name: 'Laguna Shake',       nameAr: 'ميلك شيك لاجونا',   descriptionAr: 'ميلك شيك لاجونا مميز',  price: 100, image: IMG_SHAKE, category: 'milkshake', popular: true  },
  { id: 144, name: 'Pistachio Shake',    nameAr: 'ميلك شيك بستاشيو',  descriptionAr: 'ميلك شيك بستاشيو',     price: 90,  image: IMG_SHAKE, category: 'milkshake', popular: false },

  // ════════════════════════════════════════
  //  الزبادي
  // ════════════════════════════════════════
  { id: 150, name: 'Mango Yogurt',       nameAr: 'زبادي مانجا',        descriptionAr: 'زبادي خلاط بالمانجا',    price: 55,  image: IMG_YOGURT,   category: 'yogurt', popular: false },
  { id: 151, name: 'Strawberry Yogurt',  nameAr: 'زبادي فراولة',       descriptionAr: 'زبادي خلاط بالفراولة',   price: 55,  image: IMG_YOGURT,   category: 'yogurt', popular: false },
  { id: 152, name: 'Pineapple Yogurt',   nameAr: 'زبادي أناناس',       descriptionAr: 'زبادي خلاط بالأناناس',   price: 55,  image: IMG_YOGURT,   category: 'yogurt', popular: false },
  { id: 153, name: 'Peach Yogurt',       nameAr: 'زبادي خوخ',          descriptionAr: 'زبادي خلاط بالخوخ',      price: 60,  image: IMG_YOGURT,   category: 'yogurt', popular: false },
  { id: 154, name: 'Blueberry Yogurt',   nameAr: 'زبادي بلو بيري',     descriptionAr: 'زبادي خلاط بالبلو بيري', price: 60,  image: IMG_YOGURT,   category: 'yogurt', popular: false },
  { id: 155, name: 'Banana Yogurt',      nameAr: 'زبادي موز',          descriptionAr: 'زبادي خلاط بالموز',      price: 60,  image: IMG_YOGURT,   category: 'yogurt', popular: false },
  { id: 156, name: 'Passion Yogurt',     nameAr: 'زبادي باشن فروت',    descriptionAr: 'زبادي باشن فروت',       price: 60,  image: IMG_YOGURT,   category: 'yogurt', popular: false },
  { id: 157, name: 'Honey Nuts Yogurt',  nameAr: 'زبادي عسل مكسرات',   descriptionAr: 'زبادي بالعسل والمكسرات',price: 65,  image: IMG_YOGURT,   category: 'yogurt', popular: true  },
  { id: 158, name: 'Laguna Yogurt',      nameAr: 'زبادي لاجونا',       descriptionAr: 'زبادي لاجونا الخاص',    price: 75,  image: IMG_YOGURT,   category: 'yogurt', popular: true  },

  // ════════════════════════════════════════
  //  كانز ومشروبات طاقة
  // ════════════════════════════════════════
  { id: 160, name: 'Pepsi',             nameAr: 'بيبسي',            descriptionAr: 'بيبسي',               price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 161, name: 'Fanta',             nameAr: 'فانتا',            descriptionAr: 'فانتا',               price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 162, name: 'Vimto',             nameAr: 'فيروز',            descriptionAr: 'فيروز',               price: 35, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 163, name: 'Sprite',            nameAr: 'سبرايت',           descriptionAr: 'سبرايت',              price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 164, name: 'Twist',             nameAr: 'تويست',            descriptionAr: 'تويست',               price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 165, name: 'Mountain Dew',      nameAr: 'ماونتن ديو',       descriptionAr: 'ماونتن ديو',          price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 166, name: 'Pepsi Diet',        nameAr: 'بيبسي دايت',       descriptionAr: 'بيبسي دايت',          price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 167, name: '7UP',               nameAr: 'سفن أب',           descriptionAr: 'سفن أب',              price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 168, name: 'V Cola',            nameAr: 'في كولا',          descriptionAr: 'في كولا',             price: 35, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 169, name: 'Mirinda',           nameAr: 'ميرندا',           descriptionAr: 'ميرندا',              price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 170, name: 'Schweppes',         nameAr: 'شويبس',            descriptionAr: 'شويبس',               price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 171, name: 'Fiori',             nameAr: 'فيوري',            descriptionAr: 'فيوري',               price: 30, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 172, name: 'Birell',            nameAr: 'بيريل',            descriptionAr: 'بيريل',               price: 35, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 173, name: 'Red Bull',          nameAr: 'ريد بول',          descriptionAr: 'ريد بول',              price: 75, image: IMG_CAN,      category: 'cans', popular: false },
  { id: 174, name: 'Monster',           nameAr: 'مونستر',           descriptionAr: 'مونستر',              price: 75, image: IMG_CAN,      category: 'cans', popular: false },

  // ════════════════════════════════════════
  //  فشار
  // ════════════════════════════════════════
  { id: 180, name: 'Popcorn Salt',      nameAr: 'فشار ملح',         descriptionAr: 'فشار مالح',           price: 20, image: IMG_POPCORN,  category: 'cans', popular: false },
  { id: 181, name: 'Popcorn Ketchup',   nameAr: 'فشار كاتشب',       descriptionAr: 'فشار كاتشب',          price: 25, image: IMG_POPCORN,  category: 'cans', popular: false },
  { id: 182, name: 'Popcorn Caramel',   nameAr: 'فشار كراميل',      descriptionAr: 'فشار كراميل',         price: 25, image: IMG_POPCORN,  category: 'cans', popular: true  },
  { id: 183, name: 'Popcorn Cheese',    nameAr: 'فشار جبنة',        descriptionAr: 'فشار جبنة',           price: 25, image: IMG_POPCORN,  category: 'cans', popular: false },
  { id: 184, name: 'Popcorn Spicy',     nameAr: 'فشار شطة',         descriptionAr: 'فشار حار',            price: 25, image: IMG_POPCORN,  category: 'cans', popular: false },
].map(item => ({
  ...item,
  image: localImage(item.nameAr) || item.image,
}));

interface CartItem {
  item: MenuItemType;
  quantity: number;
}

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem('laguna-cart');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    try {
      localStorage.setItem('laguna-cart', JSON.stringify(newCart));
    } catch {}
  };

  const addToCart = (item: MenuItemType) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item.id === item.id);
      const newCart = existingItem
        ? prevCart.map((cartItem) =>
            cartItem.item.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        : [...prevCart, { item, quantity: 1 }];
      saveCart(newCart);
      return newCart;
    });
    toast.success(`تم إضافة ${item.nameAr} للطلب`);
  };

  const removeFromCart = (item: MenuItemType) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item.id === item.id);
      const newCart = existingItem && existingItem.quantity > 1
        ? prevCart.map((cartItem) =>
            cartItem.item.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          )
        : prevCart.filter((cartItem) => cartItem.item.id !== item.id);
      saveCart(newCart);
      return newCart;
    });
  };

  const removeItemFromCart = (id: number) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((cartItem) => cartItem.item.id !== id);
      saveCart(newCart);
      return newCart;
    });
    toast.info('تم حذف الصنف من السلة');
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
    toast.info('تم إفراغ السلة');
  };

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    const totalPrice = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
    const orderItems = cart.map(c => `• ${c.item.nameAr} (${c.quantity}x)`).join('\n');
    const msg = `مرحباً لاجونا دبي 🌊\nأود تقديم طلب:\n\n${orderItems}\n\nإجمالي الحساب: ${totalPrice} ج.م`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]);
    saveCart([]);
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = cart.find((item) => item.item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const filteredItems = (category?: string) => {
    let items = category
      ? menuData.filter((item) => item.category === category)
      : menuData;

    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  const categories = [
    { value: 'all',      label: 'الكل' },
    { value: 'hot',      label: 'ساخن' },
    { value: 'iced',     label: 'بارد' },
    { value: 'matcha',   label: 'ماتشا' },
    { value: 'frappe',   label: 'فرابيه' },
    { value: 'milkshake',label: 'ميلك شيك' },
    { value: 'yogurt',   label: 'زبادي' },
    { value: 'juices',   label: 'عصائر' },
    { value: 'cocktails',label: 'كوكتيل' },
    { value: 'mojito',   label: 'موهيتو' },
    { value: 'cans',     label: 'كانز' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0eb] text-stone-800" dir="rtl">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header
        className={`bg-[#0A2242] sticky top-0 z-40 border-b border-white/10 shadow-lg transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col items-center">
          <img src={logoUrl} alt="Laguna Dubai" className="h-20 w-auto mb-2 brightness-0 invert" />
          <h1 className="text-2xl font-bold tracking-[0.15em] text-white" style={{ fontFamily: "'Playfair Display', serif" }}>LAGUNA DUBAI</h1>
          <p className="text-xs text-white/50 tracking-[0.3em] mt-1">CAFÉ &bull; RESTAURANT</p>
          <div className="w-full max-w-md mx-auto mt-4 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              type="text"
              placeholder="ابحث في المنيو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 rounded-full shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="sticky z-30 bg-[#f5f0eb]/90 backdrop-blur-md border-b border-stone-200/40"
        style={{ top: headerVisible ? '132px' : '0' }}
      >
        <div className="container mx-auto px-4 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.value
                    ? 'bg-stone-800 text-white shadow-md'
                    : 'bg-white/70 text-stone-500 hover:bg-stone-100 border border-stone-200/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="container mx-auto px-4 py-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems(activeCategory === 'all' ? undefined : activeCategory).map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              quantity={getItemQuantity(item.id)}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item)}
            />
          ))}
        </div>

        {filteredItems(activeCategory === 'all' ? undefined : activeCategory).length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-stone-400">لا توجد نتائج للبحث</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <img src={logoUrl} alt="Laguna Dubai" className="h-14 w-auto mx-auto mb-4 opacity-60" />
          <p className="text-lg font-semibold text-stone-300 mb-1">LAGUNA DUBAI</p>
          <p className="text-sm text-stone-500 mb-4">CAFÉ &bull; RESTAURANT</p>
          <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed mb-6">
            دبي &bull; الإمارات العربية المتحدة
          </p>
          <div className="flex justify-center gap-4 text-sm text-stone-500">
            <a href={`https://wa.me/${WA_NUMBER}`} className="hover:text-amber-400 transition-colors">واتساب</a>
            <span>&bull;</span>
            <span>+20 123 456 7890</span>
            <span>&bull;</span>
            <span> laguna.dubai@email.com</span>
          </div>
          <div className="mt-8 pt-6 border-t border-stone-800 text-xs text-stone-600">
            &copy; 2026 Laguna Dubai. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>

      {/* Cart */}
      <CartSheet
        cartItems={cart}
        onRemoveItem={removeItemFromCart}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
