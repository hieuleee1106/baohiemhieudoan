import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ConsultationModal from './ConsultationModal'; // Import modal

// Tối ưu: Đưa các hằng số ra ngoài component để tránh tạo lại mỗi lần render
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000, // Tự động trượt mỗi 4 giây
  cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
  appendDots: dots => (
    <div>
      <ul className="m-0 p-0 absolute bottom-8 w-full flex justify-center gap-2"> {dots} </ul>
    </div>
  ),
  customPaging: _i => ( // Đổi tên 'i' thành '_i' để báo hiệu biến không được sử dụng
    <div className="w-3 h-3 bg-white/50 rounded-full cursor-pointer transition-all duration-300 hover:bg-white"></div>
  )
};

const slidesData = [
  {
    id: 1,
    bgImage: "https://dlvncpapiext1.dai-ichi-life.com.vn:8119/iibmobile/v1/cms/files/676f3571-4c6b-4c87-aba1-d981098062c2",
  },
  {
    id: 2,
    bgImage: "https://dlvncpapiext1.dai-ichi-life.com.vn:8119/iibmobile/v1/cms/files/969e58f2-c7ee-4656-bcf3-a5795273b266",
  },
  {
    id: 3,
    bgImage: "https://dlvncpapiext1.dai-ichi-life.com.vn:8119/iibmobile/v1/cms/files/ed57741f-f63f-4fd7-9aed-74d67e42deac",
  },
];

const HeroSlider = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSlideClick = (slideId) => {
    if (slideId === 1) {
      navigate('/my-contracts');
    }
    else if (slideId === 3) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {isModalOpen && <ConsultationModal onClose={() => setIsModalOpen(false)} />}
      <div className="relative h-[500px] mb-16">
        <Slider {...sliderSettings}>
          {slidesData.map((slide) => (
            <div 
              key={slide.id} 
              onClick={() => handleSlideClick(slide.id)}
              className={(slide.id === 1 || slide.id === 3) ? 'cursor-pointer' : ''}
            >
              <div className="relative h-[500px]">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.bgImage})` }}></div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
};

export default HeroSlider;