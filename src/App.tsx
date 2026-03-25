/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  Calculator, 
  Clock,
  ArrowRightLeft,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface MarketItem {
  urun: string;
  alis: string;
  satis: string;
  fark: string;
  alis_trend: 'up' | 'down' | 'neutral';
  satis_trend: 'up' | 'down' | 'neutral';
  genel_trend: 'up' | 'down' | 'neutral';
  type: string;
}

interface DarphaneItem {
  urun: string;
  yeni_alis: string;
  yeni_satis: string;
  eski_alis: string;
  eski_satis: string;
  y_alis_trend: string;
  y_satis_trend: string;
  e_alis_trend: string;
  e_satis_trend: string;
}

interface MarketData {
  altin: MarketItem[];
  sarrafiye: MarketItem[];
  doviz: MarketItem[];
  capraz: MarketItem[];
  darphane: DarphaneItem[];
  guncelleme: string;
}

// --- Constants & Utils ---

const LOGO_URL = "https://www.topaloglualtin.com/assets/topaloglu-logo.svg";
const API_URL = "https://topalogdata.com/api/all";

const parseTurkishNumber = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(/\./g, '').replace(',', '.'));
};

const formatTurkishNumber = (num: number, decimals: number = 2) => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// --- Components ---

const TrendIndicator = ({ value, trend }: { value: string, trend: string }) => {
  const numValue = parseTurkishNumber(value);
  const isPositive = numValue >= 0;
  const isNeutral = numValue === 0;

  return (
    <div className={`flex items-center justify-end gap-0.5 md:gap-1 text-[11px] md:text-[13px] font-medium ${isNeutral ? 'text-slate-400' : isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
      {trend === 'up' ? <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" /> : trend === 'down' ? <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />}
      <span>%{value}</span>
    </div>
  );
};

const FlashRow = ({ children, value }: { children: React.ReactNode, value: string, key?: string | number }) => {
  const [flash, setFlash] = useState<'none' | 'up' | 'down'>('none');
  const prevValue = React.useRef(value);

  React.useEffect(() => {
    if (prevValue.current !== value) {
      // Split the combined values (e.g., "alis-satis")
      const prevParts = prevValue.current.split('-').map(parseTurkishNumber);
      const currParts = value.split('-').map(parseTurkishNumber);
      
      // Determine trend: if any value increased, it's an 'up' flash. 
      // If none increased but at least one decreased, it's a 'down' flash.
      const hasIncrease = currParts.some((v, i) => v > prevParts[i]);
      const hasDecrease = currParts.some((v, i) => v < prevParts[i]);
      
      if (hasIncrease) {
        setFlash('up');
      } else if (hasDecrease) {
        setFlash('down');
      }
      
      const timer = setTimeout(() => setFlash('none'), 1500);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <motion.tr
      animate={{
        backgroundColor: flash === 'up' ? 'rgba(16, 185, 129, 0.25)' : flash === 'down' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
      }}
      transition={{ duration: 0.5 }}
      className="hover:bg-slate-800/20 transition-all duration-300 group"
    >
      {children}
    </motion.tr>
  );
};

const MarketTable = ({ title, items, columns = ['CİNS', 'ALIŞ', 'SATIŞ', 'ORAN'] }: { title: string, items: MarketItem[], columns?: string[] }) => {
  return (
    <div className="relative pt-6 h-full">
      {/* Category Header Badge - Overlapping the border as in screenshot */}
      <div className="absolute top-6 left-6 md:left-10 z-10 -translate-y-1/2">
        <div className="bg-[#c2983d] text-slate-950 px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-black text-[10px] md:text-[12px] tracking-widest uppercase shadow-[0_0_20px_rgba(194,152,61,0.3)]">
          {title}
        </div>
      </div>
      
      {/* Table Container with Gold Border */}
      <div className="bg-[#0f172a] border border-[#c2983d]/40 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl p-2 md:p-8 pt-12 md:pt-14 flex flex-col h-[450px] md:h-[500px]">
        <div className="overflow-y-auto overflow-x-auto custom-scrollbar pr-1 md:pr-2">
          <table className="w-full text-left border-collapse min-w-[280px] md:min-w-full">
            <thead className="sticky top-0 bg-[#0f172a] z-20">
              <tr className="border-b border-slate-800/40">
                {columns.map((col, idx) => (
                  <th key={col} className={`pb-3 md:pb-4 px-0.5 md:px-2 text-[10px] md:text-[11px] font-black text-[#c2983d] tracking-widest ${idx !== 0 ? 'text-right' : ''}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/20">
              {items.map((item) => (
                <FlashRow key={item.urun} value={`${item.alis}-${item.satis}`}>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2">
                    <span className="text-[11px] md:text-[13px] font-bold text-slate-300 group-hover:text-[#c2983d] transition-colors uppercase whitespace-nowrap">
                      {item.urun}
                    </span>
                  </td>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2 text-right">
                    <span className="text-[11px] md:text-[14px] font-mono font-bold text-slate-100 whitespace-nowrap">
                      {item.alis}
                    </span>
                  </td>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2 text-right">
                    <span className="text-[11px] md:text-[14px] font-mono font-bold text-slate-100 whitespace-nowrap">
                      {item.satis}
                    </span>
                  </td>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2 text-right">
                    <TrendIndicator value={item.fark} trend={item.genel_trend} />
                  </td>
                </FlashRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DarphaneTable = ({ title, items }: { title: string, items: DarphaneItem[] }) => {
  return (
    <div className="relative pt-6 h-full">
      <div className="absolute top-6 left-6 md:left-10 z-10 -translate-y-1/2">
        <div className="bg-[#c2983d] text-slate-950 px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-black text-[10px] md:text-[12px] tracking-widest uppercase shadow-[0_0_20px_rgba(194,152,61,0.3)]">
          {title}
        </div>
      </div>
      
      <div className="bg-[#0f172a] border border-[#c2983d]/40 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl p-2 md:p-8 pt-12 md:pt-14 flex flex-col h-[450px] md:h-[500px]">
        <div className="overflow-y-auto overflow-x-auto custom-scrollbar pr-1 md:pr-2">
          <table className="w-full text-left border-collapse min-w-[400px] md:min-w-full">
            <thead className="sticky top-0 bg-[#0f172a] z-20">
              <tr className="border-b border-slate-800/40">
                <th className="pb-3 md:pb-4 px-0.5 md:px-2 text-[10px] md:text-[11px] font-black text-[#c2983d] tracking-widest">CİNS</th>
                <th className="pb-3 md:pb-4 px-0.5 md:px-2 text-[10px] md:text-[11px] font-black text-[#c2983d] tracking-widest text-right">
                  <span className="hidden md:inline">YENİ ALIŞ</span>
                  <span className="md:hidden">Y. ALIŞ</span>
                </th>
                <th className="pb-3 md:pb-4 px-0.5 md:px-2 text-[10px] md:text-[11px] font-black text-[#c2983d] tracking-widest text-right">
                  <span className="hidden md:inline">YENİ SATIŞ</span>
                  <span className="md:hidden">Y. SATIŞ</span>
                </th>
                <th className="pb-3 md:pb-4 px-0.5 md:px-2 text-[10px] md:text-[11px] font-black text-[#c2983d] tracking-widest text-right">
                  <span className="hidden md:inline">ESKİ ALIŞ</span>
                  <span className="md:hidden">E. ALIŞ</span>
                </th>
                <th className="pb-3 md:pb-4 px-0.5 md:px-2 text-[10px] md:text-[11px] font-black text-[#c2983d] tracking-widest text-right">
                  <span className="hidden md:inline">ESKİ SATIŞ</span>
                  <span className="md:hidden">E. SATIŞ</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/20">
              {items.map((item) => (
                <FlashRow key={item.urun} value={`${item.yeni_alis}-${item.yeni_satis}-${item.eski_alis}-${item.eski_satis}`}>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2">
                    <span className="text-[11px] md:text-[13px] font-bold text-slate-300 group-hover:text-[#c2983d] transition-colors uppercase whitespace-nowrap">
                      {item.urun}
                    </span>
                  </td>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2 text-right">
                    <span className="text-[11px] md:text-[14px] font-mono font-bold text-slate-100 whitespace-nowrap">{item.yeni_alis}</span>
                  </td>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2 text-right">
                    <span className="text-[11px] md:text-[14px] font-mono font-bold text-slate-100 whitespace-nowrap">{item.yeni_satis}</span>
                  </td>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2 text-right">
                    <span className="text-[11px] md:text-[14px] font-mono font-bold text-slate-100 whitespace-nowrap">{item.eski_alis}</span>
                  </td>
                  <td className="py-2.5 md:py-3 px-0.5 md:px-2 text-right">
                    <span className="text-[11px] md:text-[14px] font-mono font-bold text-slate-100 whitespace-nowrap">{item.eski_satis}</span>
                  </td>
                </FlashRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Converter State
  const [amount, setAmount] = useState<number>(1);
  const [fromAsset, setFromAsset] = useState<string>('GRAM ALTIN');
  const [toAsset, setToAsset] = useState<string>('TÜRK LİRASI (TL)');
  const [transactionType, setTransactionType] = useState<'alis' | 'satis'>('satis');
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      if (prev + 1 >= 5) {
        // Simple hidden admin redirect or alert
        window.location.href = '/admin'; // or any admin path
        return 0;
      }
      return prev + 1;
    });
    // Reset click counter after 2 seconds of inactivity
    setTimeout(() => setLogoClicks(0), 2000);
  };

  const fetchData = async () => {
    try {
      // Adding timestamp to bypass potential CDN/Server caching
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('API hatası');
      const json = await response.json();
      setData(json);
      setLastFetch(new Date());
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Veriler güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const processedAltin = useMemo(() => {
    if (!data) return [];
    
    // Custom order: ONS, USD/KG, EUR/KG, HAS ALTIN, GRAM ALTIN
    const customOrder = ["ONS", "USD/KG", "EUR/KG", "HAS ALTIN", "GRAM ALTIN"];
    
    const sorted = [...data.altin].sort((a, b) => {
      const indexA = customOrder.indexOf(a.urun);
      const indexB = customOrder.indexOf(b.urun);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });

    return sorted;
  }, [data]);

  const processedDoviz = useMemo(() => {
    if (!data) return [];
    
    const eurUsd = data.capraz.find(i => i.urun === "EUR/USD");
    const dovizItems = [...data.doviz];
    
    if (eurUsd) {
      // Add EUR/USD after EUR/TL (second item usually)
      const eurTlIndex = dovizItems.findIndex(i => i.urun === "EUR/TL");
      if (eurTlIndex !== -1) {
        dovizItems.splice(eurTlIndex + 1, 0, { ...eurUsd, type: 'doviz' });
      } else {
        dovizItems.unshift({ ...eurUsd, type: 'doviz' });
      }
    }
    
    return dovizItems;
  }, [data]);

  const allAssets = useMemo(() => {
    if (!data) return [];
    const tlItem: MarketItem = {
      urun: 'TÜRK LİRASI (TL)',
      alis: '1,00',
      satis: '1,00',
      fark: '0',
      alis_trend: 'neutral',
      satis_trend: 'neutral',
      genel_trend: 'neutral',
      type: 'currency'
    };
    return [tlItem, ...processedAltin, ...data.sarrafiye, ...processedDoviz];
  }, [data, processedAltin, processedDoviz]);

  const convertedValue = useMemo(() => {
    if (!data || allAssets.length === 0) return 0;
    const from = allAssets.find(a => a.urun === fromAsset);
    const to = allAssets.find(a => a.urun === toAsset);
    if (!from || !to) return 0;
    if (fromAsset === toAsset) return amount;

    // Calculation based on selected transaction type
    const fromPrice = parseTurkishNumber(transactionType === 'alis' ? from.alis : from.satis);
    const totalTL = amount * fromPrice;
    
    const toPrice = parseTurkishNumber(transactionType === 'alis' ? to.alis : to.satis);
    if (toPrice === 0) return 0;
    
    return totalTL / toPrice;
  }, [amount, fromAsset, toAsset, allAssets, data, transactionType]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      {/* Navigation Bar - Matches Screenshot */}
      <nav className="bg-[#0b0f19] border-b border-slate-800/40 px-2 md:px-8 py-3 md:py-6 sticky top-0 z-50 backdrop-blur-xl bg-opacity-95">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="hidden md:block w-32" /> {/* Spacer for balance */}
          <div className="flex items-center cursor-pointer select-none" onClick={handleLogoClick}>
            <img src={LOGO_URL} alt="Topaloğlu Altın" className="h-8 md:h-16" referrerPolicy="no-referrer" />
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[7px] md:text-[10px] font-black tracking-widest text-slate-500 uppercase">SON GÜNCELLEME</span>
              <span className="text-[9px] md:text-[12px] font-mono font-bold text-slate-300">{lastFetch.toLocaleTimeString('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-3 bg-slate-900/50 border border-slate-800 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full">
              <div className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[8px] md:text-[10px] font-black tracking-[0.1em] md:tracking-[0.2em] text-emerald-500 uppercase">CANLI</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-2 md:p-8 space-y-6 md:space-y-12">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-12 items-start">
          {/* Row 1 */}
          <MarketTable title="ALTIN FİYATLARI" items={processedAltin} />
          <MarketTable title="DÖVİZ KURLARI" items={processedDoviz} />
          
          {/* Row 2 */}
          <MarketTable title="SARRAFİYE" items={data?.sarrafiye || []} />
          <MarketTable title="ÇAPRAZ KURLAR" items={data?.capraz || []} />
          
          {/* Row 3 */}
          <DarphaneTable title="DARPHANE İŞÇİLİK" items={data?.darphane || []} />
        </div>

        {/* Converter Section - Polished */}
        <section className="bg-[#111827] border border-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <Calculator className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">HESAPLAMA ARACI</h2>
              <p className="text-sm text-slate-500 font-bold tracking-wide">Anlık kurlar üzerinden birimler arası çeviri yapın.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8 items-end">
            <div className="space-y-2 md:space-y-3">
              <label className="text-[10px] md:text-[11px] font-black text-slate-500 tracking-[0.2em] uppercase">İŞLEM TİPİ</label>
              <div className="flex bg-[#0b0f19] border border-slate-800 rounded-xl md:rounded-2xl p-1">
                <button 
                  onClick={() => setTransactionType('alis')}
                  className={`flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-black tracking-widest transition-all ${transactionType === 'alis' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  ALIŞ
                </button>
                <button 
                  onClick={() => setTransactionType('satis')}
                  className={`flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-black tracking-widest transition-all ${transactionType === 'satis' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  SATIŞ
                </button>
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              <label className="text-[10px] md:text-[11px] font-black text-slate-500 tracking-[0.2em] uppercase">MİKTAR</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-amber-500 transition-all font-mono text-lg md:text-xl text-slate-100"
              />
            </div>
            <div className="space-y-2 md:space-y-3">
              <label className="text-[10px] md:text-[11px] font-black text-slate-500 tracking-[0.2em] uppercase">NEREDEN</label>
              <div className="relative">
                <select 
                  value={fromAsset}
                  onChange={(e) => setFromAsset(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer font-bold text-slate-300 text-sm md:text-base"
                >
                  {allAssets.map(a => <option key={a.urun} value={a.urun}>{a.urun}</option>)}
                </select>
                <ArrowRightLeft className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              <label className="text-[10px] md:text-[11px] font-black text-slate-500 tracking-[0.2em] uppercase">NEREYE</label>
              <div className="relative">
                <select 
                  value={toAsset}
                  onChange={(e) => setToAsset(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer font-bold text-slate-300 text-sm md:text-base"
                >
                  {allAssets.map(a => <option key={a.urun} value={a.urun}>{a.urun}</option>)}
                </select>
                <ArrowRightLeft className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-center h-[68px] md:h-[76px]">
              <p className="text-[9px] md:text-[10px] font-black text-amber-500/60 tracking-[0.2em] uppercase mb-0.5 md:mb-1">SONUÇ</p>
              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl font-mono font-black text-amber-500">
                  {formatTurkishNumber(convertedValue, 4)}
                </span>
                <span className="text-[10px] md:text-xs text-slate-500 font-black uppercase tracking-widest">{toAsset.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="mt-8 pt-8 border-t border-slate-800/50 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1 GRAM ALTIN KAÇ TL?</span>
              <span className="text-lg font-mono font-bold text-slate-200">
                {processedAltin.find(a => a.urun.includes('GRAM ALTIN'))?.satis} TL
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1000 TL KAÇ GRAM ALTIN?</span>
              <span className="text-lg font-mono font-bold text-slate-200">
                {(() => {
                  const gram = processedAltin.find(a => a.urun.includes('GRAM ALTIN'));
                  if (!gram) return '0.00';
                  return formatTurkishNumber(1000 / parseTurkishNumber(gram.satis), 4);
                })()} GR
              </span>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
