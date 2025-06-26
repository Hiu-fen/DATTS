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
  const nav = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: User) => {
      const res = await axios.post("http://localhost:4000/login", data);
      return res.data;
    },
    onSuccess: (res) => {
      localStorage.setItem("token", res.accessToken);
      localStorage.setItem("user", JSON.stringify(res.user));
      message.success("Đăng nhập thành công");
      nav("/client");
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Đăng nhập thất bại");
    },
  });

  const onSubmit = (data: User) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email không được để trống" })}
              className="w-full px-4 py-2 border rounded-md"
            />
            <span className="text-red-500 text-sm">{errors.email?.message}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              {...register("password", { required: "Mật khẩu không được để trống" })}
              className="w-full px-4 py-2 border rounded-md"
            />
            <span className="text-red-500 text-sm">{errors.password?.message}</span>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
