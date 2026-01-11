import { useState, useEffect } from 'react';
import ProductFormModal from './ProductFormModal';
import Button from './Button';
import { useAuth } from '../pages/AuthContext';
import ConfirmModal from './ConfirmModal';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { user, loading: authLoading, showNotification } = useAuth();

  // Modal xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Lỗi khi tải sản phẩm.');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && ['admin', 'staff'].includes(user?.role)) {
      fetchProducts();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Modal thêm/sửa sản phẩm
  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchProducts();
  };

  // Modal xóa
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/products/${productToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa sản phẩm thất bại.');

      showNotification('Sản phẩm đã được xóa thành công.');
      fetchProducts();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  if (authLoading || loading) return <p>Đang tải dữ liệu sản phẩm...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const categories = ['Tất cả', ...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(p =>
    filterCategory === 'Tất cả' ? true : p.category === filterCategory
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Quản lý Sản phẩm (Bảo hiểm)</h1>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Button variant="slide-purple" size="sm" onClick={() => handleOpenModal()}>
          Thêm sản phẩm mới
        </Button>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteProduct}
        title="Xác nhận xóa sản phẩm"
        confirmText="Xóa vĩnh viễn"
        isConfirming={isDeleting}
      >
        Bạn có chắc chắn muốn xóa sản phẩm <strong>{productToDelete?.name}</strong>? Hành động này không thể hoàn tác.
      </ConfirmModal>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-100">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">Tên sản phẩm</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">Nhà cung cấp</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span>Loại hình</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="sm:ml-2 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none bg-white text-slate-700 shadow-sm cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">Phí (năm)</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id} className="odd:bg-white even:bg-slate-50/50 hover:bg-purple-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-800 whitespace-nowrap">{product.name}</td>
                <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{product.provider}</td>
                <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{product.category}</td>
                <td className="py-4 px-6 text-slate-800 font-medium whitespace-nowrap">{product.price.toLocaleString('vi-VN')} ₫</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button variant="slide" size="sm" onClick={() => handleOpenModal(product)}>Sửa</Button>
                    <Button variant="slide-red" size="sm" onClick={() => openDeleteModal(product)}>Xóa</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductFormModal
          product={currentProduct}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProductManagement;
