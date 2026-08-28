export interface OptionChoice {
  id: string;
  name: string;
  extraPrice: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isDailySpecial?: boolean; // Plat du jour "Lou Ame Tay ?"
  isSpecialOfTheDay?: boolean;
  isAvailable: boolean;
  allergens?: string[];
  options?: {
    name: string; // Ex: "Accompagnement"
    choices: OptionChoice[];
  }[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  items: MenuItem[];
}

export interface CartItem {
  id: string; // Hash unique plat + options
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: OptionChoice[];
  customerNotes?: string;
  imageUrl?: string;
}
