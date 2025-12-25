import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import HeroSlider from "../components/HeroSlider";
import Chatbox from "../components/Chatbox";

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
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Header />

      <main className="flex-grow">
        {/* HERO */}
        <HeroSlider />

        {/* CONTENT */}
        <section className="relative container mx-auto px-6 -mt-20">
          {/* TITLE */}
          <div className="text-center py-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-500">
                An Tâm
              </span>{" "}
              Vững Bước
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500">
              Những giải pháp bảo hiểm minh bạch, phù hợp và đồng hành lâu dài
              cùng bạn và gia đình.
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
            <div className="bg-slate-50/70 rounded-3xl p-8 md:p-12 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
                {products.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* LOAD MORE */}
              {visibleCount < products.length && (
                <div className="flex justify-center mt-20">
                  <button
                    onClick={handleLoadMore}
                    className="px-10 py-3 rounded-full
                      bg-white border border-slate-200
                      text-slate-600 font-semibold
                      hover:border-emerald-500 hover:text-emerald-600
                      hover:bg-emerald-50
                      transition-all shadow-sm hover:shadow-md
                      flex items-center gap-2 group"
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
                  </button>
                </div>
              )}
            </div>
          )}

          {/* EMPTY */}
          {!loading && products.length === 0 && (
            <p className="text-center text-slate-500 py-24">
              Không tìm thấy sản phẩm phù hợp.
            </p>
          )}
        </section>
      </main>

      <Footer />
      <Chatbox />
    </div>
  );
};

export default HomePage;
