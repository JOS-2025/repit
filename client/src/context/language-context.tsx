import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation keys and values
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Browse Products',
    'nav.orders': 'Track Orders',
    'nav.help': 'Help',
    'nav.terms': 'Terms',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.farmerDashboard': 'Farmer Dashboard',
    'nav.becomeFarmer': 'Become a Farmer',
    
    // Cart & Shopping
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyDesc': 'Add some fresh produce to get started!',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.addToCart': 'Add to Cart',
    'cart.quantity': 'Quantity',
    'cart.remove': 'Remove',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.orderSummary': 'Order Summary',
    'checkout.deliveryInfo': 'Delivery Information',
    'checkout.deliveryAddress': 'Delivery Address',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.mpesa': 'M-Pesa',
    'checkout.mpesaDesc': 'Pay with your mobile money',
    'checkout.cod': 'Cash on Delivery',
    'checkout.codDesc': 'Pay when you receive your order',
    'checkout.phoneNumber': 'M-Pesa Phone Number',
    'checkout.placeOrder': 'Place Order',
    'checkout.processingOrder': 'Processing Order...',
    'checkout.subtotal': 'Subtotal',
    'checkout.deliveryFee': 'Delivery Fee',
    'checkout.free': 'FREE',
    
    // Products
    'products.freshProduce': 'Fresh Produce',
    'products.fromFarm': 'Fresh from the farm to your table',
    'products.search': 'Search for fresh produce...',
    'products.noResults': 'No products found',
    'products.noResultsDesc': 'Try adjusting your search or browse all products',
    'products.price': 'Price',
    'products.per': 'per',
    'products.available': 'Available',
    'products.farmer': 'Farmer',
    'products.category': 'Category',
    
    // Categories
    'category.fruits': 'Fruits',
    'category.vegetables': 'Vegetables',
    'category.grains': 'Grains',
    'category.dairy': 'Dairy',
    'category.herbs': 'Herbs',
    'category.others': 'Others',
    
    // Units
    'unit.kg': 'kg',
    'unit.piece': 'piece',
    'unit.bunch': 'bunch',
    'unit.bag': 'bag',
    'unit.liter': 'liter',
    
    // Order Status
    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.harvested': 'Harvested',
    'status.inTransit': 'In Transit',
    'status.delivered': 'Delivered',
    'status.cancelled': 'Cancelled',
    
    // Chat & Support
    'chat.support': 'Chat Support',
    'chat.getHelp': 'Get Help & Support',
    'chat.messages': 'Messages',
    'chat.noConversations': 'No conversations yet',
    'chat.startChat': 'Start a chat to get help!',
    'chat.typeMessage': 'Type your message...',
    'chat.send': 'Send',
    'chat.supportTeam': 'Support Team',
    'chat.online': 'Online',
    'chat.weAreHere': 'We\'re here to help!',
    
    // Common Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.sort': 'Sort',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.continue': 'Continue',
    'action.submit': 'Submit',
    'action.loading': 'Loading...',
    
    // Time & Date
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.thisWeek': 'This week',
    'time.thisMonth': 'This month',
    'time.hoursLeft': 'hours left',
    'time.daysLeft': 'days left',
    
    // Messages & Notifications
    'msg.orderPlaced': 'Order placed successfully!',
    'msg.orderFailed': 'Failed to place order',
    'msg.addedToCart': 'Added to cart!',
    'msg.removedFromCart': 'Removed from cart',
    'msg.loginRequired': 'Please sign in to continue',
    'msg.accessDenied': 'Access denied',
    'msg.unauthorized': 'You are logged out. Logging in again...',
    
    // Language
    'lang.english': 'English',
    'lang.swahili': 'Kiswahili',
    'lang.changeLanguage': 'Change Language',
  },
  
  sw: {
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.products': 'Viunga Mazao',
    'nav.orders': 'Fuatilia Maagizo',
    'nav.help': 'Msaada',
    'nav.terms': 'Masharti',
    'nav.login': 'Ingia',
    'nav.logout': 'Toka',
    'nav.farmerDashboard': 'Dashibodi ya Mkulima',
    'nav.becomeFarmer': 'Kuwa Mkulima',
    
    // Cart & Shopping
    'cart.title': 'Kikapu cha Ununuzi',
    'cart.empty': 'Kikapu chako ni tupu',
    'cart.emptyDesc': 'Ongeza mazao mapya ili kuanza!',
    'cart.total': 'Jumla',
    'cart.checkout': 'Endelea na Malipo',
    'cart.addToCart': 'Ongeza Kikkapuni',
    'cart.quantity': 'Idadi',
    'cart.remove': 'Ondoa',
    
    // Checkout
    'checkout.title': 'Malipo',
    'checkout.orderSummary': 'Muhtasari wa Agizo',
    'checkout.deliveryInfo': 'Maelezo ya Uwasilishaji',
    'checkout.deliveryAddress': 'Anwani ya Uwasilishaji',
    'checkout.paymentMethod': 'Njia ya Malipo',
    'checkout.mpesa': 'M-Pesa',
    'checkout.mpesaDesc': 'Lipa kwa pesa za simu yako',
    'checkout.cod': 'Lipa Wakati wa Kupokea',
    'checkout.codDesc': 'Lipa unapopokea agizo lako',
    'checkout.phoneNumber': 'Nambari ya Simu ya M-Pesa',
    'checkout.placeOrder': 'Weka Agizo',
    'checkout.processingOrder': 'Inasindika Agizo...',
    'checkout.subtotal': 'Jumla ndogo',
    'checkout.deliveryFee': 'Ada ya Uwasilishaji',
    'checkout.free': 'BURE',
    
    // Products
    'products.freshProduce': 'Mazao Mapya',
    'products.fromFarm': 'Mapya kutoka shambani hadi mezani kwako',
    'products.search': 'Tafuta mazao mapya...',
    'products.noResults': 'Hakuna mazao yaliyopatikana',
    'products.noResultsDesc': 'Jaribu kubadilisha utafutaji wako au tembelea mazao yote',
    'products.price': 'Bei',
    'products.per': 'kwa',
    'products.available': 'Yapatikana',
    'products.farmer': 'Mkulima',
    'products.category': 'Aina',
    
    // Categories
    'category.fruits': 'Matunda',
    'category.vegetables': 'Mboga',
    'category.grains': 'Nafaka',
    'category.dairy': 'Mazao ya Ng\'ombe',
    'category.herbs': 'Viungo',
    'category.others': 'Mengineyo',
    
    // Units
    'unit.kg': 'kg',
    'unit.piece': 'kipande',
    'unit.bunch': 'fungu',
    'unit.bag': 'mfuko',
    'unit.liter': 'lita',
    
    // Order Status
    'status.pending': 'Inasubiri',
    'status.confirmed': 'Imethibitishwa',
    'status.harvested': 'Imevunwa',
    'status.inTransit': 'Iko Njiani',
    'status.delivered': 'Imewasilishwa',
    'status.cancelled': 'Imeghairiwa',
    
    // Chat & Support
    'chat.support': 'Mazungumzo ya Msaada',
    'chat.getHelp': 'Pata Msaada na Uongozi',
    'chat.messages': 'Ujumbe',
    'chat.noConversations': 'Hakuna mazungumzo bado',
    'chat.startChat': 'Anza mazungumzo kupata msaada!',
    'chat.typeMessage': 'Andika ujumbe wako...',
    'chat.send': 'Tuma',
    'chat.supportTeam': 'Timu ya Msaada',
    'chat.online': 'Mtandaoni',
    'chat.weAreHere': 'Tuko hapa kukusaidia!',
    
    // Common Actions
    'action.save': 'Hifadhi',
    'action.cancel': 'Ghairi',
    'action.edit': 'Hariri',
    'action.delete': 'Futa',
    'action.search': 'Tafuta',
    'action.filter': 'Chuja',
    'action.sort': 'Panga',
    'action.back': 'Nyuma',
    'action.next': 'Ifuatayo',
    'action.continue': 'Endelea',
    'action.submit': 'Wasilisha',
    'action.loading': 'Inapakia...',
    
    // Time & Date
    'time.today': 'Leo',
    'time.yesterday': 'Jana',
    'time.thisWeek': 'Wiki hii',
    'time.thisMonth': 'Mwezi huu',
    'time.hoursLeft': 'masaa yaliyobaki',
    'time.daysLeft': 'siku zilizobaki',
    
    // Messages & Notifications
    'msg.orderPlaced': 'Agizo limewekwa kwa mafanikio!',
    'msg.orderFailed': 'Imeshindwa kuweka agizo',
    'msg.addedToCart': 'Imeongezwa kikkapuni!',
    'msg.removedFromCart': 'Imeondolewa kikkapuni',
    'msg.loginRequired': 'Tafadhali ingia ili kuendelea',
    'msg.accessDenied': 'Ruhusa imekataliwa',
    'msg.unauthorized': 'Umetoka nje. Unaingia tena...',
    
    // Language
    'lang.english': 'Kiingereza',
    'lang.swahili': 'Kiswahili',
    'lang.changeLanguage': 'Badilisha Lugha',
  },
};

type Language = 'en' | 'sw';
type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('framcart_language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sw')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('framcart_language', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for formatting numbers with language-specific formatting
export function useNumberFormat() {
  const { language } = useLanguage();
  
  return {
    formatCurrency: (amount: number) => {
      return language === 'sw' 
        ? `Ksh ${amount.toLocaleString('sw-KE')}` 
        : `KSh ${amount.toLocaleString('en-KE')}`;
    },
    formatNumber: (num: number) => {
      return language === 'sw' 
        ? num.toLocaleString('sw-KE') 
        : num.toLocaleString('en-KE');
    },
  };
}