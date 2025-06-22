import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { User } from "../../../interface/user";
import bcrypt from 'bcryptjs';

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<User>();

  const navigate = useNavigate();
  const password = watch("password", "");

  const mutation = useMutation({
    mutationFn: async (formData: User) => {
      // Kiểm tra email đã tồn tại
      const checkEmail = await axios.get(`http://localhost:4000/users?email=${formData.email}`);
      if (checkEmail.data.length > 0) {
        throw new Error("Email đã được đăng ký");
      }

      // Mã hóa mật khẩu
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(formData.password, salt);

      const { data } = await axios.post("http://localhost:4000/users", {
        ...formData,
        password: hashedPassword,
        role: "user",
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return data;
    },
    onSuccess: () => {
      message.success("Đăng ký thành công!");
      reset();
      navigate("/login");
    },
    onError: (error: any) => {
      message.error(error.message || "Đăng ký thất bại");
    }
  });

  const onSubmit = (data: User) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 px-4">
      <div className="max-w-md mx-auto p-8 bg-white border rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Đăng ký tài khoản</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("name", {
                required: "Họ tên không được để trống",
                minLength: {
                  value: 3,
                  message: "Họ tên phải có ít nhất 3 ký tự"
                },
                maxLength: {
                  value: 50,
                  message: "Họ tên không quá 50 ký tự"
                }
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("email", {
                required: "Email không được để trống",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email không hợp lệ"
                }
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("password", {
                required: "Mật khẩu không được để trống",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự"
                },
                validate: (value) => {
                  if (!/[A-Z]/.test(value)) {
                    return "Mật khẩu cần ít nhất 1 chữ hoa";
                  }
                  if (!/[0-9]/.test(value)) {
                    return "Mật khẩu cần ít nhất 1 số";
                  }
                  return true;
                }
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu",
                validate: (value) =>
                  value === password || "Mật khẩu không khớp"
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("phone", {
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ"
                }
              })}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Nút đăng ký */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition ${
                mutation.isPending ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {mutation.isPending ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Đã có tài khoản?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;