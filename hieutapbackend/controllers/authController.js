import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Staff } from "../models/Staff.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

/**
 * @desc    Đăng ký tài khoản
 * @route   POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @desc    Tạo tài khoản nhân viên (Chỉ Admin mới được gọi)
 * @route   POST /api/auth/create-staff
 * @access  Private/Admin
 */
export const createStaff = async (req, res) => {
  try {
    // 1. Kiểm tra quyền: Chỉ Admin mới được tạo nhân viên
    // (Giả sử middleware đã xác thực user, ta kiểm tra role tại đây để chắc chắn)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này. Chỉ Admin mới được thêm nhân viên." });
    }

    const { name, email, password, phone, position, salary, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập tên, email và mật khẩu cho nhân viên." });
    }

    // 2. Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã được sử dụng." });
    }

    // 3. Tạo User với role là 'staff'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: "staff", // Quan trọng: Gán quyền staff
    });

    // 4. Tạo hồ sơ Staff liên kết
    const newStaffProfile = await Staff.create({
      user: newUser._id,
      position,
      salary,
      department
    });

    res.status(201).json({
      message: "Tạo nhân viên thành công",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      staffProfile: newStaffProfile
    });
  } catch (error) {
    console.error("Lỗi tạo nhân viên:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @desc    Đăng nhập & trả về token
 * @route   POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        // Tối ưu: Trả về cả token và thông tin người dùng
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};




/**
 * @desc    Xác thực người dùng bằng Google & trả về token
 * @route   POST /api/auth/google
 */
export const loginWithGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Không nhận được thông tin xác thực từ Google." });
    }

    const decodedGoogleToken = jwt.decode(credential);
    const { email, name, picture } = decodedGoogleToken;

    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        avatar: picture,
      });
    }

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        // Tối ưu: Trả về cả token và thông tin người dùng
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
          }
        });
      }
    );
  } catch (error) {
    console.error("Lỗi xác thực Google:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @desc    Lấy thông tin người dùng hiện tại (đã đăng nhập)
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  // Tối ưu: Trả về một đối tượng user nhất quán, đầy đủ thông tin
  // thay vì chỉ trả về req.user mặc định từ middleware.
  // Đảm bảo cấu trúc trả về đồng nhất với login (dạng lồng nhau)
  // để client xử lý dữ liệu một cách nhất quán.
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      avatar: req.user.avatar,
    }
  });
};

/**
 * @desc    Cập nhật thông tin người dùng (tên, email)
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateUserDetails = async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email này đã được sử dụng." });
      }
      user.email = email;
    }

    user.name = name;
    user.phone = phone;

    if (req.file) {
      user.avatar = req.file.path; // Cloudinary trả về URL đầy đủ trong req.file.path
    } else {
      user.avatar = avatar || user.avatar;
    }

    const updatedUser = await user.save();
    // Đảm bảo cấu trúc trả về đồng nhất với login (dạng lồng nhau).
    res.status(200).json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      }
    });
  } catch (error) {
    console.error("Lỗi cập nhật người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @route   PUT /api/auth/password
 * @desc    Cập nhật mật khẩu người dùng
 * @access  Private
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Cập nhật mật khẩu thành công." });
  } catch (error) {
    console.error("Lỗi cập nhật mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Xử lý yêu cầu quên mật khẩu
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: "Nếu email tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi." });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const message = `
      <h1>Yêu cầu đặt lại mật khẩu</h1>
      <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại HieuShop.</p>
      <p>Vui lòng nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Liên kết này sẽ hết hạn sau 10 phút.</p>
      <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'HieuShop - Yêu cầu đặt lại mật khẩu',
      html: message,
    });

    res.status(200).json({ 
      message: "Yêu cầu đặt lại mật khẩu đã được xử lý. Vui lòng kiểm tra email của bạn."
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @route   PUT /api/auth/reset-password/:token
 * @desc    Đặt lại mật khẩu mới
 */
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }

    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    console.error("Lỗi reset mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @desc    Lấy tất cả người dùng (Admin)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @desc    Lấy danh sách tất cả nhân viên (kèm thông tin User)
 * @route   GET /api/auth/staff
 * @access  Private/Admin
 */
export const getAllStaff = async (req, res) => {
  try {
    // Lấy tất cả hồ sơ Staff và populate thông tin User tương ứng
    const staffMembers = await Staff.find().populate('user', '-password').sort({ createdAt: -1 });
    res.status(200).json(staffMembers);
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân viên:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @desc    Cập nhật thông tin nhân viên
 * @route   PUT /api/auth/staff/:id
 * @access  Private/Admin
 */
export const updateStaff = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Chỉ Admin mới có quyền chỉnh sửa nhân viên." });
    }

    const { id } = req.params; // ID của hồ sơ Staff
    const { name, email, phone, position, salary, department, status } = req.body;

    const staffProfile = await Staff.findById(id);
    if (!staffProfile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ nhân viên." });
    }

    // 1. Cập nhật thông tin trong bảng Staff
    staffProfile.position = position || staffProfile.position;
    staffProfile.salary = salary || staffProfile.salary;
    staffProfile.department = department || staffProfile.department;
    staffProfile.status = status || staffProfile.status;
    await staffProfile.save();

    // 2. Cập nhật thông tin cơ bản trong bảng User (Tên, SĐT)
    // Lưu ý: Không cho phép đổi email ở đây để tránh xung đột phức tạp
    await User.findByIdAndUpdate(staffProfile.user, { name, phone });

    res.status(200).json({ message: "Cập nhật nhân viên thành công.", staff: staffProfile });
  } catch (error) {
    console.error("Lỗi cập nhật nhân viên:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * @desc    Xóa người dùng (Admin)
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Thêm một lớp bảo vệ để không cho phép xóa tài khoản admin khác
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Không thể xóa tài khoản quản trị viên.' });
    }

    // Ngăn chặn Staff xóa tài khoản của Staff khác (nếu muốn chặt chẽ hơn)
    if (req.user.role === 'staff' && user.role === 'staff') {
       return res.status(403).json({ message: 'Nhân viên không có quyền xóa nhân viên khác.' });
    }

    // Xóa hồ sơ nhân viên liên quan (nếu có) trước khi xóa User
    await Staff.deleteOne({ user: user._id });

    await user.deleteOne();
    res.status(200).json({ message: "Người dùng đã được xóa thành công." });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};