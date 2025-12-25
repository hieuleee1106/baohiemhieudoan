import crypto from 'crypto';
import querystring from 'qs';
import { Contract } from '../models/Contract.js';
import { Notification } from '../models/Notification.js';

/**
 * @desc    Tạo URL thanh toán VNPay
 * @route   POST /api/payment/create_payment_url
 * @access  Private
 */
export const createPaymentUrl = async (req, res) => {
    try {
        // Thiếu các biến môi trường cần thiết
        if (!process.env.VNP_TMNCODE || !process.env.VNP_HASHSECRET || !process.env.VNP_URL || !process.env.VNP_RETURN_URL) {
            return res.status(500).json({ message: "Lỗi cấu hình máy chủ thanh toán." });
        }

        const { contractId, amount, bankCode, language } = req.body;

        const contract = await Contract.findOne({ _id: contractId, user: req.user._id });
        if (!contract) {
            return res.status(404).json({ message: 'Không tìm thấy hợp đồng.' });
        }

        if (contract.status !== 'Chờ thanh toán') {
            return res.status(400).json({ message: 'Hợp đồng này không ở trạng thái chờ thanh toán.' });
        }

        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const tmnCode = process.env.VNP_TMNCODE;
        const secretKey = process.env.VNP_HASHSECRET;
        let vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        const date = new Date();
        const createDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
        const orderId = contractId; // Sử dụng ID hợp đồng làm mã giao dịch
        
        // Chuẩn hóa vnp_OrderInfo để loại bỏ dấu và các ký tự không hợp lệ
        let orderInfo = `Thanh toan hop dong ${contract.contractNumber}`;
        orderInfo = orderInfo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

        const orderType = 'billpayment';
        const locale = language || 'vn';
        const currCode = 'VND';

        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': locale,
            'vnp_CurrCode': currCode,
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': orderInfo,
            'vnp_OrderType': orderType,
            'vnp_Amount': amount * 100, // Số tiền nhân 100 theo quy định của VNPay
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate,
        };

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = Object.entries(vnp_Params)
            .sort(([key1], [key2]) => key1.localeCompare(key2))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;

        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.status(200).json({ paymentUrl: vnpUrl });

    } catch (error) {
        console.error("Lỗi tạo URL thanh toán:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

/**
 * @desc    Xử lý kết quả VNPay trả về
 * @route   GET /api/payment/vnpay_return
 * @access  Public
 */
export const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = Object.entries(vnp_Params)
            .sort(([key1], [key2]) => key1.localeCompare(key2))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const secretKey = process.env.VNP_HASHSECRET;
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const contractId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const frontendRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result`;

        if (secureHash === signed) {
            const contract = await Contract.findById(contractId).populate('product');
            if (!contract) {
                // Không tìm thấy hợp đồng
                return res.redirect(`${frontendRedirectUrl}?success=false&message=ContractNotFound`);
            }

            // Chỉ xử lý khi hợp đồng đang chờ thanh toán
            if (contract.status === 'Chờ thanh toán') {
                if (responseCode === '00') {
                    // Giao dịch thành công
                    contract.status = 'Hiệu lực';
                    contract.paymentDetails = { ...vnp_Params }; // Lưu lại chi tiết giao dịch
                    await contract.save();

                    // Tạo thông báo cho người dùng
                    await Notification.create({
                        user: contract.user,
                        message: `Thanh toán thành công cho hợp đồng "${contract.product.name}". Hợp đồng của bạn đã có hiệu lực.`,
                        link: `/my-contracts/${contract._id}`
                    });

                    return res.redirect(`${frontendRedirectUrl}?success=true&message=PaymentSuccess`);
                } else {
                    // Giao dịch thất bại
                    contract.status = 'Thanh toán thất bại';
                    await contract.save();
                    return res.redirect(`${frontendRedirectUrl}?success=false&message=PaymentFailed`);
                }
            } else if (contract.status === 'Hiệu lực') {
                // Hợp đồng đã được xử lý trước đó (có thể do IPN gọi trước)
                return res.redirect(`${frontendRedirectUrl}?success=true&message=PaymentAlreadyConfirmed`);
            }
        }

        // Chữ ký không hợp lệ
        return res.redirect(`${frontendRedirectUrl}?success=false&message=InvalidSignature`);

    } catch (error) {
        console.error("Lỗi xử lý VNPay return:", error);
        const frontendRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result`;
        return res.redirect(`${frontendRedirectUrl}?success=false&message=ServerError`);
    }
};