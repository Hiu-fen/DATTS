import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { User } from "../../../interface/user";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: User) => {
      const res = await axios.post("http://localhost:4000/login", data);
      return res.data;
    },
    onSuccess: (res) => {
      localStorage.setItem("token", res.accessToken);
      localStorage.setItem("user", JSON.stringify(res.user));
      message.success("Đăng nhập thành công");
      navigate("/");
      window.location.reload()
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Đăng nhập thất bại");
    },
  });

  const onSubmit = (data: User) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-xl">
        {/* Panel trái */}
        <div className="md:w-1/2 bg-gradient-to-br from-red-700 to-red-500 text-white p-10 flex flex-col justify-between">
          <div>
            <img
              src="https://adsmo.vn/wp-content/uploads/2020/12/quan-tri-web-chuyen-nghiep-gia-re-adsmo.png"
              style={{ width: "600px", height: "250px" }}
              alt="logo"
            />
            <h2 className="text-3xl font-bold mb-4">Chào mừng đến với XPhone</h2>
            <p className="text-sm">
              Nền tảng mua sắm dễ dàng, hiện đại và tiện lợi. Hãy đăng nhập để bắt đầu trải nghiệm nhé!
            </p>
          </div>
        </div>

        {/* Panel phải */}
        <div className="md:w-1/2 p-10 bg-white">
          <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">-------------Login-------------</h2>
          <p className="text-red-500 mb-6 text-center">Bạn cần đăng nhập để tiếp tục</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("email", { required: "Email không được để trống" })}
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <input
                {...register("password", { required: "Mật khẩu không được để trống" })}
                type="password"
                placeholder="Mật khẩu"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span></span>
              <a href="#" className="hover:underline">Quên mật khẩu?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full transition"
            >
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <a href="/register" className="text-red-600 hover:underline">Đăng ký</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
