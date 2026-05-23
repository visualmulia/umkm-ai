import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

export default function ProductsPage() {
  const { data: products, isLoading } = trpc.product.list.useQuery();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '', price: '', description: '', stock: 0, category: '', imageUrl: '',
  });

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => { utils.product.list.invalidate(); setShowAdd(false); resetForm(); },
  });
  const updateProduct = trpc.product.update.useMutation({
    onSuccess: () => { utils.product.list.invalidate(); setEditing(null); resetForm(); },
  });
  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: () => utils.product.list.invalidate(),
  });

  function resetForm() {
    setForm({ name: '', price: '', description: '', stock: 0, category: '', imageUrl: '' });
  }

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Produk</h1>
          <p className="text-sm" style={{ color: '#5c5c5c' }}>Kelola produk bisnismu</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5c5c5c' }} />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
          style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'white' }}
        />
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-[#d4754a] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-16 card">
          <Package className="w-14 h-14 mx-auto mb-4" style={{ color: '#d4a853', opacity: 0.4 }} />
          <p className="text-lg font-medium" style={{ color: '#1a1a1a' }}>Belum ada produk</p>
          <p className="text-sm mt-1" style={{ color: '#5c5c5c' }}>Tambah produk pertama-mu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((product) => (
            <div key={product.id} className="card card-hover relative group">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              ) : (
                <div className="w-full h-40 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#f0ece3' }}>
                  <Package className="w-10 h-10" style={{ color: '#d4a853', opacity: 0.5 }} />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#1a1a1a' }}>{product.name}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#d4754a' }}>
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </p>
                  {product.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: '#f0ece3', color: '#5c5c5c' }}>
                      {product.category}
                    </span>
                  )}
                  <p className="text-xs mt-1" style={{ color: '#5c5c5c' }}>Stok: {product.stock}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditing(product.id); setForm({ name: product.name, price: product.price || '', description: product.description || '', stock: product.stock || 0, category: product.category || '', imageUrl: product.imageUrl || '' }); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#f0ece3' }}
                  >
                    <Pencil className="w-3.5 h-3.5" style={{ color: '#5c5c5c' }} />
                  </button>
                  <button
                    onClick={() => { if (confirm('Hapus produk ini?')) deleteProduct.mutate({ id: product.id }); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#fee2e2' }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd || editing !== null) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {editing !== null ? 'Edit Produk' : 'Tambah Produk'}
              </h2>
              <button onClick={() => { setShowAdd(false); setEditing(null); resetForm(); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Nama Produk</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Harga</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="100000"
                    className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
                    style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Stok</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
                    style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Kategori</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Makanan, Fashion"
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                />
              </div>
              <button
                onClick={() => {
                  if (!form.name) return;
                  if (editing !== null) {
                    updateProduct.mutate({ id: editing, ...form });
                  } else {
                    createProduct.mutate(form);
                  }
                }}
                className="btn-primary w-full mt-2"
              >
                {editing !== null ? 'Simpan Perubahan' : 'Tambah Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
