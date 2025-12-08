import { useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/store/AuthContext";
import styles from "./AuthDialog.module.scss";

const initialLogin = { email: "", password: "" };
const initialRegister = { name: "", email: "", password: "" };

const AuthDialog = () => {
  const {
    authModalOpen,
    closeAuthModal,
    authView,
    setAuthView,
    login,
    register,
  } = useAuthContext();
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (authView === "login") {
        const user = await login(loginForm);
        toast.success("Đăng nhập thành công", {
          description: `Chào mừng trở lại, ${user?.name || user?.email || "bạn"}!`,
        });
      } else {
        await register(registerForm);
        toast.success("Đăng ký thành công", {
          description: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
        });
      }
      setLoginForm(initialLogin);
      setRegisterForm(initialRegister);
    } catch (error) {
      toast.error(
        authView === "login" ? "Đăng nhập thất bại" : "Đăng ký thất bại",
        {
          description: error.message || "Vui lòng thử lại sau",
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={closeAuthModal}>
      <div className={styles.card} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <button
            type="button"
            data-active={authView === "login"}
            onClick={() => setAuthView("login")}>
            Đăng nhập
          </button>
          <button
            type="button"
            data-active={authView === "register"}
            onClick={() => setAuthView("register")}>
            Đăng ký
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          {authView === "register" ? (
            <label>
              Họ và tên
              <input
                type="text"
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={
                authView === "login" ? loginForm.email : registerForm.email
              }
              onChange={(event) =>
                authView === "login"
                  ? setLoginForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  : setRegisterForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
              }
              required
            />
          </label>

          <label>
            Mật khẩu
            <input
              type="password"
              value={
                authView === "login"
                  ? loginForm.password
                  : registerForm.password
              }
              onChange={(event) =>
                authView === "login"
                  ? setLoginForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  : setRegisterForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
              }
              minLength={6}
              required
            />
          </label>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting
              ? "Đang xử lý..."
              : authView === "login"
              ? "Đăng nhập"
              : "Tạo tài khoản"}
          </button>
        </form>

        <button
          type="button"
          className={styles.close}
          onClick={closeAuthModal}
          aria-label="Đóng">
          ×
        </button>
      </div>
    </div>
  );
};

export default AuthDialog;
