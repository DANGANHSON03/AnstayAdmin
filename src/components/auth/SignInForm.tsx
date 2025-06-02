import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!loginData.email || !loginData.password) {
      setError("Vui lòng điền vào tất cả các trường");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("https://anstay.com.vn/api/users");
      const users = response.data;

      const user = users.find(
        (user: any) =>
          user.email === loginData.email && user.password === loginData.password
      );

      if (user) {
        if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
          localStorage.setItem("userData", JSON.stringify(user));
          localStorage.setItem("token", "your_token_here");
          navigate("/home");
        } else {
          setError("Quyền truy cập bị từ chối. Cần có quyền quản trị.");
        }
      } else {
        setError("Email hoặc mật khẩu không hợp lệ");
      }
    } catch (err: any) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng nhập
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vui lòng nhập email và mật khẩu để đăng nhập!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && <div className="text-sm text-error-500">{error}</div>}
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="email"
                    value={loginData.email}
                    onChange={handleChange}
                    placeholder="info@gmail.com"
                  />
                </div>
                <div>
                  <Label>
                    Mật Khẩu <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Lưu thông tin đăng nhập
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Quên mật khẩu ?
                  </Link>
                </div>
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
