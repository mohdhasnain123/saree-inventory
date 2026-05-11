import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ProductionType = "all" | "powerloom" | "handloom";

const STORAGE_KEY = "sf_production_type";

const isValid = (v: unknown): v is ProductionType =>
  v === "all" || v === "powerloom" || v === "handloom";

interface ProductionTypeContextValue {
  productionType: ProductionType;
  setProductionType: (type: ProductionType) => void;
  // Returns "?type=powerloom" / "?type=handloom" / "" — handy for fetch URL composition.
  typeQuery: string;
  // Just the value or undefined if "all".
  typeParam: "powerloom" | "handloom" | undefined;
  label: string;
}

const ProductionTypeContext = createContext<ProductionTypeContextValue | undefined>(undefined);

export const ProductionTypeProvider = ({ children }: { children: ReactNode }) => {
  const [productionType, setProductionTypeState] = useState<ProductionType>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValid(stored)) return stored;
    } catch {
      /* noop */
    }
    return "all";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, productionType);
    } catch {
      /* noop */
    }
  }, [productionType]);

  const setProductionType = useCallback((t: ProductionType) => {
    setProductionTypeState(t);
  }, []);

  const value = useMemo<ProductionTypeContextValue>(() => {
    const typeParam = productionType === "all" ? undefined : productionType;
    return {
      productionType,
      setProductionType,
      typeQuery: typeParam ? `?type=${typeParam}` : "",
      typeParam,
      label:
        productionType === "powerloom"
          ? "Powerloom"
          : productionType === "handloom"
          ? "Handloom"
          : "All",
    };
  }, [productionType, setProductionType]);

  return (
    <ProductionTypeContext.Provider value={value}>{children}</ProductionTypeContext.Provider>
  );
};

export const useProductionType = () => {
  const ctx = useContext(ProductionTypeContext);
  if (!ctx)
    throw new Error("useProductionType must be used within ProductionTypeProvider");
  return ctx;
};

// Helper to append ?type=... to an existing path that may already contain a ? part
export const appendTypeQuery = (
  url: string,
  typeParam?: "powerloom" | "handloom"
) => {
  if (!typeParam) return url;
  return url.includes("?") ? `${url}&type=${typeParam}` : `${url}?type=${typeParam}`;
};
