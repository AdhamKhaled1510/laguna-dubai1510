import { Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export interface MenuItemType {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr: string;
  price: number;
  image: string;
  category: string;
  orderCount?: number;
  isTopDrink?: boolean;
}

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  style?: React.CSSProperties;
}

export function MenuItem({ item, quantity, onAdd, onRemove, style }: MenuItemProps) {
  return (
    <Card
      className="overflow-hidden bg-white/85 backdrop-blur-sm border-stone-100 hover:border-amber-200/50 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 text-stone-800 rounded-xl group"
      style={style}
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={item.image}
          alt={item.nameAr}
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {item.isTopDrink && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-lg px-3 py-1 rounded-full border border-amber-400/30 animate-pulse">
            الأكثر طلباً
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base font-bold text-stone-800 leading-tight">{item.nameAr}</h3>
            <span className="inline-flex items-center gap-1 text-sm font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200/50 shrink-0">
              {item.price}
              <span className="text-[10px] text-amber-600 font-medium">ج.م</span>
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed line-clamp-2 text-right mt-1.5">
            {item.descriptionAr}
          </p>
        </div>

        {quantity === 0 ? (
          <Button onClick={onAdd} className="w-full bg-gradient-to-r from-stone-800 to-stone-700 hover:from-stone-700 hover:to-stone-600 text-white font-medium h-10 md:h-11 rounded-lg text-sm transition-all duration-200 active:scale-[0.98]" size="lg">
            <Plus className="ml-1.5 h-4 w-4 md:h-5 md:w-5" />
            إضافة للطلب
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2 md:gap-3">
            <Button
              onClick={onRemove}
              variant="outline"
              size="icon"
              className="h-10 w-10 md:h-11 md:w-11 border-stone-200 hover:bg-stone-100 text-stone-500 rounded-lg active:scale-90 transition-all"
            >
              <Minus className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="text-xl md:text-2xl font-bold flex-1 text-center text-stone-800 tabular-nums">
              {quantity}
            </div>
            <Button
              onClick={onAdd}
              size="icon"
              className="h-10 w-10 md:h-11 md:w-11 bg-stone-800 hover:bg-stone-700 text-white rounded-lg shadow-sm active:scale-90 transition-all"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
