import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ConsultationModal from '../components/ConsultationModal';
import Button from '../components/Button';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                if (!res.ok) throw new Error('Không tìm thấy sản phẩm.');
                const data = await res.json();
                setProduct(data);

                // Tải các sản phẩm liên quan
                const allProductsRes = await fetch('/api/products');
                if (allProductsRes.ok) {
                    const allProducts = await allProductsRes.json();
                    const related = allProducts
                        .filter(p => p.category === data.category && p._id !== data._id)
                        .slice(0, 4); // Lấy 4 sản phẩm liên quan
                    setRelatedProducts(related);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        // Cuộn lên đầu trang mỗi khi đổi sản phẩm
        window.scrollTo(0, 0);
    }, [productId]); // Thêm productId vào dependency array

    // Xử lý trường hợp không tìm thấy sản phẩm
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p>Đang tải...</p></div>;
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-4xl font-bold text-slate-800">Sản phẩm không tồn tại</h1>
                <p className="text-slate-500 mt-2">Rất tiếc, chúng tôi không thể tìm thấy sản phẩm bạn yêu cầu.</p>
                <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    const { name, description, price, imageUrl, provider, category, insuredObject, benefits, annualInsurableAmount, insuranceTerm } = product;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            {isModalOpen && <ConsultationModal product={product} onClose={() => setIsModalOpen(false)} />}
            <Header />
            <main className="container mx-auto px-6 py-12 flex-grow">
                {/* Breadcrumb */}
                <div className="mb-8 text-sm text-slate-500">
                    <Link to="/" className="hover:text-purple-600">Trang chủ</Link>
                    <span className="mx-2">/</span>
                    <span>{name}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    {/* Hình ảnh sản phẩm */}
                    <div className="rounded-xl shadow-2xl shadow-purple-200/50 overflow-hidden sticky top-28">
                        <img src={imageUrl} alt={`Hình ảnh của ${name}`} className="w-full h-full object-cover" />
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-center">
                            <span className="bg-purple-100 text-purple-700 font-bold text-sm px-3 py-1 rounded-full">{category}</span>

                            <span className="text-slate-500">Nhà cung cấp:<span className="font-bold text-slate-700">{provider}</span></span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 -mt-2">{name}</h1>

                        <div>
                            <p className="text-slate-500 text-lg">💰Chi phí tham gia từ</p>
                            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{price.toLocaleString('vi-VN')} ₫ <span className="text-2xl text-slate-500">/năm</span></p>
                        </div>

                        <div className="mt-4 border-t border-slate-200 pt-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">🎁 Quyền lợi:</h3>
                            <ul className="space-y-3 text-slate-600">
                                {benefits?.split('\n').map((item, index) => item && (
                                    <li key={index} className="flex items-start gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-6 border-t border-slate-200 pt-6 space-y-3 text-slate-600">
                            <p><strong>👥Đối tượng bảo hiểm:</strong> {insuredObject}</p>
                            <p><strong>💵Số tiền bảo hiểm có thể nhận:</strong> <span className="font-bold text-purple-600">{annualInsurableAmount?.toLocaleString('vi-VN')} ₫/năm</span></p>
                            <p><strong>⏳Thời hạn bảo hiểm:</strong> {insuranceTerm}</p>
                        </div>
                        
                        <div className="mt-8 flex flex-col gap-4">
                            <Button 
                                variant="gradient"
                                size="lg"
                                onClick={() => navigate(`/register-insurance/${product._id}`)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Đăng ký ngay</span>
                            </Button>
                            <Button 
                                variant="subtle"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>Yêu cầu tư vấn</span>
                            </Button>
                            <p className="text-center text-sm text-slate-500 mt-3">Miễn phí tư vấn 24/7, không ràng buộc.</p>
                        </div>

                    </div>
                </div>

                {/* Sản phẩm liên quan */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 pt-12 border-t border-slate-200">
                        <h2 className="text-3xl font-bold text-center mb-12">Sản phẩm liên quan</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(relatedProduct => (
                                <ProductCard key={relatedProduct._id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetailPage;