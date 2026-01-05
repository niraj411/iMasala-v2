import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Phone,
  Clock,
  Users,
  ChefHat,
  Leaf,
  Wheat,
  Milk,
  Star,
  Check,
  Info,
  Smartphone,
  Zap,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  Truck,
  Building2,
  Receipt,
  Download,
  Apple,
  PlayCircle
} from 'lucide-react';

// Dietary icons component
const DietaryBadge = ({ type }) => {
  const badges = {
    'GF': { label: 'Gluten Free', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    'V': { label: 'Vegan', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'VO': { label: 'Vegan Option', color: 'bg-green-500/10 text-green-400/80 border-green-500/20' },
    'DFO': { label: 'Dairy Free Option', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  };

  const badge = badges[type];
  if (!badge) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${badge.color}`}>
      {type}
    </span>
  );
};

// Menu item component
const MenuItem = ({ item }) => (
  <div className="group p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/20 hover:bg-white/[0.04] transition-all duration-300">
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium text-base sm:text-lg mb-1 group-hover:text-orange-400 transition-colors">
          {item.name}
        </h4>
        <p className="text-white/40 text-sm leading-relaxed mb-3">{item.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {item.dietary?.map((d, i) => (
            <DietaryBadge key={i} type={d} />
          ))}
        </div>
      </div>
      <div className="text-right shrink-0">
        {item.smallPrice && (
          <div className="text-white/60 text-sm">
            <span className="text-white font-semibold">${item.smallPrice}</span>
            <span className="text-white/40 text-xs ml-1">sm</span>
          </div>
        )}
        {item.largePrice && (
          <div className="text-white text-lg font-bold">
            ${item.largePrice}
            {item.serves && <span className="text-white/40 text-xs font-normal ml-1">lg</span>}
          </div>
        )}
        {item.serves && (
          <div className="text-white/30 text-xs mt-1">Serves {item.serves}</div>
        )}
      </div>
    </div>
  </div>
);

// Category section component
const CategorySection = ({ category, items, emoji }) => (
  <div className="mb-12 sm:mb-16">
    <div className="flex items-center gap-3 mb-6">
      {emoji && <span className="text-2xl sm:text-3xl">{emoji}</span>}
      <h3 className="text-2xl sm:text-3xl font-bold text-white">{category}</h3>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {items.map((item, index) => (
        <MenuItem key={index} item={item} />
      ))}
    </div>
  </div>
);

// Feature card for app advantages
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-orange-500/30 transition-all duration-300">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-orange-400" />
    </div>
    <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
    <p className="text-white/50 text-sm leading-relaxed">{description}</p>
  </div>
);

const Catering = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  // All catering menu data - prices updated from WooCommerce CSV
  const cateringData = {
    package: {
      name: "Tandoori Feast",
      description: "Choice of 3 entrees + Basmati Rice + Butter Naan + Veg Pakora + Chutneys",
      price: 399,
      serves: 20
    },

    beverages: [
      { name: "Mango Lassi (Case of 6)", description: "Refreshing yogurt drink blended with ripe mangoes", largePrice: 20, serves: "6", dietary: ["GF"] },
      { name: "Sweet Lassi (Case of 6)", description: "Creamy chilled yogurt drink with cardamom & rose water", largePrice: 20, serves: "6", dietary: ["GF"] },
      { name: "Masala Chai (Case of 6)", description: "Aromatic spiced milk tea with cinnamon & cardamom", largePrice: 15.99, serves: "6", dietary: ["GF", "VO"] },
      { name: "Masala Lemon Lime Soda (Case of 6)", description: "Indian street-style lemonade with unique spice blend", largePrice: 18, serves: "6", dietary: ["GF", "V"] },
      { name: "Assorted Sodas", description: "Individual bottles", largePrice: 2.5, serves: "1" },
    ],

    appetizers: [
      { name: "Vegetable Samosas", description: "Flaky pastries with spiced potatoes, peas & herbs. With chutneys.", smallPrice: 29, largePrice: 50, serves: "6 / 15" },
      { name: "Vegetable Pakoras", description: "Mixed vegetables in spiced chickpea batter, deep-fried", smallPrice: 29, largePrice: 50, serves: "6 / 15", dietary: ["GF", "V"] },
      { name: "Chicken Pakoras", description: "Crispy chicken fritters", smallPrice: 45, largePrice: 90, serves: "6 / 15", dietary: ["GF"] },
      { name: "Shrimp Pakoras", description: "Crispy shrimp fritters", smallPrice: 50, largePrice: 110, serves: "6 / 15", dietary: ["GF"] },
      { name: "Vegetable Momos", description: "Steamed dumplings stuffed with vegetables", smallPrice: 70, largePrice: 140, serves: "6 / 15" },
      { name: "Chicken Momos", description: "Steamed dumplings stuffed with chicken", smallPrice: 70, largePrice: 140, serves: "6 / 15" },
      { name: "Samosa Chaat", description: "Samosas topped with yogurt, tamarind & mint chutney", smallPrice: 50, largePrice: 90, serves: "6 / 15" },
      { name: "Cauli Manchurian", description: "Spiced cauliflower fritters in Indo-Chinese sauce", smallPrice: 50, largePrice: 90, serves: "6 / 15", dietary: ["GF", "V"] },
      { name: "Tandoori Chicken Wings", description: "Grilled in tandoor with yogurt, ginger & garam masala", smallPrice: 55, largePrice: 115, serves: "6 / 15", dietary: ["GF"] },
      { name: "Spicy Tandoori Wings", description: "Extra spicy tandoori wings", smallPrice: 70, largePrice: 115, serves: "6 / 15", dietary: ["GF"] },
      { name: "Garlic Shrimp", description: "Shrimp with garlic and green pepper glaze", smallPrice: 85, largePrice: 160, serves: "6 / 15", dietary: ["GF"] },
      { name: "Chicken Rasila", description: "Pan-fried chicken with bell peppers, onions & black pepper", smallPrice: 85, largePrice: 160, serves: "6 / 15", dietary: ["GF"] },
      { name: "Lamb Rasila", description: "Pan-fried lamb with bell peppers, onions & black pepper", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF"] },
      { name: "Papadam", description: "Crispy rice-flour wafers with cumin & cracked pepper", smallPrice: 25, largePrice: 50, serves: "6 / 15", dietary: ["GF", "V"] },
      { name: "Indian Cucumber Salad", description: "Refreshing cucumber, tomato & onion with zesty spices", smallPrice: 25, largePrice: 45, serves: "6 / 15", dietary: ["GF", "V"] },
    ],

    kebobs: [
      { name: "Tikka Kebobs", description: "Boneless chicken skewers with garlic & ginger. With grilled vegetables.", smallPrice: 89, largePrice: 170, serves: "6 / 15", dietary: ["GF"] },
      { name: "Honey Tikka Kebobs", description: "Sweet glazed chicken skewers with grilled vegetables", smallPrice: 95, largePrice: 185, serves: "6 / 15", dietary: ["GF"] },
      { name: "Shrimp Kebobs", description: "Shrimp skewers with garlic & ginger. With grilled vegetables.", smallPrice: 96, largePrice: 195, serves: "6 / 15", dietary: ["GF"] },
      { name: "Lamb Kebobs", description: "Lamb skewers with garlic & ginger. With grilled vegetables.", smallPrice: 95, largePrice: 190, serves: "6 / 15", dietary: ["GF"] },
      { name: "Mixed Grill Kebobs", description: "Chicken, shrimp & lamb skewers with grilled vegetables", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF"] },
    ],

    chicken: [
      { name: "Chicken Tikka Masala", description: "Chicken in creamy tomato-butter sauce with fenugreek", smallPrice: 95, largePrice: 170, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Butter Chicken", description: "Tandoori chicken in rich onion-tomato cream sauce", smallPrice: 95, largePrice: 175, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Chicken Korma", description: "Chicken with nuts, raisins & spices in creamy gravy", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Chicken Saag", description: "Chicken in Punjabi-style spinach cream sauce", smallPrice: 90, largePrice: 180, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Chicken Karahi", description: "Chicken with bell peppers, tomatoes & onions in spicy curry", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF"] },
      { name: "Chicken Curry", description: "Traditional curry with cumin, turmeric & aromatic spices", smallPrice: 87, largePrice: 170, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Chicken Vindaloo", description: "Fiery curry with potatoes, chilies & vinegar. Spicy!", smallPrice: 87, largePrice: 170, serves: "6 / 15", dietary: ["GF"] },
      { name: "Chicken Chettinad", description: "South Indian curry with curry leaves & turmeric", smallPrice: 90, largePrice: 180, serves: "6 / 15", dietary: ["GF"] },
      { name: "Chicken Malabar", description: "South Indian curry with roasted fennel & coconut", smallPrice: 90, largePrice: 180, serves: "6 / 15", dietary: ["GF"] },
      { name: "Chicken Rogan Josh", description: "Braised chicken in yogurt gravy with browned onions", smallPrice: 90, largePrice: 175, serves: "6 / 15", dietary: ["GF", "DFO"] },
    ],

    lamb: [
      { name: "Lamb Tikka Masala", description: "Lamb in creamy tomato-onion curry", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Lamb Korma", description: "Lamb with nuts, raisins & spices in creamy gravy", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Lamb Saag", description: "Lamb in Punjabi-style spinach cream sauce", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Lamb Karahi", description: "Lamb with bell peppers, tomatoes & onions in spicy curry", smallPrice: 95, largePrice: 190, serves: "6 / 15", dietary: ["GF"] },
      { name: "Lamb Curry", description: "Traditional curry with cumin, turmeric & aromatic spices", smallPrice: 90, largePrice: 180, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Lamb Vindaloo", description: "Fiery curry with potatoes, chilies & vinegar. Spicy!", smallPrice: 90, largePrice: 180, serves: "6 / 15", dietary: ["GF"] },
      { name: "Lamb Chettinad", description: "South Indian coconut curry with curry leaves", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF"] },
      { name: "Lamb Malabar", description: "South Indian coconut curry with roasted fennel", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF"] },
    ],

    seafood: [
      { name: "Shrimp Tikka Masala", description: "Shrimp in creamy tomato-onion curry", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Shrimp Korma", description: "Shrimp with nuts, raisins & spices in creamy gravy", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Shrimp Saag", description: "Shrimp in Punjabi-style spinach cream sauce", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Shrimp Karahi", description: "Shrimp with bell peppers, tomatoes & onions in spicy curry", smallPrice: 100, largePrice: 195, serves: "6 / 15", dietary: ["GF"] },
      { name: "Shrimp Curry", description: "Traditional curry with cumin, turmeric & aromatic spices", smallPrice: 95, largePrice: 190, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Shrimp Vindaloo", description: "Fiery curry with potatoes, chilies & vinegar. Spicy!", smallPrice: 90, largePrice: 190, serves: "6 / 15", dietary: ["GF"] },
      { name: "Shrimp Chettinad", description: "South Indian curry with curry leaves & turmeric", smallPrice: 95, largePrice: 195, serves: "6 / 15", dietary: ["GF"] },
    ],

    vegetarian: [
      { name: "Paneer Tikka Masala", description: "Paneer in creamy tomato-butter sauce", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Paneer Korma", description: "Paneer with nuts, raisins & spices in creamy gravy", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Paneer Karahi", description: "Paneer with bell peppers, tomatoes in spicy curry", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Paneer Curry", description: "Paneer in classic curry with cumin & turmeric", smallPrice: 90, largePrice: 180, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Paneer Chettinad", description: "Paneer in South Indian curry with curry leaves", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Saag Paneer", description: "Paneer in rich, creamy spinach sauce", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Matar Paneer", description: "Paneer & peas in tomato sauce with garam masala", smallPrice: 95, largePrice: 180, serves: "6 / 15", dietary: ["GF"] },
      { name: "Malai Kofta", description: "Vegetable dumplings in coconut-cashew sauce", smallPrice: 90, largePrice: 160, serves: "6 / 15", dietary: ["GF"] },
      { name: "Kofta Keshari", description: "Homemade vegetable cutlets in creamy Keshari sauce", smallPrice: 90, largePrice: 160, serves: "6 / 15", dietary: ["GF"] },
    ],

    vegan: [
      { name: "Chana Masala", description: "Chickpeas in tangy tomato sauce with garam masala", smallPrice: 70, largePrice: 140, serves: "7 / 15", dietary: ["GF", "V"] },
      { name: "Vegetable Curry", description: "Mixed vegetables in traditional curry", smallPrice: 78, largePrice: 160, serves: "6 / 15", dietary: ["GF", "V"] },
      { name: "Tofu Saag", description: "Tofu in Punjabi-style spinach sauce", smallPrice: 75, largePrice: 150, serves: "6 / 15", dietary: ["GF", "V"] },
      { name: "Dal Makhani", description: "Black lentils slow-cooked with butter & cream", smallPrice: 80, largePrice: 160, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Dal Tadka", description: "Yellow lentils tempered with ghee & spices", smallPrice: 70, largePrice: 140, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Aloo Gobi", description: "Cauliflower & potatoes with onions & spices", smallPrice: 75, largePrice: 150, serves: "6 / 15", dietary: ["GF", "V"] },
      { name: "Aloo Matar", description: "Potatoes & green peas in aromatic curry", smallPrice: 70, largePrice: 140, serves: "6 / 15", dietary: ["GF", "V"] },
      { name: "Baigan Bharta", description: "Roasted eggplant mashed with tomatoes & peas. Smoky!", smallPrice: 80, largePrice: 160, serves: "6 / 15", dietary: ["GF", "VO"] },
    ],

    biryani: [
      { name: "Vegetable Biryani", description: "Basmati rice with vegetables, saffron & spices. Includes raita.", smallPrice: 78, largePrice: 130, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Chicken Biryani", description: "Basmati rice with chicken, saffron & spices. Includes raita.", smallPrice: 80, largePrice: 160, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Paneer Biryani", description: "Basmati rice with paneer, saffron & spices. Includes raita.", smallPrice: 90, largePrice: 180, serves: "6 / 15", dietary: ["GF", "VO"] },
      { name: "Lamb Biryani", description: "Basmati rice with lamb, saffron & spices. Includes raita.", smallPrice: 90, largePrice: 180, serves: "6 / 15", dietary: ["GF", "DFO"] },
      { name: "Shrimp Biryani", description: "Basmati rice with shrimp, saffron & spices. Includes raita.", smallPrice: 90, largePrice: 175, serves: "6 / 15", dietary: ["GF", "DFO"] },
    ],

    noodlesRice: [
      { name: "Basmati Rice", description: "Steamed aromatic basmati rice", smallPrice: 20, largePrice: 40, serves: "7 / 15", dietary: ["GF", "V"] },
      { name: "Brown Rice", description: "Steamed brown rice", smallPrice: 20, largePrice: 40, serves: "7 / 15", dietary: ["GF", "V"] },
      { name: "Fried Rice", description: "Wok-fried rice with vegetables", smallPrice: 35, largePrice: 60, serves: "7 / 15", dietary: ["GF", "V"] },
      { name: "Yellow (Turmeric) Rice", description: "Golden rice infused with turmeric", smallPrice: 25, largePrice: 45, serves: "7 / 15", dietary: ["GF", "VO"] },
      { name: "Vegetable Chow Mein", description: "Stir-fried noodles with vegetables", smallPrice: 72, largePrice: 130, serves: "7 / 15" },
      { name: "Chicken Chow Mein", description: "Stir-fried noodles with chicken", smallPrice: 80, largePrice: 150, serves: "7 / 15" },
      { name: "Lamb Chow Mein", description: "Stir-fried noodles with lamb", smallPrice: 90, largePrice: 180, serves: "7 / 15" },
      { name: "Shrimp Chow Mein", description: "Stir-fried noodles with shrimp", smallPrice: 90, largePrice: 180, serves: "7 / 15" },
    ],

    breads: [
      { name: "Naan", description: "Leavened flatbread baked in clay oven", largePrice: 2.5, serves: "1" },
      { name: "Garlic Naan", description: "Naan with fresh minced garlic & cilantro", largePrice: 3.5, serves: "1" },
      { name: "Cheese Naan", description: "Naan stuffed with cheese", largePrice: 3.5, serves: "1" },
      { name: "Garlic Cheese Naan", description: "Naan with garlic and cheese", largePrice: 3.99, serves: "1" },
      { name: "Aloo Naan", description: "Naan stuffed with spiced potatoes", largePrice: 3.99, serves: "1" },
      { name: "Kabuli Naan", description: "Naan with nuts and dried fruits", largePrice: 3.99, serves: "1" },
      { name: "Paratha", description: "Flaky, buttery layered flatbread", largePrice: 3.99, serves: "1" },
      { name: "Roti", description: "Whole wheat unleavened flatbread", largePrice: 2.99, serves: "1", dietary: ["VO"] },
    ],

    extras: [
      { name: "Mint Chutney", description: "Cool, spicy & tangy green chutney", largePrice: 7.99, dietary: ["GF", "V"] },
      { name: "Tamarind Chutney", description: "Sweet & tangy sauce for samosas & pakoras", largePrice: 9.99, dietary: ["GF", "V"] },
      { name: "Raita (32 oz)", description: "Creamy yogurt sauce with fresh herbs", largePrice: 7.99, dietary: ["GF"] },
      { name: "Utensils Set", description: "Plate, napkin, cutlery, salt & pepper", largePrice: 0.55, serves: "1" },
    ],

    desserts: [
      { name: "Gulab Jamun", description: "Golden milk pastry globes in cardamom syrup", smallPrice: 25, largePrice: 45, serves: "6 / 12" },
      { name: "Ras Malai", description: "Cottage cheese balls in aromatic milk syrup", smallPrice: 35, largePrice: 65, serves: "6 / 12", dietary: ["GF"] },
      { name: "Rice Pudding (Kheer)", description: "Creamy rice pudding with cinnamon & raisins", smallPrice: 30, largePrice: 55, serves: "6 / 12", dietary: ["GF"] },
      { name: "Carrot Pudding (Gajar Halwa)", description: "Carrots slow-cooked with milk, sugar & nuts", smallPrice: 45, largePrice: 85, serves: "6 / 12", dietary: ["GF"] },
      { name: "Shrikhand", description: "Homemade yogurt with cinnamon & sliced bananas", smallPrice: 30, largePrice: 55, serves: "6 / 12", dietary: ["GF"] },
    ],
  };

  const categories = [
    { id: 'beverages', name: 'Party Beverages', emoji: '🥤', data: cateringData.beverages },
    { id: 'appetizers', name: 'Appetizers & Street Food', emoji: '🥟', data: cateringData.appetizers },
    { id: 'kebobs', name: 'Kebobs', emoji: '🍢', data: cateringData.kebobs },
    { id: 'chicken', name: 'Chicken Entrees', emoji: '🍗', data: cateringData.chicken },
    { id: 'lamb', name: 'Lamb Entrees', emoji: '🍖', data: cateringData.lamb },
    { id: 'seafood', name: 'Seafood Entrees', emoji: '🦐', data: cateringData.seafood },
    { id: 'vegetarian', name: 'Vegetarian Entrees', emoji: '🧀', data: cateringData.vegetarian },
    { id: 'vegan', name: 'Vegan Entrees', emoji: '🥬', data: cateringData.vegan },
    { id: 'biryani', name: 'Biryani', emoji: '🍚', data: cateringData.biryani },
    { id: 'noodlesRice', name: 'Noodles & Rice', emoji: '🍜', data: cateringData.noodlesRice },
    { id: 'breads', name: 'Breads', emoji: '🫓', data: cateringData.breads },
    { id: 'extras', name: 'Chutneys & Extras', emoji: '🫙', data: cateringData.extras },
    { id: 'desserts', name: 'Desserts', emoji: '🍮', data: cateringData.desserts },
  ];

  const appFeatures = [
    {
      icon: Zap,
      title: "Instant Online Ordering",
      description: "Order catering directly through our app in minutes. No phone calls, no waiting. Build your order, pick your date, and checkout instantly."
    },
    {
      icon: CalendarCheck,
      title: "Schedule Up to 30 Days Ahead",
      description: "Plan your corporate events, weddings, and parties with ease. Select your preferred delivery date and time with just a few taps."
    },
    {
      icon: Building2,
      title: "Tax Exemption for Organizations",
      description: "Non-profits and tax-exempt organizations can add their exemption certificate to their account. Tax is automatically removed on every catering order."
    },
    {
      icon: Truck,
      title: "Delivery or Pickup Options",
      description: "Choose delivery to your venue or pick up at our location. Real-time delivery zone pricing with no hidden fees."
    },
    {
      icon: Receipt,
      title: "Track Every Order",
      description: "View your complete order history, reorder favorites with one tap, and get email confirmations instantly."
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay securely online with credit card. No deposits required, no phone calls to confirm. Simple and transparent."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
            <Smartphone className="w-4 h-4 text-orange-400" strokeWidth={2} />
            <span className="text-sm font-medium text-orange-400">Order Catering Online - Only on Our App</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            The Easiest Way to Order<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Indian Catering</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-3xl mx-auto mb-8">
            Skip the phone calls. Order authentic Indian catering instantly through our app.
            Perfect for corporate events, weddings, and celebrations. No other Indian restaurant in Boulder County offers this.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-white/40 text-sm">Menu Items</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">$250</div>
              <div className="text-white/40 text-sm">Min Order</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">6+</div>
              <div className="text-white/40 text-sm">Years Award-Winning</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/shop?mode=catering')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25"
            >
              <Zap className="w-5 h-5" />
              <span>Order Catering Now</span>
            </button>
            <a
              href="tel:+13036658530"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white rounded-2xl font-medium transition-all duration-300"
            >
              <Phone className="w-4 h-4" />
              <span>(303) 665-8530</span>
            </a>
          </div>

          {/* Awards */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white/60 text-sm">Best of Boulder East County 2018-2024</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white/60 text-sm">Yelp Top 100 Restaurants 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Order Through Our App Section */}
      <section className="py-16 px-4 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Order Through Our App?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              We're the only Indian restaurant in the area with true online catering.
              No competitors offer this level of convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tax Exemption Highlight */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 overflow-hidden">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Tax-Exempt Organizations Save on Every Order
                </h3>
                <p className="text-white/60 mb-4">
                  Schools, churches, non-profits, and government agencies can register their tax exemption certificate
                  in their account. Once verified, sales tax is automatically removed from all catering orders.
                  No paperwork at checkout, no manual requests - it just works.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-green-400/80 text-sm">
                    <Check className="w-4 h-4" />
                    <span>One-time setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400/80 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Automatic on all orders</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400/80 text-sm">
                    <Check className="w-4 h-4" />
                    <span>No paperwork needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Package */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent border border-orange-500/30 overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> BEST VALUE
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Tandoori Feast Package
                </h2>
                <p className="text-white/60 text-lg mb-4 max-w-xl">
                  {cateringData.package.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-white/50">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Choice of 3 Entrees</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Basmati Rice</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Butter Naan</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Veg Pakora</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Chutneys</span>
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="text-5xl sm:text-6xl font-bold text-white mb-2">
                  ${cateringData.package.price}
                </div>
                <div className="text-white/40 text-lg">
                  Serves {cateringData.package.serves} people
                </div>
                <button
                  onClick={() => navigate('/shop?mode=catering')}
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dietary Legend */}
      <section className="py-8 px-4 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <DietaryBadge type="GF" />
              <span className="text-white/40 text-sm">Gluten Free</span>
            </div>
            <div className="flex items-center gap-2">
              <DietaryBadge type="V" />
              <span className="text-white/40 text-sm">Vegan</span>
            </div>
            <div className="flex items-center gap-2">
              <DietaryBadge type="VO" />
              <span className="text-white/40 text-sm">Vegan Option</span>
            </div>
            <div className="flex items-center gap-2">
              <DietaryBadge type="DFO" />
              <span className="text-white/40 text-sm">Dairy Free Option</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="sticky top-0 z-40 py-4 px-4 bg-black/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="shrink-0 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-orange-500/30 rounded-xl text-white/70 hover:text-white text-sm font-medium transition-all"
              >
                {cat.emoji} {cat.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {categories.map((category) => (
            <div key={category.id} id={category.id}>
              <CategorySection
                category={category.name}
                items={category.data}
                emoji={category.emoji}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Download App CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full mb-6">
            <Smartphone className="w-4 h-4 text-white/60" />
            <span className="text-sm font-medium text-white/60">Available on iOS & Android</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Download the App & Start Ordering
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-2xl mx-auto">
            Get the full experience with our mobile app. Browse menus, place orders,
            track delivery, and manage your tax exemption status - all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://apps.apple.com/app/id6738263695"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              <span>Download on App Store</span>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.tandoorikitchen.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white rounded-2xl font-medium transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <span>Get on Google Play</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-16 px-4 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            <Info className="w-8 h-8 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">Ordering Information</h3>
            <div className="text-white/50 space-y-2">
              <p>Minimum order: $250 | 4 hours advance notice required</p>
              <p>Delivery available within 25 miles | $20-$30 delivery fee based on zone</p>
              <p>Prices subject to change | Gratuity not included</p>
              <p className="pt-4">
                <strong className="text-white">Questions?</strong> Call (303) 665-8530
              </p>
              <p>
                199 W South Boulder Rd, Lafayette, CO |
                <a href="https://tandoorikitchenco.com" className="text-orange-400 hover:text-orange-300 ml-1">
                  tandoorikitchenco.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Catering;
