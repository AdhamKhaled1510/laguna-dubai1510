import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { MenuItemType } from './MenuItem';
import logoUrl from '@/assets/logo.png';

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
        <Button size="lg" className={`fixed bottom-6 left-6 h-14 px-6 text-base bg-gradient-to-r from-stone-800 to-stone-700 hover:from-stone-700 hover:to-stone-600 text-white font-bold shadow-2xl rounded-xl z-50 transition-all duration-300 active:scale-95 ${totalItems > 0 ? 'animate-pulse-cart' : ''}`}>
          <ShoppingCart className="ml-2 h-5 w-5" />
          السلة ({totalItems})
          {totalPrice > 0 && (
            <Badge variant="secondary" className="mr-2 text-sm px-2.5 py-0.5 bg-amber-500 text-white font-bold border border-amber-400">
              {totalPrice} ج.م
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-lg flex flex-col bg-white border-l border-stone-100 text-stone-800">
        <SheetHeader className="text-right flex flex-col items-center pt-6 pb-2 border-b border-stone-100">
          <img src={logoUrl} alt="Laguna Dubai" className="h-10 w-auto mb-2 brightness-0" />
          <SheetTitle className="text-lg font-bold text-stone-800">سلة الطلبات</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-stone-50 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-stone-300" />
              </div>
              <p className="text-lg font-semibold text-stone-400">السلة فارغة</p>
              <p className="text-sm mt-1 text-stone-300">ابدأ بإضافة مشروبات لذيذة من المنيو</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-3">
                {cartItems.map(({ item, quantity }) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-stone-200 transition-colors">
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 text-right">
                      <h4 className="font-semibold text-sm text-stone-800 mb-1">{item.nameAr}</h4>
                      <div className="text-xs text-stone-400 mb-1">
                        {item.price} ج.م × {quantity}
                      </div>
                      <div className="font-bold text-stone-800 text-sm">
                        {item.price * quantity} ج.م
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-7 w-7 text-stone-300 hover:text-red-400 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-3 bg-stone-100" />

            <div className="space-y-2 text-right mb-4 px-1">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-stone-800">{totalPrice} ج.م</span>
                <span className="text-stone-500">المجموع:</span>
              </div>
              <div className="flex justify-between text-xs text-stone-400">
                <span>{totalItems}</span>
                <span>عدد الأصناف:</span>
              </div>
            </div>

            <SheetFooter className="gap-2 flex-col sm:flex-col">
              <Button
                onClick={onCheckout}
                size="lg"
                className="w-full bg-gradient-to-r from-stone-800 to-stone-700 hover:from-stone-700 hover:to-stone-600 text-white font-bold text-sm h-12 rounded-lg transition-all active:scale-[0.98]"
              >
                تأكيد الطلب
              </Button>
              <Button
                onClick={onClearCart}
                variant="outline"
                size="lg"
                className="w-full border-stone-200 hover:bg-stone-100 text-stone-500 text-sm h-11 rounded-lg"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                إفراغ السلة
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
