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
    <Card className="overflow-hidden bg-white border-stone-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-200/10 transition-all duration-300 text-stone-800 rounded-2xl">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.nameAr}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {item.popular && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white font-bold hover:bg-amber-400 shadow-md">
            الأكثر طلباً
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="text-right mb-3">
          <h3 className="text-lg font-bold mb-1 text-stone-800">{item.nameAr}</h3>
          <p className="text-sm text-stone-400 mb-2 line-clamp-2">
            {item.descriptionAr}
          </p>
          <div className="text-xl font-black text-amber-600">
            {item.price} ج.م
          </div>
        </div>

        {quantity === 0 ? (
          <Button onClick={onAdd} className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold h-11 rounded-xl shadow-sm" size="lg">
            <Plus className="ml-2 h-5 w-5" />
            إضافة للطلب
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <Button
              onClick={onRemove}
              variant="outline"
              size="icon"
              className="h-11 w-11 border-stone-300 hover:bg-stone-100 text-stone-600"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <div className="text-2xl font-bold flex-1 text-center text-stone-800">
              {quantity}
            </div>
            <Button
              onClick={onAdd}
              size="icon"
              className="h-11 w-11 bg-amber-500 hover:bg-amber-400 text-white shadow-sm"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
