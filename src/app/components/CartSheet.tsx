import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { MenuItemType } from './MenuItem';

interface CartItem {
  item: MenuItemType;
  quantity: number;
}

interface CartSheetProps {
  cartItems: CartItem[];
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartSheet({ cartItems, onRemoveItem, onClearCart, onCheckout }: CartSheetProps) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" className="fixed bottom-6 left-6 h-16 px-8 text-lg bg-amber-500 hover:bg-amber-400 text-white font-black shadow-xl rounded-2xl z-50 transition-transform duration-300 active:scale-95">
          <ShoppingCart className="ml-2 h-6 w-6" />
          السلة ({totalItems})
          {totalPrice > 0 && (
            <Badge variant="secondary" className="mr-3 text-base px-3 py-1 bg-stone-800/10 text-amber-600 border border-amber-200/50">
              {totalPrice} ج.م
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-lg flex flex-col bg-white border-r border-stone-200 text-stone-800">
        <SheetHeader className="text-right">
          <SheetTitle className="text-2xl font-black text-amber-600">سلة الطلبات</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-stone-400">
              <ShoppingCart className="h-24 w-24 mx-auto mb-4 opacity-20 text-amber-500" />
              <p className="text-xl font-bold text-stone-500">السلة فارغة</p>
              <p className="text-sm mt-2 text-stone-400">ابدأ بإضافة مشروبات لذيذة من المنيو</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-4">
                {cartItems.map(({ item, quantity }) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="w-20 h-20 object-cover rounded-lg border border-stone-200"
                    />
                    <div className="flex-1 text-right">
                      <h4 className="font-bold text-stone-700 mb-1">{item.nameAr}</h4>
                      <div className="text-sm text-stone-400 mb-2">
                        {item.price} ج.م × {quantity}
                      </div>
                      <div className="font-black text-amber-600">
                        {item.price * quantity} ج.م
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4 bg-stone-200" />

            <div className="space-y-3 text-right mb-4">
              <div className="flex justify-between text-lg">
                <span className="font-black text-amber-600">{totalPrice} ج.م</span>
                <span className="text-stone-500">المجموع:</span>
              </div>
              <div className="flex justify-between text-sm text-stone-400">
                <span>{totalItems}</span>
                <span>عدد الأصناف:</span>
              </div>
            </div>

            <SheetFooter className="gap-2 flex-col sm:flex-col">
              <Button
                onClick={onCheckout}
                size="lg"
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black text-lg h-14 rounded-xl shadow-sm"
              >
                تأكيد الطلب وإرسال لواتساب
              </Button>
              <Button
                onClick={onClearCart}
                variant="outline"
                size="lg"
                className="w-full border-stone-300 hover:bg-stone-100 text-stone-600"
              >
                <Trash2 className="ml-2 h-5 w-5" />
                إفراغ السلة
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
