import Header from '../components/Header';
import Footer from '../components/Footer';
import MyContracts from '../components/MyContracts';
import HeroSlider from '../components/HeroSlider';

const MyContractsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="relative">
          <HeroSlider />
        </div>
        <div className="relative container mx-auto px-6 -mt-16">
          <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-12">
            <MyContracts />
          </div>  
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyContractsPage;