import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
const AboutPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="relative">
        <HeroSlider />
      </div>  

      <main className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight lg:text-5xl">
            Về HieuShop
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Chúng tôi là cửa hàng chuyên cung cấp các sản phẩm công nghệ chất lượng cao, mang đến cho bạn những trải nghiệm tốt nhất.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;