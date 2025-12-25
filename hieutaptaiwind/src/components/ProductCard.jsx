import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";

const ProductCard = ({ product }) => {
  const { name, description, price, imageUrl, category } = product;
  const navigate = useNavigate();

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-purple-100/50 shadow-lg border border-slate-100 h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-purple-200/80 hover:-translate-y-2">
      <Link to={`/product/${product._id}`} className="absolute inset-0 z-0" aria-label={`Xem chi tiết ${name}`}></Link>
      <img
        className="w-full h-56 object-cover"
        src={imageUrl}
        alt={`Hình ảnh của ${name}`}
      />
      <div className="p-6 flex flex-col flex-grow">
        {/* Thêm loại sản phẩm */}
        <p className="text-sm font-semibold text-purple-600 mb-1">
          <span className="font-normal text-slate-500">Loại bảo hiểm:</span> {category}
        </p>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
        <p className="text-slate-500 text-sm mb-4 h-10 overflow-hidden flex-grow">{description}</p>
        <div className="flex items-center justify-between mt-auto">
          {/* Định dạng giá tiền kiểu Việt Nam */}
          <span className="text-2xl font-bold text-slate-800">{price.toLocaleString('vi-VN')} ₫</span>
          <Button
            size="sm"
            className="relative z-10"
            onClick={(e) => {
              e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ Link cha
              navigate(`/register-insurance/${product._id}`);
            }}
          >
            <span>Đăng ký</span>
          </Button>
        </div>
      </div>
    </div>
  );
};


export default ProductCard;