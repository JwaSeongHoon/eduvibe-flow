import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryTabsProps {
  categories: Category[];
  onCategoryChange?: (categoryId: string) => void;
  defaultCategory?: string;
}

export function CategoryTabs({ categories, onCategoryChange, defaultCategory }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState(defaultCategory || categories[0]?.id);

  const handleClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4 md:px-0">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeCategory === category.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80"
            )}
          >
            {activeCategory === category.id && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 gradient-vibe rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {category.icon && <span>{category.icon}</span>}
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
