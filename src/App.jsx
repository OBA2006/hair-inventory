import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Make sure this file exists
import { ShoppingBag, Save, Trash2, CheckCircle, Loader2 } from 'lucide-react';

const BUNDLE_TYPES = [
  "Indian Straight", "Indian Straight 2", "Cambodian Body Wave", 
  "Indian Bodywave", "Raw Vietnamese (Straight)"
];

const AVAILABLE_LENGTHS = ["10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30"];

export default function HairInventory() {
  const [selectedType, setSelectedType] = useState(BUNDLE_TYPES[0]);
  const [selectedLengths, setSelectedLengths] = useState([]);
  const [pricingData, setPricingData] = useState({});
  const [finalInventory, setFinalInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. FETCH DATA FROM DATABASE ON LOAD
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory:', error);
    } else {
      setFinalInventory(data || []);
    }
    setLoading(false);
  };

  // Toggle length selection
  const toggleLength = (len) => {
    if (selectedLengths.includes(len)) {
      setSelectedLengths(selectedLengths.filter(l => l !== len));
    } else {
      setSelectedLengths([...selectedLengths, len]);
      setPricingData(prev => ({ 
        ...prev, 
        [len]: { price: '', qty: '', desc: '' } 
      }));
    }
  };

  const handlePriceChange = (len, field, value) => {
    setPricingData(prev => ({
      ...prev,
      [len]: { ...prev[len], [field]: value }
    }));
  };

  // 2. SAVE MULTIPLE LENGTHS TO DATABASE
  const saveToInventory = async () => {
    if (selectedLengths.length === 0) return;
    setIsSaving(true);

    const newItems = selectedLengths.map(len => ({
      type: selectedType,
      length: len,
      price: parseFloat(pricingData[len].price) || 0,
      quantity: parseInt(pricingData[len].qty) || 0,
      description: pricingData[len].desc || ""
    }));

    const { error } = await supabase.from('bundles').insert(newItems);
    
    if (error) {
      alert("Error saving: " + error.message);
    } else {
      // Clear form and refresh list
      setSelectedLengths([]);
      setPricingData({});
      fetchInventory();
    }
    setIsSaving(false);
  };

  // 3. DELETE ITEM FROM DATABASE
  const deleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from('bundles').delete().eq('id', id);
      if (error) {
        alert("Error deleting: " + error.message);
      } else {
        fetchInventory();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b pb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-tight uppercase">Inventory Manager</h1>
            <p className="text-sm text-gray-500 italic">Premium Hair Collection</p>
          </div>
          <ShoppingBag className="text-gray-400" size={32} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SELECTION PANEL */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">1. Select Hair Type</h2>
              <select 
                className="w-full p-4 bg-gray-50 border-none rounded-md ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {BUNDLE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>

              <h2 className="text-lg font-semibold mt-8 mb-4">2. Choose Available Lengths</h2>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_LENGTHS.map(len => (
                  <button
                    key={len}
                    onClick={() => toggleLength(len)}
                    className={`py-3 rounded-md text-sm font-medium transition-all ${
                      selectedLengths.includes(len) 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {len}"
                  </button>
                ))}
              </div>
            </section>

            {/* DYNAMIC PRICING INPUTS */}
            {selectedLengths.length > 0 && (
              <section className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-semibold mb-4 text-pink-600">3. Set Price & Quantity</h2>
                <div className="space-y-6">
                  {selectedLengths.map(len => (
                    <div key={len} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                      <div className="font-bold mb-3 flex justify-between items-center">
                        <span className="text-lg">Length: {len}"</span>
                        <span className="text-[10px] bg-gray-200 px-2 py-1 rounded uppercase tracking-widest">{selectedType}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Price ($)</label>
                          <input 
                            type="number" placeholder="0.00"
                            className="w-full p-3 bg-white border border-gray-200 rounded-md outline-none focus:border-black"
                            value={pricingData[len]?.price || ''}
                            onChange={(e) => handlePriceChange(len, 'price', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Quantity</label>
                          <input 
                            type="number" placeholder="0"
                            className="w-full p-3 bg-white border border-gray-200 rounded-md outline-none focus:border-black"
                            value={pricingData[len]?.qty || ''}
                            onChange={(e) => handlePriceChange(len, 'qty', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={saveToInventory}
                    disabled={isSaving}
                    className="w-full bg-[#c5a059] text-white py-4 rounded-md font-bold hover:bg-[#b38f4d] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Saving..." : "Update Live Store"}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* DATATABLE */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 uppercase tracking-tight">Live Inventory</h2>
                <span className="text-[10px] text-green-500 flex items-center gap-1 font-bold tracking-widest uppercase">
                  <CheckCircle size={12} /> Database Synced
                </span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Hair Type</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase text-center">Length</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Price</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase text-center">Qty</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="5" className="p-12 text-center text-gray-400">Fetching collection...</td></tr>
                  ) : finalInventory.length === 0 ? (
                    <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">Inventory is currently empty.</td></tr>
                  ) : (
                    finalInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          <div className="text-sm font-bold text-gray-800">{item.type}</div>
                          <div className="text-[10px] text-gray-400">{item.description || 'No description'}</div>
                        </td>
                        <td className="p-4 text-sm text-center font-medium text-gray-600">{item.length}"</td>
                        <td className="p-4 text-sm font-bold text-[#c5a059]">${item.price}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.quantity > 5 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {item.quantity} STK
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}