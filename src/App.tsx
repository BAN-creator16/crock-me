/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
  Leaf
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
}

const WHATSAPP_NUMBER = "+22890684410";
const LOGO_URL = "https://image2url.com/r2/default/images/1772985200007-06a69fb4-0bb8-4c78-9a3c-43188cb501d7.jpeg";

const INITIAL_DISHES: Dish[] = [
  {
    id: '1',
    name: 'Croque Madame',
    description: 'Pain de mie toasté, jambon, fromage fondu, surmonté d\'un œuf au plat.',
    price: '1.500 FCFA',
    numericPrice: 1500,
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
  }
];

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [dishes] = useState<Dish[]>(INITIAL_DISHES);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [selectedSupplements, setSelectedSupplements] = useState<Record<string, string[]>>({});

  const categories = ['Tous', 'Croque', 'Crêpes', 'Hot Dog', 'Spécial', 'Boisson'];

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

  const orderOnWhatsApp = (dish: Dish) => {
    const supplements = selectedSupplements[dish.id] || [];
    const supplementText = supplements.length > 0 
      ? ` avec suppléments : ${supplements.join(', ')}` 
      : '';
    
    const totalPrice = dish.numericPrice + (supplements.length * 500);
    
    const message = `Bonjour CROK-ME ! Je souhaiterais commander : ${dish.name}${supplementText}. Total : ${totalPrice.toLocaleString()} FCFA.`;
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
            initial={{ scale: 0.8, opacity: 0 }}
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
              className="group relative inline-flex items-center gap-3 px-8 py-3 sm:px-10 sm:py-4 bg-white text-[#4A2C1D] rounded-full font-bold text-base sm:text-lg shadow-xl hover:bg-gray-100 transition-all"
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E8DED1] px-4 sm:px-6 py-3 sm:py-4">
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
        </div>
      </header>

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
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl md:text-6xl font-serif text-[#FDFCFB] mb-4 italic"
          >
            Croque - Savoure - Recommence
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
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
                    <span className="text-sm font-serif italic text-[#4A2C1D] font-bold">
                      {(dish.numericPrice + ((selectedSupplements[dish.id]?.length || 0) * 500)).toLocaleString()} FCFA
                    </span>
                  </div>
                  <p className="text-sm text-[#2D1B12]/70 mb-4 line-clamp-2 font-light leading-relaxed">
                    {dish.description}
                  </p>

                  {/* Supplements Section */}
                  {dish.hasSupplements && (
                    <div className="mb-6 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Suppléments (+500 FCFA)</p>
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
                    onClick={() => orderOnWhatsApp(dish)}
                    className="btn-primary w-full group/btn"
                  >
                    <MessageCircle className="w-4 h-4" />
                    COMMANDER
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
