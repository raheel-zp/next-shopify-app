// context/ShopContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
    const [shop, setShopState] = useState<string | null>(initialShop || null);

    const setShop = (value: string) => {
        setShopState(value);
        Cookies.set("shop", value);
    };
    useEffect(() => {
        if (!shop) {
            const cookieShop = Cookies.get("shop");
            if (cookieShop) {
                setTimeout(() => setShopState(cookieShop), 0);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
