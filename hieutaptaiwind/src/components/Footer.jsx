import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white font-sans border-t border-slate-800">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Hiếu Daiichi"
                className="h-14 w-auto"
              />
            </Link>

            <p className="text-sm leading-relaxed text-slate-400">
              Hiếu Daiichi đồng hành cùng bạn trong hành trình bảo vệ tài chính,
              sức khỏe và tương lai gia đình bằng những giải pháp bảo hiểm phù hợp
              và minh bạch.
            </p>

            <div className="flex gap-3 pt-2">
              <SocialLink
                href="https://www.facebook.com/oantrunghieu.215447"
                icon={<FaFacebookF />}
              />
              <SocialLink
                href="https://www.instagram.com/h__leeon/"
                icon={<FaInstagram />}
              />
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-5">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3">
              <FooterLink to="/" text="Trang chủ" />
              <FooterLink to="#" text="Sản phẩm bảo hiểm" />
              <FooterLink to="#" text="Tư vấn tài chính" />
              <FooterLink to="#" text="Liên hệ" />
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-5">
              Thông tin liên hệ
            </h3>

            <ul className="space-y-4">
              <ContactItem
                icon={<FaMapMarkerAlt />}
                text="Hữu Chung, Tân An, Hải Phòng"
              />
              <ContactItem
                icon={<FaPhoneAlt />}
                text="0971 304 944"
                href="tel:0971304944"
              />
              <ContactItem
                icon={<FaEnvelope />}
                text="hieeulee05@gmail.com"
                href="mailto:hieeulee05@gmail.com"
              />
            </ul>

            {/* Consultant */}
            <div className="mt-6 flex items-center gap-4 p-4 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                H
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-semibold uppercase">
                  Chủ tịch
                </p>
                <p className="text-white font-semibold">
                  Đoàn Trung Hiếu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center text-sm text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Hiếu Daiichi</p>
          <div className="flex gap-5">
            <a href="https://dai-ichi-life.com.vn/quy-dinh-27/quy-dinh-va-dieu-khoan-su-dung-1094" className="hover:text-emerald-400">Điều khoản</a>
            <a href="https://dai-ichi-life.com.vn/quy-dinh-27/chinh-sach-bao-mat-35" className="hover:text-emerald-400">Bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ---------- Components ---------- */

const SocialLink = ({ href, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, text }) => (
  <li>
    <Link
      to={to}
      className="text-slate-400 hover:text-emerald-400 transition"
    >
      {text}
    </Link>
  </li>
);

const ContactItem = ({ icon, text, href }) => (
  <li className="flex items-center gap-3 text-slate-400">
    <span className="text-emerald-500">{icon}</span>
    {href ? (
      <a href={href} className="hover:text-emerald-400 transition">
        {text}
      </a>
    ) : (
      <span>{text}</span>
    )}
  </li>
);

export default Footer;