/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, MouseEvent } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  ShoppingBag, 
  Sparkles, 
  Utensils, 
  Plus, 
  Loader2, 
  MessageCircle,
  X,
  ArrowRight,
  Coffee,
  Pizza,
  Cake,
  Leaf,
  Trash2,
  Minus,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  numericPrice: number;
  image: string;
  category: string;
  hasSupplements?: boolean;
  isCake?: boolean;
}

interface CartItem {
  cartId: string;
  dish: Dish;
  supplements: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cakeOptions?: {
    size: string;
    style: string;
    isCustom: boolean;
  };
}

const WHATSAPP_NUMBER = "+22890684410";
const LOGO_URL = "https://image2url.com/r2/default/images/1772985200007-06a69fb4-0bb8-4c78-9a3c-43188cb501d7.jpeg";

const CAKE_STYLES = [
  "https://image2url.com/r2/default/images/1774779125907-c9b6f47e-ef0f-4840-bc8b-2f75b5d6088f.jpg",
  "https://image2url.com/r2/default/images/1774779172540-1e7761bc-5b91-4184-8a2c-54d572363108.jpg",
  "https://image2url.com/r2/default/images/1774779292777-b027dd8c-f8fc-44ab-a059-78d7bdd29ecf.jpg",
  "https://image2url.com/r2/default/images/1774779338857-19227ef3-0385-4d38-94bc-d4786b4ac348.jpg",
  "https://image2url.com/r2/default/images/1774779383563-1898485a-141b-47e3-9c73-40479a11fb93.jpg",
  "https://image2url.com/r2/default/images/1774779417037-e742f1a9-9871-4fac-9a20-511051d4a002.jpg"
];

const CAKE_SIZES = [
  { label: 'Petit (7.000 FCFA)', price: 7000 },
  { label: 'Moyen (10.000 FCFA)', price: 10000 },
  { label: 'Grand (12.000 FCFA)', price: 12000 },
  { label: 'Personnalisé (Sur devis)', price: 0, isCustom: true }
];

const INITIAL_DISHES: Dish[] = [
  {
    id: '1',
    name: 'Croque Madame',
    description: 'Pain de mie toasté, jambon, fromage fondu, surmonté d\'un œuf au plat.',
    price: '2.000 FCFA',
    numericPrice: 2000,
    image: 'https://i.pinimg.com/1200x/05/72/58/057258b2d7f3a59c2a898dc0cbd3c337.jpg',
    category: 'Croque',
    hasSupplements: true
  },
  {
    id: '2',
    name: 'Croque Monsieur',
    description: 'Le classique incontournable : pain de mie, jambon et fromage fondant.',
    price: '1.500 FCFA',
    numericPrice: 1500,
    image: 'https://i.pinimg.com/1200x/6b/d2/3d/6bd23d001ba12bb186740601fdc5deaf.jpg',
    category: 'Croque',
    hasSupplements: true
  },
  {
    id: '3',
    name: 'Crêpes à Viande Hachée',
    description: 'Crêpes salées généreusement garnies de viande hachée assaisonnée.',
    price: '1.500 FCFA',
    numericPrice: 1500,
    image: 'https://i.pinimg.com/736x/96/b6/3b/96b63b899487d2693735ecbf1b788648.jpg',
    category: 'Crêpes',
    hasSupplements: true
  },
  {
    id: '4',
    name: 'Crêpes Viande + Fromage',
    description: 'Crêpes à la viande hachée avec une onctueuse couche de fromage.',
    price: '2.000 FCFA',
    numericPrice: 2000,
    image: 'https://i.pinimg.com/736x/a0/43/23/a04323a0c902f11baf0b16116ec0aedd.jpg',
    category: 'Crêpes',
    hasSupplements: true
  },
  {
    id: '5',
    name: 'Crêpes Viande + Double Fromage',
    description: 'Pour les gourmands : viande hachée, double dose de fromage et supplément sauce.',
    price: '2.500 FCFA',
    numericPrice: 2500,
    image: 'https://i.pinimg.com/1200x/30/ea/ab/30eaaba97b5227aeb20d2156503cbff5.jpg',
    category: 'Crêpes'
  },
  {
    id: '6',
    name: 'Spécial CROK-ME',
    description: 'Le combo ultime : Croque Monsieur + Crêpes viande hachée double fromage + supplément sauce.',
    price: '4.000 FCFA',
    numericPrice: 4000,
    image: 'https://image2url.com/r2/default/images/1772988514181-897351d3-b1b8-4205-8045-f7f5478c9126.jpeg',
    category: 'Spécial'
  },
  {
    id: '7',
    name: 'Hot Dog Simple',
    description: 'Pain brioché et saucisse savoureuse.',
    price: '1.000 FCFA',
    numericPrice: 1000,
    image: 'https://i.pinimg.com/1200x/3e/0b/a8/3e0ba8de9eb4b2a716be6e76c23440c1.jpg',
    category: 'Hot Dog',
    hasSupplements: true
  },
  {
    id: '8',
    name: 'Hot Dog Classique',
    description: 'Pain, saucisse et fromage fondu.',
    price: '1.500 FCFA',
    numericPrice: 1500,
    image: 'https://i.pinimg.com/1200x/7a/34/b2/7a34b2a5a3490ee8f29fa2baaacb7d0e.jpg',
    category: 'Hot Dog',
    hasSupplements: true
  },
  {
    id: '9',
    name: 'Spécial Hot Dog',
    description: 'Pain, saucisse, double fromage et notre sauce spéciale.',
    price: '2.500 FCFA',
    numericPrice: 2500,
    image: 'https://i.pinimg.com/736x/d4/93/81/d4938189b9e08d9828f5337e97bae0e0.jpg',
    category: 'Hot Dog'
  },
  {
    id: '10',
    name: 'Boisson',
    description: 'Rafraîchissement au choix.',
    price: '500 FCFA',
    numericPrice: 500,
    image: 'https://i.pinimg.com/1200x/2c/3f/50/2c3f505c3df791391fccada28ea65ff2.jpg',
    category: 'Boisson'
  },
  {
    id: '11',
    name: 'Gaufre au Chocolat',
    description: 'Délicieuse gaufre croustillante nappée de chocolat fondant.',
    price: '1.000 FCFA',
    numericPrice: 1000,
    image: 'https://i.pinimg.com/1200x/90/2d/85/902d859c18bf58d7e240573c039c0dcc.jpg',
    category: 'Gaufres'
  },
  {
    id: '12',
    name: 'Crêpe au Chocolat',
    description: 'Crêpe douce et moelleuse généreusement garnie de chocolat.',
    price: '1.500 FCFA',
    numericPrice: 1500,
    image: 'https://i.pinimg.com/1200x/1b/19/54/1b19546a6cd3aa630e26d21ed06a9eab.jpg',
    category: 'Crêpes'
  },
  {
    id: '13',
    name: 'Gâteau d\'anniversaire',
    description: 'Célébrez vos moments spéciaux avec nos gâteaux artisanaux. Choisissez votre taille et votre style préféré.',
    price: 'À partir de 7.000 FCFA',
    numericPrice: 7000,
    image: 'https://image2url.com/r2/default/images/1774777843889-42878616-2948-4880-aa98-2d53bac7783c.jpg',
    category: 'Gâteaux',
    isCake: true
  }
];

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [dishes] = useState<Dish[]>(INITIAL_DISHES);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [selectedSupplements, setSelectedSupplements] = useState<Record<string, string[]>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCakeModalOpen, setIsCakeModalOpen] = useState(false);
  const [selectedCakeDish, setSelectedCakeDish] = useState<Dish | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ label: string; price: number; isCustom?: boolean } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isCustomStyle, setIsCustomStyle] = useState(false);
  const [flyingItems, setFlyingItems] = useState<{ id: number; x: number; y: number; image: string }[]>([]);

  const categories = ['Tous', 'Croque', 'Crêpes', 'Gaufres', 'Hot Dog', 'Gâteaux', 'Spécial', 'Boisson'];

  const filteredDishes = activeCategory === 'Tous' 
    ? dishes 
    : dishes.filter(d => d.category === activeCategory);

  const toggleSupplement = (dishId: string, supplement: string) => {
    setSelectedSupplements(prev => {
      const current = prev[dishId] || [];
      if (current.includes(supplement)) {
        return { ...prev, [dishId]: current.filter(s => s !== supplement) };
      } else {
        return { ...prev, [dishId]: [...current, supplement] };
      }
    });
  };

  const addToCart = (dish: Dish, cakeOptions?: { size: string; style: string; isCustom: boolean; price: number }) => {
    const supplements = selectedSupplements[dish.id] || [];
    const basePrice = cakeOptions ? cakeOptions.price : dish.numericPrice;
    const unitPrice = basePrice + (supplements.length * 500);
    
    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => 
        item.dish.id === dish.id && 
        JSON.stringify(item.supplements.sort()) === JSON.stringify([...supplements].sort()) &&
        JSON.stringify(item.cakeOptions) === JSON.stringify(cakeOptions ? { size: cakeOptions.size, style: cakeOptions.style, isCustom: cakeOptions.isCustom } : undefined)
      );

      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += 1;
        newCart[existingItemIndex].totalPrice = newCart[existingItemIndex].quantity * unitPrice;
        return newCart;
      }

      const newItem: CartItem = {
        cartId: Math.random().toString(36).substr(2, 9),
        dish,
        supplements: [...supplements],
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
        cakeOptions: cakeOptions ? { size: cakeOptions.size, style: cakeOptions.style, isCustom: cakeOptions.isCustom } : undefined
      };
      return [...prev, newItem];
    });

    setSelectedSupplements(prev => ({ ...prev, [dish.id]: [] }));
  };

  const handleAddToCartWithAnimation = (e: MouseEvent | null, dish: Dish, cakeOptions?: { size: string; style: string; isCustom: boolean; price: number }) => {
    if (dish.isCake && !cakeOptions) {
      setSelectedCakeDish(dish);
      setIsCakeModalOpen(true);
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    
    const id = Date.now();
    setFlyingItems(prev => [...prev, { id, x, y, image: cakeOptions?.isCustom ? dish.image : (cakeOptions?.style || dish.image) }]);
    
    addToCart(dish, cakeOptions);
    
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== id));
    }, 1000);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const orderOnWhatsApp = () => {
    if (cart.length === 0) return;

    let message = "Bonjour CROK-ME ! Je souhaiterais passer une commande :\n\n";
    
    cart.forEach((item, index) => {
      const supplementText = item.supplements.length > 0 
        ? ` (Suppléments : ${item.supplements.join(', ')})` 
        : '';
      
      let cakeText = '';
      if (item.cakeOptions) {
        const styleName = item.cakeOptions.isCustom ? 'Personnalisé' : `Modèle ${CAKE_STYLES.indexOf(item.cakeOptions.style) + 1}`;
        cakeText = ` [Taille: ${item.cakeOptions.size}, Style: ${styleName}]`;
      }

      const priceText = item.cakeOptions?.isCustom && item.totalPrice === 0 
        ? "Sur devis" 
        : `${(item.totalPrice).toLocaleString()} FCFA`;

      message += `${index + 1}. ${item.quantity}x ${item.dish.name}${cakeText}${supplementText} - ${priceText}\n`;
    });

    const hasCustomCake = cart.some(item => item.cakeOptions?.isCustom && item.totalPrice === 0);
    message += `\nTotal de la commande : ${cartTotal.toLocaleString()} FCFA${hasCustomCake ? ' (+ Sur devis)' : ''}.`;
    
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence mode="wait">
      {!hasEntered ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        >
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://v1.pinimg.com/videos/mc/expMp4/de/88/b6/de88b65d088d9ce0770ee3d2c2a44ebc_t3.mp4" type="video/mp4" />
            </video>
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative z-10 mb-8 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white rounded-3xl flex items-center justify-center overflow-hidden border-2 border-white/20 p-4 shadow-2xl"
          >
            <img 
              src={LOGO_URL} 
              alt="CROK-ME Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10"
          >
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-2 px-4 drop-shadow-lg"
            >
              Bienvenue chez CROK-ME
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-white/90 font-serif italic mb-10"
            >
              Croque - Savoure - Recommence
            </motion.p>
            
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHasEntered(true)}
                className="group relative inline-flex items-center gap-3 px-8 py-3 sm:px-10 sm:py-4 bg-white text-[#4A2C1D] rounded-full font-bold text-base sm:text-lg shadow-xl hover:bg-gray-100 active:bg-gray-200 transition-all"
              >
              ACCÉDER AU MENU
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          <div className="absolute bottom-10 flex flex-col items-center gap-2 z-10">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">
              Lomé, Togo • Saveurs Authentiques
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">
              by alexis
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-[#FDFCFB] text-[#2D1B12]"
        >
          {/* Header */}
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E8DED1] px-4 sm:px-6 py-3 sm:py-4"
          >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-[#E8DED1] p-1 shadow-sm">
              <img 
                src={LOGO_URL} 
                alt="CROK-ME Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if URL is invalid
                  (e.target as HTMLImageElement).src = 'https://loremflickr.com/100/100/logo,restaurant/all';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#4A2C1D] drop-shadow-sm">CROK-ME</h1>
              <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold opacity-60 text-[#2D1B12]">Croque - Savoure - Recommence</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={cart.length > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 sm:p-3 bg-[#4A2C1D] text-white rounded-full shadow-lg hover:bg-[#2D1B12] transition-colors"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </motion.button>
        </div>
          </motion.header>

      {/* Hero Section */}
      <section className="relative h-[35vh] sm:h-[40vh] flex items-center justify-center overflow-hidden bg-[#2D1B12]">
        <img 
          src="https://i.pinimg.com/1200x/a6/23/4e/a6234ee3f205326bb058acf32c5257be.jpg" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="CROK-ME background"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl md:text-6xl font-serif text-[#FDFCFB] mb-4 italic"
          >
            Croque - Savoure - Recommence
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#FDFCFB]/80 max-w-lg mx-auto text-xs sm:text-sm md:text-base font-light tracking-wide"
          >
            Découvrez les meilleurs croques, crêpes et hot-dogs de la ville. Une explosion de saveurs à chaque bouchée.
          </motion.p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat 
                  ? 'bg-[#4A2C1D] text-white shadow-lg' 
                  : 'bg-white border border-elegant text-[#2D1B12]/60 hover:border-[#4A2C1D]'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Catalog Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredDishes.map((dish, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5,
                  delay: index % 3 * 0.1 
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                whileTap={{ scale: 0.98 }}
                key={dish.id}
                className="elegant-card group menu-glow hover:shadow-2xl hover:shadow-[#4A2C1D]/15"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {dish.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#2D1B12]">{dish.name}</h3>
                    <motion.span 
                      key={dish.id + (selectedSupplements[dish.id]?.length || 0)}
                      initial={{ scale: 0.8, opacity: 0, y: 5 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className="text-2xl font-serif italic text-[#4A2C1D] font-bold"
                    >
                      {(dish.numericPrice + ((selectedSupplements[dish.id]?.length || 0) * 500)).toLocaleString()} FCFA
                    </motion.span>
                  </div>
                  <p className="text-sm text-[#2D1B12]/70 mb-4 line-clamp-2 font-light leading-relaxed">
                    {dish.description}
                  </p>

                  {/* Supplements Section */}
                  {dish.hasSupplements && (
                    <div className="mb-6 space-y-2">
                      <p className="text-[12px] font-bold uppercase tracking-widest opacity-60 text-[#4A2C1D]">Suppléments (+500 FCFA)</p>
                      <div className="flex flex-wrap gap-2">
                        {['Fromage', 'Sauce'].map(sup => (
                          <button
                            key={sup}
                            onClick={() => toggleSupplement(dish.id, sup)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                              selectedSupplements[dish.id]?.includes(sup)
                                ? 'bg-[#5A3E2B] text-white border-[#5A3E2B]'
                                : 'bg-warm text-[#3D2B1F]/60 border-elegant hover:border-[#5A3E2B]'
                            }`}
                          >
                            {selectedSupplements[dish.id]?.includes(sup) ? <Plus className="w-2.5 h-2.5 inline mr-1 rotate-45" /> : <Plus className="w-2.5 h-2.5 inline mr-1" />}
                            {sup}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleAddToCartWithAnimation(e, dish)}
                    className="btn-primary w-full group/btn"
                  >
                    <Plus className="w-4 h-4" />
                    AJOUTER AU PANIER
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover/btn:opacity-100 group-hover/btn:translate-x-0" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-warm border-t border-elegant py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4 className="text-lg font-bold mb-4 text-[#2D1B12]">CROK-ME</h4>
            <p className="text-sm text-[#2D1B12]/60 font-light leading-relaxed">
              Le spécialiste du croque-monsieur et des crêpes gourmandes. Qualité, fraîcheur et gourmandise au rendez-vous.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 text-[#2D1B12]">Contact</h4>
            <p className="text-sm text-[#2D1B12]/60 font-light mb-2">Lomé, Togo</p>
            <p className="text-sm text-[#2D1B12]/60 font-light">{WHATSAPP_NUMBER}</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 text-[#2D1B12]">Slogan</h4>
            <p className="text-base sm:text-lg text-[#4A2C1D] font-serif italic drop-shadow-sm">Croque - Savoure - Recommence</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-elegant text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
            © 2026 CROK-ME • Tous droits réservés
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-2">
            by alexis
          </p>
        </div>
      </footer>

      {/* Cake Selection Modal */}
      <AnimatePresence>
        {isCakeModalOpen && selectedCakeDish && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCakeModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-white rounded-[2.5rem] z-[70] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#4A2C1D]">Personnalisez votre gâteau</h2>
                <button 
                  onClick={() => setIsCakeModalOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#4A2C1D]/60 mb-4">1. Choisissez la taille</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CAKE_SIZES.map((size) => (
                      <button
                        key={size.label}
                        onClick={() => setSelectedSize(size)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${
                          selectedSize?.label === size.label
                            ? 'border-[#4A2C1D] bg-[#4A2C1D]/5'
                            : 'border-black/5 hover:border-[#4A2C1D]/30'
                        }`}
                      >
                        <span className="font-bold">{size.label}</span>
                        {selectedSize?.label === size.label && <div className="w-2 h-2 bg-[#4A2C1D] rounded-full" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#4A2C1D]/60 mb-4">2. Choisissez le style</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {CAKE_STYLES.map((style, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedStyle(style);
                          setIsCustomStyle(false);
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                          selectedStyle === style && !isCustomStyle
                            ? 'border-[#4A2C1D] scale-95'
                            : 'border-transparent hover:border-[#4A2C1D]/30'
                        }`}
                      >
                        <img src={style} alt={`Style ${idx + 1}`} className="w-full h-full object-cover" />
                        {selectedStyle === style && !isCustomStyle && (
                          <div className="absolute inset-0 bg-[#4A2C1D]/20 flex items-center justify-center">
                            <div className="bg-white p-1 rounded-full">
                              <Plus className="w-4 h-4 text-[#4A2C1D] rotate-45" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setIsCustomStyle(true);
                        setSelectedStyle(selectedCakeDish.image);
                      }}
                      className={`relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                        isCustomStyle
                          ? 'border-[#4A2C1D] bg-[#4A2C1D]/5'
                          : 'border-black/10 hover:border-[#4A2C1D]/30'
                      }`}
                    >
                      <Sparkles className="w-6 h-6 text-[#4A2C1D]" />
                      <span className="text-[10px] font-bold uppercase">Sur mesure</span>
                    </button>
                  </div>
                </section>
              </div>

              <div className="p-6 border-t border-black/5 bg-gray-50">
                <button
                  disabled={!selectedSize || (!selectedStyle && !isCustomStyle)}
                  onClick={() => {
                    handleAddToCartWithAnimation(null, selectedCakeDish, {
                      size: selectedSize!.label,
                      style: selectedStyle || selectedCakeDish.image,
                      isCustom: isCustomStyle,
                      price: selectedSize!.price
                    });
                    setIsCakeModalOpen(false);
                    setSelectedSize(null);
                    setSelectedStyle(null);
                    setIsCustomStyle(false);
                  }}
                  className="w-full bg-[#4A2C1D] text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:bg-[#2D1B12] transition-all flex items-center justify-center gap-2"
                >
                  CONFIRMER ET AJOUTER
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-4 bottom-4 right-4 w-[calc(100%-2rem)] max-w-md bg-white/80 backdrop-blur-2xl z-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col rounded-[2.5rem] border border-white/40 overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between bg-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4A2C1D] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4A2C1D]/20">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#4A2C1D]">Votre Panier</h2>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">CROK-ME Gourmet</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-3 hover:bg-black/5 rounded-2xl transition-all active:scale-90"
                >
                  <X className="w-6 h-6 text-[#2D1B12]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 bg-black/5 rounded-[2rem] flex items-center justify-center"
                    >
                      <ShoppingBag className="w-12 h-12 text-black/10" />
                    </motion.div>
                    <div>
                      <p className="text-xl font-bold text-[#2D1B12]">Votre panier est vide</p>
                      <p className="text-sm text-[#2D1B12]/60 mt-2">Ajoutez des délices pour commencer votre commande.</p>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-8 py-3 bg-[#4A2C1D]/10 text-[#4A2C1D] rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#4A2C1D]/20 transition-colors"
                    >
                      Retour au menu
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      layout
                      key={item.cartId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-5 p-5 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 group shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/80 shadow-inner">
                        <img src={item.cakeOptions?.style || item.dish.image} alt={item.dish.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[#2D1B12] truncate text-lg">{item.dish.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.cartId)}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {item.cakeOptions && (
                          <div className="text-[10px] text-[#4A2C1D] font-medium mt-1">
                            {item.cakeOptions.size} • {item.cakeOptions.isCustom ? 'Style personnalisé' : 'Style choisi'}
                          </div>
                        )}
                        {item.supplements.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.supplements.map(s => (
                              <span key={s} className="text-[9px] bg-[#4A2C1D]/10 text-[#4A2C1D] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl px-3 py-1.5 shadow-sm">
                            <button 
                              onClick={() => updateQuantity(item.cartId, -1)}
                              className="p-1 hover:text-[#4A2C1D] transition-colors active:scale-75"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.cartId, 1)}
                              className="p-1 hover:text-[#4A2C1D] transition-colors active:scale-75"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-serif italic font-bold text-[#4A2C1D] text-lg">
                            {item.totalPrice.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-white/40 backdrop-blur-xl border-t border-white/60 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-[#2D1B12]/40 uppercase tracking-[0.2em] mb-1">Total à payer</p>
                      <span className="text-4xl font-serif italic font-bold text-[#4A2C1D]">
                        {cartTotal.toLocaleString()} <span className="text-xl not-italic font-sans opacity-60">FCFA</span>
                        {cart.some(item => item.cakeOptions?.isCustom && item.totalPrice === 0) && (
                          <span className="text-sm block opacity-60">+ Sur devis</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={orderOnWhatsApp}
                    className="w-full bg-[#4A2C1D] text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-[#4A2C1D]/20 flex items-center justify-center gap-3 group/order"
                  >
                    <MessageCircle className="w-6 h-6" />
                    COMMANDER SUR WHATSAPP
                    <ArrowRight className="w-5 h-5 group-hover/order:translate-x-1 transition-transform" />
                  </motion.button>
                  <div className="flex items-center justify-center gap-4 opacity-40">
                    <div className="h-px flex-1 bg-black/10" />
                    <p className="text-[9px] uppercase tracking-widest font-bold">Paiement à la livraison</p>
                    <div className="h-px flex-1 bg-black/10" />
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Flying Animation Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <AnimatePresence>
          {flyingItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ 
                x: item.x - 24, 
                y: item.y - 24, 
                scale: 1, 
                opacity: 1,
                rotate: 0 
              }}
              animate={{ 
                x: window.innerWidth - 60, 
                y: 40, 
                scale: 0.1, 
                opacity: 0,
                rotate: 720 
              }}
              transition={{ 
                duration: 0.8, 
                ease: [0.4, 0, 0.2, 1] 
              }}
              className="fixed w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-2xl bg-white"
            >
              <img src={item.image} alt="flying product" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
