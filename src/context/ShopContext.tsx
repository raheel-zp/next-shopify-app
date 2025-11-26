// context/ShopContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface ShopContextType {
    shop: string | null;
    setShop: (shop: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children, initialShop }: { children: ReactNode; initialShop?: string }) {
    const [shop, setShop] = useState<string | null>(initialShop || null);

    return <ShopContext.Provider value={{ shop, setShop }}>{children}</ShopContext.Provider>;
}

export function useShop() {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within a ShopProvider");
    return context;
}
