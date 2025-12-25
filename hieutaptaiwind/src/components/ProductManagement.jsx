import { useState, useEffect } from 'react';
import ProductFormModal from './ProductFormModal';
import { useAuth } from '../pages/AuthContext';
import ConfirmModal from './ConfirmModal'; // Import modal xác nhận

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { user, loading: authLoading, showNotification } = useAuth();

  // State cho modal xóa sản phẩm
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm fetch sản phẩm
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
    if (!authLoading && user?.role === 'admin') {
      fetchProducts();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSave = () => {
    // Sau khi lưu thành công, đóng modal và tải lại danh sách
    handleCloseModal();
    fetchProducts();
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Đóng modal xác nhận xóa
  const closeDeleteModal = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Thực hiện xóa sản phẩm sau khi xác nhận
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
      fetchProducts(); // Tải lại danh sách sau khi xóa thành công
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Hiển thị loading trong khi xác thực hoặc fetch dữ liệu
  if (authLoading || loading) return <p>Đang tải dữ liệu sản phẩm...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Quản lý Sản phẩm (Bảo hiểm)</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Thêm sản phẩm mới
        </button>
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

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm">Tên sản phẩm</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Nhà cung cấp</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Loại hình</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Phí (năm)</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{product.name}</td>
                <td className="py-3 px-4">{product.provider}</td>
                <td className="py-3 px-4">{product.category}</td>
                <td className="py-3 px-4">{product.price.toLocaleString('vi-VN')} ₫</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="text-red-600 hover:text-red-800 font-semibold ml-4"
                  >
                    Xóa
                  </button>
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