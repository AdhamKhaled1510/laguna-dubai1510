import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Phone, MessageCircle, MapPin } from 'lucide-react';
import { MenuItem, MenuItemType } from './components/MenuItem';
import { CartSheet } from './components/CartSheet';
import { Input } from './components/ui/input';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import logoUrl from '@/assets/logo.png';
import { saveOrder, getNotifications, clearNotification, getOrders, Order, lockTable, unlockTable, getTableLock } from './lib/orders';

// ── Local menu images (from src/assets/menu/) ─────────────
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

// ── Fallback images (SVG data URIs, never breaks) ─────────
const FALLBACK = (color: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${color}"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="20" font-family="Arial">${color}</text></svg>`)}`;
const IMG_HOT     = FALLBACK('#8B4513');
const IMG_COLD    = FALLBACK('#4682B4');
const IMG_GREEN   = FALLBACK('#2E8B57');
const IMG_PINK    = FALLBACK('#DB7093');
const IMG_PURPLE  = FALLBACK('#9370DB');
const IMG_ORANGE  = FALLBACK('#FF8C00');
const IMG_GRAY    = FALLBACK('#708090');

const WA_NUMBER = '201234567890';

const IMG_TURKISH=IMG_HOT, IMG_TEA=IMG_HOT, IMG_HOT_CHOC=IMG_HOT,
  IMG_ESPRESSO=IMG_HOT, IMG_CAPPUCCINO=IMG_HOT, IMG_LATTE=IMG_HOT, IMG_MOCHA=IMG_HOT,
  IMG_ICED=IMG_COLD, IMG_ICED_COFFEE=IMG_COLD, IMG_COLD2=IMG_COLD,
  IMG_MATCHA=IMG_GREEN, IMG_MATCHA2=IMG_GREEN,
  IMG_FRAPPE=IMG_PINK, IMG_FRAPPE2=IMG_PINK,
  IMG_SHAKE=IMG_PURPLE, IMG_SMOOTHIE=IMG_PURPLE,
  IMG_JUICE=IMG_ORANGE, IMG_JUICE2=IMG_ORANGE, IMG_LEMON=IMG_ORANGE,
  IMG_COCKTAIL=IMG_PINK, IMG_MOJITO=IMG_GREEN,
  IMG_YOGURT=IMG_PURPLE, IMG_CAN=IMG_GRAY, IMG_POPCORN=IMG_ORANGE,
  IMG_DESSERT=IMG_HOT;

const menuData: MenuItemType[] = [
  { id: 1, name: 'Single Turkish', nameAr: 'سنجل تركي', descriptionAr: 'قهوة تركية سنجل', price: 30, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 2, name: 'Double Turkish', nameAr: 'دبل تركي', descriptionAr: 'قهوة تركية دبل', price: 35, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 3, name: 'French Coffee', nameAr: 'فرنساوي', descriptionAr: 'قهوة فرنساوي', price: 45, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 4, name: 'Flavored Coffee', nameAr: 'قهوة نكهات', descriptionAr: 'قهوة بنكهات مميزة', price: 45, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 5, name: 'Nescafe Milk', nameAr: 'نسكافية حليب', descriptionAr: 'نسكافية بالحليب الطازج', price: 50, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 6, name: 'Single Espresso', nameAr: 'سنجل اسبرسو', descriptionAr: 'إسبريسو سنجل', price: 40, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 7, name: 'Double Espresso', nameAr: 'دبل اسبرسو', descriptionAr: 'إسبريسو دبل', price: 55, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 8, name: 'Macchiato', nameAr: 'ميكاتو', descriptionAr: 'ميكاتو كريمي', price: 50, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 9, name: 'Double Macchiato', nameAr: 'دبل ميكاتو', descriptionAr: 'دبل ميكاتو كريمي', price: 60, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 10, name: 'American Coffee', nameAr: 'امريكان كوفي', descriptionAr: 'قهوة أمريكان', price: 50, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 11, name: 'Latte', nameAr: 'لاتيه', descriptionAr: 'لاتيه بالحليب', price: 60, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 12, name: 'Cappuccino', nameAr: 'كابتشينو', descriptionAr: 'كابتشينو كريمي', price: 60, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 13, name: 'Flavored Cappuccino', nameAr: 'كابتشينو فليفر', descriptionAr: 'كابتشينو بنكهات مميزة', price: 65, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 14, name: 'Dark Mocha', nameAr: 'دارك موكا', descriptionAr: 'موكا داكن غني', price: 50, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 15, name: 'White Mocha', nameAr: 'وايت موكا', descriptionAr: 'موكا أبيض', price: 59, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 16, name: 'Cortado', nameAr: 'كورتادو', descriptionAr: 'كورتادو مكثف', price: 65, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 17, name: 'Flavored Latte', nameAr: 'لاتيه فليفر', descriptionAr: 'لاتيه بنكهات مميزة', price: 65, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 18, name: 'Red Tea', nameAr: 'شاي احمر', descriptionAr: 'شاي أحمر', price: 20, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 19, name: 'Green Tea', nameAr: 'شاي اخضر', descriptionAr: 'شاي أخضر', price: 25, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 20, name: 'Fruit Tea', nameAr: 'شاي فواكة', descriptionAr: 'شاي بالفواكه', price: 25, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 21, name: 'Milk Tea', nameAr: 'شاي بلبن', descriptionAr: 'شاي بالحليب الطازج', price: 50, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 22, name: 'Complete Tea', nameAr: 'شاي كومبليت', descriptionAr: 'شاي كومبليت', price: 25, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 23, name: 'Tea Pot', nameAr: 'براد شاي', descriptionAr: 'براد شاي للمجموعة', price: 60, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 24, name: 'Herbal Tea', nameAr: 'اعشاب', descriptionAr: 'مشروب أعشاب طبيعية', price: 25, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 25, name: 'Cinnamon', nameAr: 'قرفة', descriptionAr: 'مشروب قرفة ساخن', price: 30, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 26, name: 'Sahlab', nameAr: 'سحلب', descriptionAr: 'سحلب ساخن', price: 50, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 27, name: 'Ginger', nameAr: 'جنزبيل', descriptionAr: 'جنزبيل ساخن طازج', price: 30, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 28, name: 'Hot Cider', nameAr: 'هوت سيدر', descriptionAr: 'سيدر ساخن', price: 45, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 29, name: 'Hot Chocolate', nameAr: 'هوت شوكلت', descriptionAr: 'شوكولاتة ساخنة', price: 50, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 30, name: 'Hot Caramel', nameAr: 'هوت كاراميل', descriptionAr: 'مشروب كراميل ساخن', price: 55, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 31, name: 'Hot Nutella', nameAr: 'هوت نوتيلا', descriptionAr: 'نوتيلا ساخنة', price: 55, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 32, name: 'Hot Marshmallow', nameAr: 'هوت مارشملو', descriptionAr: 'مشروب مارشملو ساخن', price: 55, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 33, name: 'Hot Oreo', nameAr: 'هوت اوريو', descriptionAr: 'مشروب أوريو ساخن', price: 55, image: IMG_CAPPUCCINO, category: 'hot' },
  { id: 34, name: 'Iced Coffee', nameAr: 'ابس كوفي', descriptionAr: 'قهوة باردة على الثلج', price: 65, image: IMG_ICED, category: 'iced' },
  { id: 35, name: 'Iced Mocha', nameAr: 'ايس موكا', descriptionAr: 'موكا بارد', price: 75, image: IMG_ICED, category: 'iced' },
  { id: 36, name: 'Iced Latte', nameAr: 'ايس لاتيه', descriptionAr: 'لاتيه بارد', price: 65, image: IMG_ICED, category: 'iced' },
  { id: 37, name: 'Iced White Mocha', nameAr: 'ايس موكا وايت', descriptionAr: 'موكا أبيض بارد', price: 70, image: IMG_ICED, category: 'iced' },
  { id: 38, name: 'Spanish Latte', nameAr: 'اسبانش لاتيه', descriptionAr: 'لاتيه اسباني', price: 75, image: IMG_ICED, category: 'iced' },
  { id: 39, name: 'Iced Flavored Latte', nameAr: 'ايس لاتيه فليفر', descriptionAr: 'لاتيه بارد بنكهات', price: 70, image: IMG_ICED, category: 'iced' },
  { id: 40, name: 'Iced Matcha', nameAr: 'ايس ماتشا', descriptionAr: 'ماتشا على الثلج', price: 70, image: IMG_MATCHA, category: 'matcha' },
  { id: 41, name: 'Matcha Frappe', nameAr: 'ماتشا فرابيه', descriptionAr: 'فرابيه ماتشا', price: 80, image: IMG_MATCHA, category: 'matcha' },
  { id: 42, name: 'Lemon Juice', nameAr: 'ليمون', descriptionAr: 'عصير ليمون طازج', price: 50, image: IMG_JUICE, category: 'juices' },
  { id: 43, name: 'Lemon Mint', nameAr: 'ليمون نعناع', descriptionAr: 'ليمون بالنعناع', price: 55, image: IMG_JUICE, category: 'juices' },
  { id: 44, name: 'Orange Juice', nameAr: 'برتقال', descriptionAr: 'عصير برتقال طازج', price: 60, image: IMG_JUICE, category: 'juices' },
  { id: 45, name: 'Strawberry Juice', nameAr: 'فراولة', descriptionAr: 'عصير فراولة طازج', price: 60, image: IMG_JUICE, category: 'juices' },
  { id: 46, name: 'Mango Juice', nameAr: 'مانجا', descriptionAr: 'عصير مانجا طازج', price: 70, image: IMG_JUICE, category: 'juices' },
  { id: 47, name: 'Guava Juice', nameAr: 'جوافه', descriptionAr: 'عصير جوافة طازج', price: 70, image: IMG_JUICE, category: 'juices' },
  { id: 48, name: 'Banana Juice', nameAr: 'موز', descriptionAr: 'عصير موز طازج', price: 70, image: IMG_JUICE, category: 'juices' },
  { id: 49, name: 'Watermelon Juice', nameAr: 'بطيخ', descriptionAr: 'عصير بطيخ', price: 60, image: IMG_JUICE, category: 'juices' },
  { id: 50, name: 'Date Juice', nameAr: 'بلح', descriptionAr: 'عصير بلح طازج', price: 75, image: IMG_JUICE, category: 'juices' },
  { id: 51, name: 'Avocado Juice', nameAr: 'افوكادو', descriptionAr: 'عصير أفوكادو', price: 80, image: IMG_JUICE, category: 'juices' },
  { id: 52, name: 'Add Milk', nameAr: 'اضافه لبن', descriptionAr: 'إضافة حليب طازج', price: 5, image: IMG_JUICE, category: 'juices' },
  { id: 53, name: 'Delight Punch', nameAr: 'ديلايت بانش', descriptionAr: 'كوكتيل ديلايت بانش', price: 65, image: IMG_COCKTAIL, category: 'cocktails' },
  { id: 54, name: 'Timara', nameAr: 'تيمارا', descriptionAr: 'كوكتيل تيمارا', price: 65, image: IMG_COCKTAIL, category: 'cocktails' },
  { id: 55, name: 'Florida', nameAr: 'فلوريدا', descriptionAr: 'كوكتيل فلوريدا', price: 65, image: IMG_COCKTAIL, category: 'cocktails' },
  { id: 56, name: 'Dabomba', nameAr: 'دابومبا', descriptionAr: 'كوكتيل دابومبا', price: 70, image: IMG_COCKTAIL, category: 'cocktails' },
  { id: 57, name: 'White Ocean', nameAr: 'وايت اوشن', descriptionAr: 'وايت أوشن', price: 70, image: IMG_COCKTAIL, category: 'cocktails' },
  { id: 58, name: 'Shahrazad', nameAr: 'شهر زاد', descriptionAr: 'كوكتيل شهر زاد', price: 70, image: IMG_COCKTAIL, category: 'cocktails' },
  { id: 59, name: 'La Rose', nameAr: 'لاروز', descriptionAr: 'كوكتيل لاروز', price: 75, image: IMG_COCKTAIL, category: 'cocktails' },
  { id: 60, name: 'Chocolate Frappe', nameAr: 'فرابيه شوكلت', descriptionAr: 'فرابيه شوكولاتة', price: 60, image: IMG_FRAPPE, category: 'frappe' },
  { id: 61, name: 'Caramel Frappe', nameAr: 'فرابيه كارميل', descriptionAr: 'فرابيه كراميل', price: 65, image: IMG_FRAPPE, category: 'frappe' },
  { id: 62, name: 'Vanilla Frappe', nameAr: 'فرابيه فانيليا', descriptionAr: 'فرابيه فانيليا', price: 65, image: IMG_FRAPPE, category: 'frappe' },
  { id: 63, name: 'Hazelnut Frappe', nameAr: 'فرابيه بندق', descriptionAr: 'فرابيه بندق', price: 65, image: IMG_FRAPPE, category: 'frappe' },
  { id: 64, name: 'Pistachio Frappe', nameAr: 'فرابيه بيستاشيو', descriptionAr: 'فرابيه فستق', price: 70, image: IMG_FRAPPE, category: 'frappe' },
  { id: 65, name: 'Nutella Frappe', nameAr: 'فرابيه نوتيلا', descriptionAr: 'فرابيه نوتيلا', price: 65, image: IMG_FRAPPE, category: 'frappe' },
  { id: 66, name: 'Green Apple Smoothie', nameAr: 'اسموزي تفاح اخضر', descriptionAr: 'سموزي تفاح أخضر', price: 50, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 67, name: 'Peach Smoothie', nameAr: 'اسموزي خوخ', descriptionAr: 'سموزي خوخ', price: 50, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 68, name: 'Pineapple Smoothie', nameAr: 'اسموزي اناناس', descriptionAr: 'سموزي أناناس', price: 50, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 69, name: 'Passion Smoothie', nameAr: 'اسموزي باشن فروت', descriptionAr: 'سموزي باشن فروت', price: 50, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 70, name: 'Mango Smoothie', nameAr: 'اسموزي مانجو', descriptionAr: 'سموزي مانجو', price: 55, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 71, name: 'Watermelon Smoothie', nameAr: 'اسموزي بطيخ', descriptionAr: 'سموزي بطيخ', price: 55, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 72, name: 'Strawberry Smoothie', nameAr: 'اسموزي فراولة', descriptionAr: 'سموزي فراولة', price: 55, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 73, name: 'Mix Berry Smoothie', nameAr: 'اسموزي ميكس بيري', descriptionAr: 'سموزي التوت المشكل', price: 55, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 74, name: 'Kiwi Smoothie', nameAr: 'اسموزي كيوي', descriptionAr: 'سموزي كيوي', price: 60, image: IMG_SMOOTHIE, category: 'smoothie' },
  { id: 75, name: 'Sun Rise', nameAr: 'موهيتو صن رايز', descriptionAr: 'موهيتو صن رايز', price: 50, image: IMG_MOJITO, category: 'mojito' },
  { id: 76, name: 'Sun Shine', nameAr: 'موهيتو صن شاين', descriptionAr: 'موهيتو صن شاين', price: 50, image: IMG_MOJITO, category: 'mojito' },
  { id: 77, name: 'Passion Fruit Mojito', nameAr: 'موهيتو باشون فروت', descriptionAr: 'موهيتو باشون فروت', price: 50, image: IMG_MOJITO, category: 'mojito' },
  { id: 78, name: 'Berry Mojito', nameAr: 'موهيتو توت', descriptionAr: 'موهيتو توت', price: 50, image: IMG_MOJITO, category: 'mojito' },
  { id: 79, name: 'Cherry Cola Mojito', nameAr: 'موهيتو شيري كولا', descriptionAr: 'موهيتو شيري كولا', price: 50, image: IMG_MOJITO, category: 'mojito' },
  { id: 80, name: 'Barley Mojito', nameAr: 'موهيتو شعير', descriptionAr: 'موهيتو شعير', price: 55, image: IMG_MOJITO, category: 'mojito' },
  { id: 81, name: 'Power Soda', nameAr: 'باور صودا', descriptionAr: 'باور صودا', price: 75, image: IMG_MOJITO, category: 'mojito' },
  { id: 82, name: 'Chocolate Shake', nameAr: 'ميلك شيك شوكلت', descriptionAr: 'ميلك شيك شوكولاتة', price: 60, image: IMG_SHAKE, category: 'milkshake' },
  { id: 83, name: 'Caramel Shake', nameAr: 'ميلك شيك كراميل', descriptionAr: 'ميلك شيك كراميل', price: 60, image: IMG_SHAKE, category: 'milkshake' },
  { id: 84, name: 'Vanilla Shake', nameAr: 'ميلك شيك فانيليا', descriptionAr: 'ميلك شيك فانيليا', price: 60, image: IMG_SHAKE, category: 'milkshake' },
  { id: 85, name: 'Strawberry Shake', nameAr: 'ميلك شيك فراولة', descriptionAr: 'ميلك شيك فراولة', price: 65, image: IMG_SHAKE, category: 'milkshake' },
  { id: 86, name: 'Peach Shake', nameAr: 'ميلك شيك خوخ', descriptionAr: 'ميلك شيك خوخ', price: 60, image: IMG_SHAKE, category: 'milkshake' },
  { id: 87, name: 'Mango Shake', nameAr: 'ميلك شيك مانجا', descriptionAr: 'ميلك شيك مانجا', price: 65, image: IMG_SHAKE, category: 'milkshake' },
  { id: 88, name: 'Hazelnut Shake', nameAr: 'ميلك شيك بندق', descriptionAr: 'ميلك شيك بندق', price: 65, image: IMG_SHAKE, category: 'milkshake' },
  { id: 89, name: 'Blueberry Shake', nameAr: 'ميلك شيك بلو بيري', descriptionAr: 'ميلك شيك بلو بيري', price: 60, image: IMG_SHAKE, category: 'milkshake' },
  { id: 90, name: 'Mix Berry Shake', nameAr: 'ميلك شيك مكس بيري', descriptionAr: 'ميلك شيك التوت المشكل', price: 60, image: IMG_SHAKE, category: 'milkshake' },
  { id: 91, name: 'Totilla Shake', nameAr: 'ميلك شيك توتيلا', descriptionAr: 'ميلك شيك توتيلا', price: 65, image: IMG_SHAKE, category: 'milkshake' },
  { id: 92, name: 'White Nutella Brownie Shake', nameAr: 'ميلك شيك وايت نوتيلا براوني', descriptionAr: 'ميلك شيك نوتيلا براوني', price: 70, image: IMG_SHAKE, category: 'milkshake' },
  { id: 93, name: 'Passion Fruit Shake', nameAr: 'ميلك شيك باشون فروت', descriptionAr: 'ميلك شيك باشون فروت', price: 65, image: IMG_SHAKE, category: 'milkshake' },
  { id: 94, name: 'Classic Yogurt', nameAr: 'زبادي كلاسيك', descriptionAr: 'زبادي كلاسيك', price: 60, image: IMG_YOGURT, category: 'yogurt' },
  { id: 95, name: 'Mango Yogurt', nameAr: 'زبادي مانجو', descriptionAr: 'زبادي مانجو', price: 70, image: IMG_YOGURT, category: 'yogurt' },
  { id: 96, name: 'Strawberry Yogurt', nameAr: 'زبادي فراوله', descriptionAr: 'زبادي فراولة', price: 70, image: IMG_YOGURT, category: 'yogurt' },
  { id: 97, name: 'Peach Yogurt', nameAr: 'زبادي خوخ', descriptionAr: 'زبادي خوخ', price: 70, image: IMG_YOGURT, category: 'yogurt' },
  { id: 98, name: 'Banana Yogurt', nameAr: 'زبادي موز', descriptionAr: 'زبادي موز', price: 70, image: IMG_YOGURT, category: 'yogurt' },
  { id: 99, name: 'Blueberry Yogurt', nameAr: 'زبادي بلو بيري', descriptionAr: 'زبادي بلو بيري', price: 70, image: IMG_YOGURT, category: 'yogurt' },
  { id: 100, name: 'Passion Fruit Yogurt', nameAr: 'زبادي باشون فروت', descriptionAr: 'زبادي باشون فروت', price: 70, image: IMG_YOGURT, category: 'yogurt' },
  { id: 101, name: 'Honey Yogurt', nameAr: 'زبادي عسل', descriptionAr: 'زبادي بالعسل', price: 65, image: IMG_YOGURT, category: 'yogurt' },
  { id: 102, name: 'Mixed Fruit Yogurt', nameAr: 'زبادي مكس فواكه', descriptionAr: 'زبادي مكس فواكه', price: 80, image: IMG_YOGURT, category: 'yogurt' },
  { id: 103, name: 'Pepsi', nameAr: 'بيبسي', descriptionAr: 'بيبسي', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 104, name: 'Pepsi Diet', nameAr: 'بيبسي دايت', descriptionAr: 'بيبسي دايت', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 105, name: 'Sprite', nameAr: 'اسبرايت', descriptionAr: 'سبرايت', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 106, name: 'Mirinda', nameAr: 'ميرندا', descriptionAr: 'ميرندا', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 107, name: 'Fanta', nameAr: 'فانتا', descriptionAr: 'فانتا', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 108, name: '7UP', nameAr: 'سفن اب', descriptionAr: 'سفن أب', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 109, name: 'Mountain Dew', nameAr: 'ماونتن ديو', descriptionAr: 'ماونتن ديو', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 110, name: 'Twist', nameAr: 'تويست', descriptionAr: 'تويست', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 111, name: 'Schweppes', nameAr: 'شويبس', descriptionAr: 'شويبس', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 112, name: 'Vimto', nameAr: 'فيروز', descriptionAr: 'فيروز', price: 35, image: IMG_CAN, category: 'cans' },
  { id: 113, name: 'V Cola', nameAr: 'في كولا', descriptionAr: 'في كولا', price: 35, image: IMG_CAN, category: 'cans' },
  { id: 114, name: 'Fiori', nameAr: 'فيوري', descriptionAr: 'فيوري', price: 30, image: IMG_CAN, category: 'cans' },
  { id: 115, name: 'Birell', nameAr: 'بيريل', descriptionAr: 'بيريل', price: 35, image: IMG_CAN, category: 'cans' },
  { id: 116, name: 'Red Bull', nameAr: 'ريد بول', descriptionAr: 'ريد بول', price: 75, image: IMG_CAN, category: 'cans' },
  { id: 117, name: 'Monster', nameAr: 'مونستر', descriptionAr: 'مونستر', price: 75, image: IMG_CAN, category: 'cans' },
  { id: 118, name: 'Dark Waffle', nameAr: 'وافل دارك', descriptionAr: 'وافل شوكولاتة داكنة', price: 65, image: IMG_DESSERT, category: 'dessert' },
  { id: 119, name: 'Nutella Waffle', nameAr: 'وافل نوتيلا', descriptionAr: 'وافل نوتيلا', price: 70, image: IMG_DESSERT, category: 'dessert' },
  { id: 120, name: 'White Waffle', nameAr: 'وافل وايت', descriptionAr: 'وافل شوكولاتة بيضاء', price: 70, image: IMG_DESSERT, category: 'dessert' },
  { id: 121, name: 'Lotus Waffle', nameAr: 'وافل لوتس', descriptionAr: 'وافل لوتس', price: 70, image: IMG_DESSERT, category: 'dessert' },
  { id: 122, name: 'Oreo Waffle', nameAr: 'وافل اوريو', descriptionAr: 'وافل أوريو', price: 75, image: IMG_DESSERT, category: 'dessert' },
  { id: 123, name: 'Waffle Ice Cream & Banana', nameAr: 'وافل ايس كريم & موز', descriptionAr: 'وافل آيس كريم وموز', price: 80, image: IMG_DESSERT, category: 'dessert' },
  { id: 124, name: 'Molten Cake', nameAr: 'مولتن كيك', descriptionAr: 'مولتن كيك', price: 65, image: IMG_DESSERT, category: 'dessert' },
  { id: 125, name: 'Molten Cake Ice Cream', nameAr: 'مولتن ايس كريم', descriptionAr: 'مولتن كيك آيس كريم', price: 70, image: IMG_DESSERT, category: 'dessert' },
  { id: 126, name: 'Cinnamon Roll', nameAr: 'سينابون', descriptionAr: 'سينابون', price: 55, image: IMG_DESSERT, category: 'dessert' },
  { id: 127, name: 'Nutella Cinnamon Roll', nameAr: 'سينابون نوتيلا', descriptionAr: 'سينابون نوتيلا', price: 60, image: IMG_DESSERT, category: 'dessert' },
  { id: 128, name: 'Brownies', nameAr: 'براونيز', descriptionAr: 'براونيز', price: 50, image: IMG_DESSERT, category: 'dessert' },
  { id: 129, name: 'Fruit Salad', nameAr: 'فروت سالط', descriptionAr: 'فروت سالط', price: 60, image: IMG_DESSERT, category: 'dessert' },
  { id: 130, name: 'Fruit Salad Ice Cream', nameAr: 'فروت سالط ايس كريم', descriptionAr: 'فروت سالط آيس كريم', price: 70, image: IMG_DESSERT, category: 'dessert' },
  { id: 131, name: 'Fruit Salad Ice Cream Nuts', nameAr: 'فروت سالط ايس كريم مكسرات', descriptionAr: 'فروت سالط آيس كريم مكسرات', price: 75, image: IMG_DESSERT, category: 'dessert' },
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
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [tableNumber, setTableNumber] = useState(() => {
    const t = Number(searchParams.get('table'));
    return t >= 1 && t <= 20 ? t : 1;
  });
  const [tablePopupOpen, setTablePopupOpen] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('hot');
  const [headerVisible, setHeaderVisible] = useState(true);
  const [itemOrderCounts, setItemOrderCounts] = useState<Record<string, number>>({});
  const [menuLoading, setMenuLoading] = useState(true);
  const lastScrollY = useRef(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Table lock ──────────────────────────────────────────
  const [lockBlocked, setLockBlocked] = useState(false);
  const sessionId = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    let cancelled = false;
    const acquire = async () => {
      await lockTable(tableNumber, sessionId);
      if (cancelled) return;
      const current = await getTableLock(tableNumber);
      if (current && current.sessionId !== sessionId) {
        setLockBlocked(true);
      } else {
        setLockBlocked(false);
      }
    };
    acquire();
    const interval = setInterval(acquire, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      unlockTable(tableNumber);
    };
  }, [tableNumber, sessionId]);

  useEffect(() => {
    if (lockBlocked) {
      setCart([]);
      saveCart([]);
    }
  }, [lockBlocked]);

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

  useEffect(() => {
    let seen = new Set<string>();
    const check = async () => {
      const notifs = await getNotifications();
      for (const n of notifs) {
        if (!seen.has(n.id)) {
          seen.add(n.id);
          toast.success(`تم تجهيز طلب ترابيزة ${n.tableNumber}`);
          clearNotification(n.id);
        }
      }
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCompleted = async () => {
      const all = await getOrders();
      const cutoff = Date.now() - 15 * 60 * 1000;
      setCompletedOrders(
        all
          .filter(o => o.status === 'completed' && o.timestamp > cutoff)
          .sort((a, b) => b.timestamp - a.timestamp)
      );
    };
    fetchCompleted();
    const interval = setInterval(fetchCompleted, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setTablePopupOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const all = await getOrders();
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const thisMonth = all.filter(o => o.timestamp >= monthStart.getTime());
      const counts: Record<string, number> = {};
      for (const order of thisMonth) {
        for (const item of order.items) {
          counts[item.nameAr] = (counts[item.nameAr] || 0) + item.quantity;
        }
      }
      setItemOrderCounts(counts);
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
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

  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    try {
      const totalPrice = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
      const orderItems = cart.map(c => ({ nameAr: c.item.nameAr, quantity: c.quantity, price: c.item.price }));
      await saveOrder({
        tableNumber,
        items: orderItems,
        totalPrice,
        timestamp: Date.now(),
        status: 'pending',
      });
      setCart([]);
      saveCart([]);
      toast.success('تم إرسال الطلب إلى الباريستا');
    } catch {
      toast.error('فشل إرسال الطلب');
    }
    setCheckingOut(false);
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = cart.find((item) => item.item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const filteredItems = (category?: string) => {
    let items = menuData;

    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (category) {
      items = items.filter((item) => item.category === category);
    }

    const sorted = Object.entries(itemOrderCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);
    const topSet = new Set(sorted);
    return items
      .map(item => ({ ...item, orderCount: itemOrderCounts[item.nameAr] || 0, isTopDrink: topSet.has(item.nameAr) }))
      .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
  };

  const categories = [
    { value: 'hot',      label: 'ساخن' },
    { value: 'iced',     label: 'بارد' },
    { value: 'matcha',   label: 'ماتشا' },
    { value: 'frappe',   label: 'فرابيه' },
    { value: 'smoothie', label: 'سموزي' },
    { value: 'milkshake',label: 'ميلك شيك' },
    { value: 'yogurt',   label: 'زبادي' },
    { value: 'juices',   label: 'عصائر' },
    { value: 'cocktails',label: 'كوكتيل' },
    { value: 'mojito',   label: 'موهيتو' },
    { value: 'popcorn',  label: 'فشار' },
    { value: 'cans',     label: 'كانز' },
    { value: 'dessert',  label: 'حلويات' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0eb] text-stone-800" dir="rtl">
      {lockBlocked && (
        <div className="fixed inset-0 z-[100] bg-stone-900/95 flex flex-col items-center justify-center p-6" style={{animation: 'fadeIn 0.2s ease-out'}}>
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">هذه الترابيزة قيد الاستخدام</h2>
          <p className="text-white/60 text-center text-sm max-w-xs">يوجد طلب قيد الإنشاء حالياً على هذه الترابيزة، برجاء الانتظار أو اختيار ترابيزة أخرى</p>
          <button
            onClick={() => window.location.href = window.location.pathname.replace(/\/waiter.*/, '/') + '#/'}
            className="mt-8 px-6 py-3 bg-amber-500 text-stone-900 font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            العودة للقائمة الرئيسية
          </button>
        </div>
      )}
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header
        className={`bg-gradient-to-b from-[#0A2242] to-[#0d2d52] sticky top-0 z-40 border-b border-white/10 shadow-lg transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-6 flex items-center justify-between gap-4">
          {/* Logo+Name */}
          <div className="flex items-center gap-3 md:gap-4">
            <img src={logoUrl} alt="Laguna Dubai" className="h-14 md:h-20 lg:h-24 w-auto brightness-0 invert" />
            <div className="text-right">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>LAGUNA DUBAI</h1>
              <p className="text-[10px] md:text-xs lg:text-sm text-white/40 tracking-[0.2em]">CAFÉ &bull; RESTAURANT</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
            >
              <Search className="h-4 w-4 text-white/60" />
            </button>

            {searchOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSearchOpen(false)} />
                <div className="absolute left-0 right-0 top-12 z-40 bg-white rounded-2xl shadow-2xl border border-stone-100 p-3" style={{animation: 'fadeIn 0.15s ease-out'}}>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                    <Input
                      type="text"
                      placeholder="ابحث في القائمة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="pr-9 text-right h-10 text-sm bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:border-amber-400/60 focus:ring-amber-400/20 rounded-xl"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-stone-200 hover:bg-stone-300 text-stone-500 text-xs transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with sidebar */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 lg:py-10 pb-32 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}} />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-stone-300/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '12s'}} />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-amber-100/15 rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s'}} />
        </div>

        {/* Mobile Categories (horizontal scroll) */}
        <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 mb-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                activeCategory === cat.value
                  ? 'bg-stone-800 text-white shadow-md'
                  : 'bg-white/70 text-stone-500 border border-stone-200/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6 lg:gap-10">
          {/* Categories Sidebar (iPad+) */}
          <aside className="hidden md:flex flex-col gap-1 shrink-0 sticky top-28 self-start w-28 lg:w-32">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`text-right whitespace-nowrap px-4 lg:px-5 py-3 rounded-xl text-sm lg:text-base font-medium transition-all duration-200 ${
                  activeCategory === cat.value
                    ? 'bg-stone-800 text-white shadow-md shadow-stone-800/20'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-white/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </aside>

          {/* Items Grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {filteredItems(activeCategory).map((item, idx) => (
            <MenuItem
              key={item.id}
              item={item}
              quantity={getItemQuantity(item.id)}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item)}
              style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both` }}
            />
          ))}
        </div>

        {filteredItems(activeCategory).length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-stone-400">لا توجد نتائج للبحث</p>
          </div>
        )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-stone-900 to-stone-800 text-stone-400 py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <img src={logoUrl} alt="Laguna Dubai" className="h-14 w-auto mx-auto mb-4 opacity-50 brightness-0 invert" />
          <p className="text-lg font-semibold text-stone-200 mb-1 tracking-[0.1em]">LAGUNA DUBAI</p>
          <p className="text-xs text-stone-500 mb-6 tracking-[0.2em]">CAFÉ &bull; RESTAURANT</p>
          <div className="flex justify-center items-center gap-6 text-sm text-stone-400 mb-6">
            <div className="flex flex-col items-center gap-1">
              <Phone className="h-4 w-4 text-amber-400/60" />
              <span>+20 123 456 7890</span>
            </div>
            <div className="w-px h-8 bg-stone-700" />
            <a href={`https://wa.me/${WA_NUMBER}`} className="flex flex-col items-center gap-1 hover:text-amber-400 transition-colors">
              <MessageCircle className="h-4 w-4 text-amber-400/60" />
              <span>واتساب</span>
            </a>
            <div className="w-px h-8 bg-stone-700" />
            <div className="flex flex-col items-center gap-1">
              <MapPin className="h-4 w-4 text-amber-400/60" />
              <span>ميت غمر - شارع البحر</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-stone-700/50 text-xs text-stone-600">
            &copy; 2026 Laguna Dubai. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>

      {/* Cart */}
      <CartSheet
        cartItems={cart}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        onRemoveItem={removeItemFromCart}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />

      {/* Table Popup */}
      {tablePopupOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setTablePopupOpen(false)} />
          <div ref={tableRef} className="fixed bottom-0 left-0 right-0 z-50 bg-[#f5f0eb] rounded-t-2xl shadow-2xl p-6 animate-slide-up" style={{animation: 'slideUp 0.25s ease-out'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-800">اختر رقم التربيزة</h2>
              <button onClick={() => setTablePopupOpen(false)} className="text-stone-400 hover:text-stone-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => { setTableNumber(n); setTablePopupOpen(false); }}
                  className={`h-14 rounded-xl font-bold text-lg transition-all ${
                    tableNumber === n
                      ? 'bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-400/40 hover:shadow-md'
                  }`}
                >
                  {n.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Completed Orders FAB + Sheet */}
      {completedOrders.length > 0 && (
        <button
          onClick={() => setCompletedOpen(true)}
          className="fixed bottom-24 left-4 z-40 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 py-3 shadow-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="text-sm font-bold">{completedOrders.length}</span>
        </button>
      )}

      {completedOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setCompletedOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#f5f0eb] rounded-t-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto" style={{animation: 'slideUp 0.25s ease-out'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-800">الطلبات المكتملة</h2>
              <button onClick={() => setCompletedOpen(false)} className="text-stone-400 hover:text-stone-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            {completedOrders.length === 0 ? (
              <p className="text-center text-stone-400 py-8">لا توجد طلبات مكتملة</p>
            ) : (
              <div className="space-y-2">
                {completedOrders.slice(0, 50).map((order, idx) => (
                  <div key={order.id || idx} className="bg-white rounded-xl p-4 border border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-amber-600 font-bold text-lg">ترابيزة {order.tableNumber}</span>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {order.items?.slice(0, 3).map(i => i.nameAr).join(' • ')}
                        {(order.items?.length ?? 0) > 3 && ' • ...'}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-stone-400">{new Date(order.timestamp).toLocaleTimeString('ar-EG', {hour:'2-digit',minute:'2-digit'})}</div>
                      <div className="text-xs font-bold text-emerald-600">مكتمل ✓</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
