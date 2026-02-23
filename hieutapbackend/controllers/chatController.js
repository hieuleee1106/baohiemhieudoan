import { GoogleGenAI } from "@google/genai";
import { Product } from "../models/Product.js";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ===== KIẾN THỨC CHUNG (KHÔNG NẰM TRONG DB) =====
const generalHospitalSupport = `
KIẾN THỨC CHUNG:
- Trợ cấp nằm viện trên thị trường bảo hiểm sức khỏe hiện nay thường:
  + 100.000 – 300.000 đồng/ngày: gói cơ bản
  + 300.000 – 500.000 đồng/ngày: gói nâng cao
  + 500.000 – 1.000.000 đồng/ngày: gói cao cấp
- Mức này mang tính tham khảo
- Quyền lợi chính xác phụ thuộc từng sản phẩm và hợp đồng
`;

export const handleChat = async (req, res) => {
  try {
    const { message, isFirstMessage } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Tin nhắn không được để trống." });
    }

    // ===== LẤY SẢN PHẨM =====
    const products = await Product.find({});
    const productData = JSON.stringify(
      products.map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        provider: p.provider,
        description: p.description,
        benefits: p.benefits,
      }))
    );

    // ===== PROMPT LẦN ĐẦU =====
    const firstPrompt = `
Bạn là tư vấn viên bảo hiểm của Hieudaichi. 

QUY TẮC:
- Chỉ chào 1 lần
- Tối đa 2 câu
- Không giới thiệu dài
- Không liệt kê sản phẩm
- Không emoji, không markdown
- Giọng tự nhiên như người thật

CÂU KHÁCH:
"${message}"
`;

    // ===== PROMPT TƯ VẤN =====
    const normalPrompt = `
Bạn là tư vấn viên bảo hiểm của Hieudaichi.chủ của bạn là Đoàn Trung Hiếu, sđt 0971304944, email hieulee05@gmail.com

QUY TẮC BẮT BUỘC:
- Trả lời ngắn gọn, dễ đọc
- Tối đa 5 dòng
- Mỗi ý 1 dòng
- Không lan man
- Không lặp thông tin cửa hàng
- Không emoji, không markdown
- Ưu tiên dữ liệu sản phẩm
- Nếu sản phẩm không có thông tin:
  + Được dùng KIẾN THỨC CHUNG
  + Phải nói rõ là mức tham khảo
- Tuyệt đối không bịa số tiền cụ thể

KIẾN THỨC CHUNG:
${generalHospitalSupport}

DỮ LIỆU SẢN PHẨM (JSON):
${productData}

CÂU KHÁCH:
"${message}"
`;

    const prompt = isFirstMessage ? firstPrompt : normalPrompt;

    const result = await genAI.models.generateContent({
      model: "models/gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const reply =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, tôi chưa thể trả lời lúc này.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ message: "Lỗi AI server" });
  }
};
