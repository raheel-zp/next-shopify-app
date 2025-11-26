// context/ShopContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import Cookies from "js-cookie";

interface ShopContextType {
    shop: string | null;
    setShop: (shop: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({
    children,
    initialShop,
}: {
    children: ReactNode;
    initialShop?: string;
}) => {
    const [shop, setShopState] = useState<string | null>(() => {
        return initialShop || Cookies.get("shop") || null;
    });

    const setShop = (value: string) => {
        setShopState(value);
        Cookies.set("shop", value);
    };

    return (
        <ShopContext.Provider value={{ shop, setShop }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within ShopProvider");
    return context;
};
