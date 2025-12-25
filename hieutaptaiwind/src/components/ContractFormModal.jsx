import { useState, useEffect } from 'react';

const ContractFormModal = ({ contract, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    user: '',
    product: '',
    premium: '',
    contractNumber: '',
    startDate: '',
    status: 'Chờ thanh toán',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (contract) {
      setFormData({
        user: contract.user?._id || '',
        product: contract.product?._id || '',
        premium: contract.premium || '',
        contractNumber: contract.contractNumber || '',
        status: contract.status || 'Chờ thanh toán',
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
      });
    }

    // Fetch users and products for dropdowns
    const fetchDataForSelects = async () => {
      const token = localStorage.getItem('hieushop-token');
      const [usersRes, productsRes] = await Promise.all([
        fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    };
    fetchDataForSelects();
  }, [contract]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/contracts/${contract._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = ['Chờ thanh toán', 'Hiệu lực', 'Hết hạn'];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit} className="p-8">
          <h2 className="text-2xl font-bold mb-6">Sửa hợp đồng</h2>
          {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Số hợp đồng</label>
              <input type="text" name="contractNumber" value={formData.contractNumber} onChange={handleChange} className="p-2 border rounded w-full mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Khách hàng</label>
              <select name="user" value={formData.user} onChange={handleChange} className="p-2 border rounded w-full mt-1 bg-white">
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Sản phẩm</label>
              <select name="product" value={formData.product} onChange={handleChange} className="p-2 border rounded w-full mt-1 bg-white">
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Phí bảo hiểm (năm)</label>
              <input type="number" name="premium" value={formData.premium} onChange={handleChange} className="p-2 border rounded w-full mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded w-full mt-1 bg-white">
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Ngày hiệu lực</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="p-2 border rounded w-full mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Ngày hết hạn</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="p-2 border rounded w-full mt-1" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 font-semibold">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold disabled:bg-purple-300">
              {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractFormModal;