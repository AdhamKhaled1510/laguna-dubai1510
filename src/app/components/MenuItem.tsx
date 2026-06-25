import { Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface MenuItemType {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
}

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItem({ item, quantity, onAdd, onRemove }: MenuItemProps) {
  return (
    <Card className="overflow-hidden bg-white border-stone-100 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-300 text-stone-800 rounded-xl">
      <div className="relative h-64 overflow-hidden bg-stone-100">
        <ImageWithFallback
          src={item.image}
          alt={item.nameAr}
          className="w-full h-full object-contain p-2 transition-transform duration-500 hover:scale-105"
        />
        {item.popular && (
          <Badge className="absolute top-3 right-3 bg-stone-800 text-white text-xs font-medium shadow-md px-3 py-1 rounded-full">
            الأكثر طلباً
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="text-right mb-3">
          <h3 className="text-base font-bold mb-1 text-stone-800">{item.nameAr}</h3>
          <p className="text-xs text-stone-400 mb-2 leading-relaxed">
            {item.descriptionAr}
          </p>
          <div className="text-lg font-bold text-stone-800">
            {item.price} <span className="text-xs font-normal text-stone-400">ج.م</span>
          </div>
        </div>

        {quantity === 0 ? (
          <Button onClick={onAdd} className="w-full bg-stone-800 hover:bg-stone-700 text-white font-medium h-10 rounded-lg text-sm transition-colors" size="lg">
            <Plus className="ml-1.5 h-4 w-4" />
            إضافة للطلب
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Button
              onClick={onRemove}
              variant="outline"
              size="icon"
              className="h-10 w-10 border-stone-200 hover:bg-stone-100 text-stone-500 rounded-lg"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-xl font-bold flex-1 text-center text-stone-800">
              {quantity}
            </div>
            <Button
              onClick={onAdd}
              size="icon"
              className="h-10 w-10 bg-stone-800 hover:bg-stone-700 text-white rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
