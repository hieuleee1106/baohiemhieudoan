import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import HeroSlider from "../components/HeroSlider";
import Chatbox from "../components/Chatbox";
import Button from "../components/Button";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  const searchTerm = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "Tất cả";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("keyword", searchTerm);
        if (selectedCategory !== "Tất cả") {
          params.append("category", selectedCategory);
        }

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Không thể tải sản phẩm");

        const data = await res.json();
        setProducts(data);
        setVisibleCount(4);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-grow">
        {/* HERO */}
        <HeroSlider />

        {/* CONTENT */}
        <section className="container mx-auto px-6 pb-20 -mt-6">
          {/* TITLE */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-wider text-purple-600 uppercase bg-purple-100 rounded-full">
              Giải pháp bảo hiểm toàn diện
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                An Tâm
              </span>{" "}
              Vững Bước
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Những giải pháp bảo hiểm minh bạch, phù hợp và đồng hành lâu dài cùng bạn và gia đình trên mọi chặng đường.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-center text-red-500 mb-12">{error}</p>
          )}

          {/* LOADING */}
          {loading && (
            <p className="text-center text-slate-500 mb-12">
              Đang tải sản phẩm...
            </p>
          )}

          {/* PRODUCT LIST */}
          {!loading && !error && products.length > 0 && (
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* LOAD MORE */}
              {visibleCount < products.length && (
                <div className="flex justify-center mt-16">
                  <Button
                    onClick={handleLoadMore}
                    variant="slide"
                    className="px-10 py-3 rounded-full shadow-lg shadow-purple-200/50 border border-purple-100"
                  >
                    Xem thêm sản phẩm
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 group-hover:translate-y-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* EMPTY */}
          {!loading && products.length === 0 && (
            <div className="text-center py-20 bg-white/60 rounded-3xl border border-slate-100">
              <p className="text-slate-500 text-lg">Không tìm thấy sản phẩm phù hợp.</p>
            </div>
          )}
        </section>

        {/* Trust Indicators Section */}
        <section className="py-12 border-t border-slate-200/60 bg-red-300">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">🛡️</div>
              <h3 className="font-bold text-slate-800">Uy tín hàng đầu</h3>
              <p className="text-sm text-slate-500 mt-1">Đối tác tin cậy của hàng triệu gia đình Việt</p>
            </div>
            <div>
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="font-bold text-slate-800">Bồi thường nhanh chóng</h3>
              <p className="text-sm text-slate-500 mt-1">Quy trình đơn giản, minh bạch, hỗ trợ 24/7</p>
            </div>
            <div>
              <div className="text-4xl mb-2">💎</div>
              <h3 className="font-bold text-slate-800">Quyền lợi vượt trội</h3>
              <p className="text-sm text-slate-500 mt-1">Giải pháp tài chính tối ưu nhất cho bạn</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Chatbox />
    </div>
  );
};

export default HomePage;
