import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { User } from "../../../interface/user";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>();

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: User) => {
      const res = await axios.post("http://localhost:4000/register", {
        ...data,
        role: "user", // Mặc định role là user
        active: true, // Mặc định tài khoản được kích hoạt
      });
      return res.data;
    },
    onSuccess: () => {
      message.success("Đăng ký thành công");
      navigate("/login");
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Đăng ký thất bại");
    },
  });

  const onSubmit = (data: User) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-xl">
        {/* Bên trái - hình ảnh và giới thiệu */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 text-white p-10 flex flex-col justify-between">
          <div>
            <img
              src="https://adsmo.vn/wp-content/uploads/2020/12/quan-tri-web-chuyen-nghiep-gia-re-adsmo.png"
              alt="logo"
              style={{ width: "100%", height: "auto" }}
            />
            <h2 className="text-3xl font-bold mb-4">Chào mừng bạn đến với XPhone</h2>
            <p className="text-sm">
              Tạo tài khoản ngay để khám phá hàng ngàn sản phẩm chất lượng và nhiều ưu đãi hấp dẫn dành cho bạn!
            </p>
          </div>
        </div>

        {/* Bên phải - Form đăng ký */}
        <div className="md:w-1/2 p-10 bg-white">
          <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">-------------Register-------------</h2>
          <p className="text-red-500 mb-6 text-center">Vui lòng nhập thông tin để đăng ký tài khoản</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Tên */}
            <div>
              <input
                type="text"
                placeholder="Tên của bạn"
                {...register("name", { required: "Tên không được để trống" })}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: "Email không được để trống",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                })}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <input
                type="password"
                placeholder="Mật khẩu"
                {...register("password", {
                  required: "Mật khẩu không được để trống",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Nút Đăng ký */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-full transition"
            >
              Đăng ký
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-blue-600 hover:underline">Đăng nhập ngay</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
