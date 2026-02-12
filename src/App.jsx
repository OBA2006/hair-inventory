import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingBag, Save, Trash2, CheckCircle, Package } from 'lucide-react';

const PRESET_IMAGES = [
  { id: 1, url: "https://static.wixstatic.com/media/0ca73d_e88b1f7a87ae4334903aa79cdc821413~mv2.jpg/v1/fill/w_317,h_475,al_c,q_85,usm_0.66_1.00_0.01/0ca73d_e88b1f7a87ae4334903aa79cdc821413~mv2.jpg" },
  { id: 2, url: "https://static.wixstatic.com/media/0ca73d_f3a218ba1c8341d9b88a1564405d52a5~mv2.jpg/v1/fill/w_317,h_475,al_c,q_85,usm_0.66_1.00_0.01/0ca73d_f3a218ba1c8341d9b88a1564405d52a5~mv2.jpg" },
  { id: 3, url: "https://static.wixstatic.com/media/0ca73d_0bcb8bc294a3491e98d1cc02ee7ef383~mv2.jpg/v1/fill/w_317,h_475,al_c,q_85,usm_0.66_1.00_0.01/0ca73d_0bcb8bc294a3491e98d1cc02ee7ef383~mv2.jpg" },
  { id: 4, url: "https://static.wixstatic.com/media/0ca73d_50c48bbad0604026adbb8ad2113e96ea~mv2.jpg/v1/fill/w_634,h_950,al_c,q_85,usm_0.66_1.00_0.01/0ca73d_50c48bbad0604026adbb8ad2113e96ea~mv2.jpg" },
  { id: 5, url: "https://static.wixstatic.com/media/0ca73d_34b3cddf47104ba69baf86e95435ba30~mv2.jpg/v1/fill/w_317,h_475,al_c,q_85,usm_0.66_1.00_0.01/0ca73d_34b3cddf47104ba69baf86e95435ba30~mv2.jpg" }
];

const AVAILABLE_LENGTHS = ["10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30"];

export default function HairInventory() {
  const [inventory, setInventory] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLengths, setSelectedLengths] = useState([]);
  const [pricingData, setPricingData] = useState({});

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Fetch Error:", error);
    if (data) setInventory(data);
  };

  const saveToInventory = async () => {
    // 1. Validation Check: Stop if data is missing
    if (!selectedImg) return alert("Please select an image first!");
    if (!productName.trim()) return alert("Please enter a hair name!");
    if (selectedLengths.length === 0) return alert("Please choose at least one length!");

    // 2. Map the data specifically
    const itemsToSave = selectedLengths.map(len => {
      const priceValue = parseFloat(pricingData[len]?.price) || 0;
      const qtyValue = parseInt(pricingData[len]?.qty) || 0;

      return {
        type: productName,         // Maps to 'type' column
        image_url: selectedImg,    // Maps to 'image_url' column
        description: description,  // Maps to 'description' column
        length: len,               // Maps to 'length' column
        price: priceValue,
        quantity: qtyValue
      };
    });

    console.log("Sending to Supabase:", itemsToSave); // Check your console (F12) to see this!

    // 3. Insert into Supabase
    const { data, error } = await supabase
      .from('bundles')
      .insert(itemsToSave);
    
    if (error) {
      console.error("Supabase Error:", error);
      alert("Error: " + error.message);
    } else {
      // 4. Success! Clear the form
      setProductName('');
      setDescription('');
      setSelectedImg(null);
      setSelectedLengths([]);
      setPricingData({});
      fetchInventory(); // Refresh the table
      alert("Inventory Updated Successfully!");
    }
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from('bundles').delete().eq('id', id);
    if (!error) fetchInventory();
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
        
        {/* ENTRY PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-serif mb-6 uppercase tracking-widest border-b pb-4 text-[#c5a059]">Product Entry</h2>
            
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">1. Select Product Image</label>
            <div className="grid grid-cols-5 gap-3 mb-8">
              {PRESET_IMAGES.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setSelectedImg(img.url)}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${selectedImg === img.url ? 'border-[#c5a059] scale-105 shadow-md' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={img.url} className="w-full h-full object-cover" alt="Hair" />
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2. Hair Name</label>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Raw Vietnamese" className="w-full p-3 mt-1 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:border-black" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3. Description</label>
                <textarea 
                   value={description} 
                   onChange={(e) => setDescription(e.target.value)} 
                   placeholder="Enter details here..." 
                   className="w-full p-3 mt-1 bg-gray-50 rounded-xl outline-none border border-gray-100 h-24" 
                />
              </div>
            </div>

            <div className="mt-8">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">4. Choose Lengths</label>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_LENGTHS.map(len => (
                  <button key={len} onClick={() => setSelectedLengths(prev => prev.includes(len) ? prev.filter(l => l !== len) : [...prev, len])}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${selectedLengths.includes(len) ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                    {len}"
                  </button>
                ))}
              </div>
            </div>

            {selectedLengths.length > 0 && (
              <div className="mt-8 space-y-4">
                {selectedLengths.map(len => (
                  <div key={len} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="font-bold text-xs w-8">{len}"</span>
                    <input type="number" placeholder="Price" className="flex-1 p-2 bg-white rounded-lg text-sm outline-none border border-gray-200" onChange={(e) => setPricingData(prev => ({...prev, [len]: {...prev[len], price: e.target.value}}))} />
                    <input type="number" placeholder="Qty" className="w-16 p-2 bg-white rounded-lg text-sm outline-none border border-gray-200" onChange={(e) => setPricingData(prev => ({...prev, [len]: {...prev[len], qty: e.target.value}}))} />
                  </div>
                ))}
                <button onClick={saveToInventory} className="w-full bg-[#c5a059] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg">
                  Save to Inventory
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT PANEL (TABLE) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Live Stock</h2>
              <span className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase tracking-widest">
                <CheckCircle size={12} /> Database Connected
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                <tr>
                  <th className="p-6">Product & Description</th>
                  <th className="p-6 text-center">Size</th>
                  <th className="p-6">Price</th>
                  <th className="p-6 text-center">Stock</th>
                  {/* <th className="p-6">  Description</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventory.length === 0 ? (
                  <tr><td colSpan="5" className="p-20 text-center text-gray-300 italic">Inventory is empty.</td></tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fafafa] transition-all">
                      <td className="p-6">
                        <div className="flex items-start gap-4">
                          <img src={item.image_url} className="w-14 h-20 rounded-lg object-cover shadow-sm border flex-shrink-0" alt="" />
                          <div className="flex flex-col min-w-0">
                            <p className="text-xs font-bold uppercase tracking-tight text-gray-900 mb-1">{item.type}</p>
                            {/* Force visible description block */}
                            <p className="text-[11px] text-gray-600 leading-relaxed italic block break-words">
                              {item.description || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-sm font-medium text-center">{item.length}"</td>
                      <td className="p-6 text-sm font-bold text-[#c5a059]">${item.price}</td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${item.quantity > 3 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {item.quantity} UNIT
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => deleteItem(item.id)} className="text-gray-200 hover:text-red-500 transition-colors">
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
  );
}