import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Cập nhật thông tin cá nhân (Profile)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // Validate phone format
      if (req.body.phone) {
        if (!/^[0-9]{10}$/.test(req.body.phone)) {
          return res.status(400).json({ message: "Số điện thoại phải có đúng 10 chữ số" });
        }
        
        // Check if phone already exists (for other users)
        const existingPhone = await User.findOne({ phone: req.body.phone, _id: { $ne: req.user._id } });
        if (existingPhone) {
          return res.status(400).json({ message: "Số điện thoại này đã được sử dụng" });
        }
        
        user.phone = req.body.phone;
      } else {
        user.phone = user.phone;
      }
      
      if (req.body.password) {
        // Mã hóa mật khẩu trước khi lưu
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      // Nếu có xử lý avatar, thêm logic tại đây (ví dụ lưu URL ảnh)
      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }

      const updatedUser = await user.save();

      // Trả về thông tin user mới (không trả về password)
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({ message: 'Lỗi server hoặc email đã tồn tại' });
  }
};