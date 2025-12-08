import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Loading from "@/components/Loading/Loading";
import { useAuthContext } from "@/store/AuthContext";
import { reservationService } from "@/services/reservationService";
import TableSelector from "@/features/reservation/TableSelector/TableSelector";
import Textarea from "@/components/Textarea/Textarea";
import styles from "./Reservation.module.scss";

const ReservationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal, user } = useAuthContext();

  // Lấy ngày hôm nay và ngày tối đa (30 ngày sau)
  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // Lấy giờ hiện tại + 1 giờ làm mặc định
  const getDefaultTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    reservationDate: today,
    reservationTime: getDefaultTime(),
    partySize: 2,
    tableNumber: null,
    notes: "",
  });

  const [availableTables, setAvailableTables] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đồng bộ thông tin từ user nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || user.email || prev.customerName,
        customerPhone: user.phone || prev.customerPhone,
      }));
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset table selection khi thay đổi date/time/partySize
      if (["reservationDate", "reservationTime", "partySize"].includes(field)) {
        updated.tableNumber = null;
      }
      return updated;
    });
  };

  const handleTableSelect = (tableNumber) => {
    setFormData((prev) => ({
      ...prev,
      tableNumber: prev.tableNumber === tableNumber ? null : tableNumber,
    }));
  };

  const handleTablesLoad = useCallback((tables) => {
    setAvailableTables(tables);
  }, []);

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }
    if (!formData.customerPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!formData.reservationDate) {
      toast.error("Vui lòng chọn ngày đặt bàn");
      return false;
    }
    if (!formData.reservationTime) {
      toast.error("Vui lòng chọn giờ đặt bàn");
      return false;
    }
    if (!formData.partySize || formData.partySize < 1) {
      toast.error("Số người phải từ 1 trở lên");
      return false;
    }
    if (!formData.tableNumber) {
      toast.error("Vui lòng chọn bàn");
      return false;
    }

    // Kiểm tra ngày không được trong quá khứ
    const selectedDate = new Date(
      `${formData.reservationDate}T${formData.reservationTime}`
    );
    const now = new Date();
    if (selectedDate < now) {
      toast.error("Không thể đặt bàn trong quá khứ");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đặt bàn");
      openAuthModal("login");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      toast.loading("Đang xử lý đặt bàn...", { id: "reservation" });

      const reservation = await reservationService.createReservation({
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        tableNumber: formData.tableNumber,
        partySize: formData.partySize,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        durationMinutes: 120,
        notes: formData.notes.trim() || null,
      });

      toast.success("Đặt bàn thành công!", {
        id: "reservation",
        description: `Mã đặt bàn: #${reservation.id}. Chúng tôi sẽ liên hệ xác nhận sớm nhất.`,
      });

      // Reset form
      setFormData({
        customerName: user?.name || user?.email || "",
        customerPhone: user?.phone || "",
        reservationDate: today,
        reservationTime: getDefaultTime(),
        partySize: 2,
        tableNumber: null,
        notes: "",
      });

      // Redirect sau 2 giây
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      console.error("Lỗi đặt bàn:", error);
      toast.error("Không thể đặt bàn", {
        id: "reservation",
        description: error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <h2>Đăng nhập để đặt bàn</h2>
          <p>Bạn cần đăng nhập để sử dụng dịch vụ đặt bàn.</p>
          <button
            type="button"
            className={styles.authButton}
            onClick={() => openAuthModal("login")}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.pill}>Đặt bàn</span>
        <h1>Giữ chỗ trước để tận hưởng trọn vẹn</h1>
        <p>
          Chọn thời gian và số người, chúng tôi sẽ tìm bàn phù hợp nhất cho bạn.
          Đặt bàn trước giúp bạn không phải chờ đợi và có trải nghiệm tốt nhất.
        </p>
      </section>

      <div className={styles.container}>
        <div className={styles.layout}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.formTitle}>Thông tin đặt bàn</h2>

            <div className={styles.field}>
              <label>
                <span>
                  Họ tên <span className={styles.required}>*</span>
                </span>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  required
                />
              </label>
            </div>

            <div className={styles.field}>
              <label>
                <span>
                  Số điện thoại <span className={styles.required}>*</span>
                </span>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    handleChange("customerPhone", e.target.value)
                  }
                  placeholder="0987 654 321"
                  required
                />
              </label>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>
                  <span>
                    Ngày đặt bàn <span className={styles.required}>*</span>
                  </span>
                  <input
                    type="date"
                    value={formData.reservationDate}
                    onChange={(e) =>
                      handleChange("reservationDate", e.target.value)
                    }
                    min={today}
                    max={maxDateStr}
                    required
                  />
                </label>
              </div>

              <div className={styles.field}>
                <label>
                  <span>
                    Giờ đặt bàn <span className={styles.required}>*</span>
                  </span>
                  <input
                    type="time"
                    value={formData.reservationTime}
                    onChange={(e) =>
                      handleChange("reservationTime", e.target.value)
                    }
                    required
                  />
                </label>
              </div>
            </div>

            <div className={styles.field}>
              <label>
                <span>
                  Số người <span className={styles.required}>*</span>
                </span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.partySize}
                  onChange={(e) =>
                    handleChange("partySize", parseInt(e.target.value, 10) || 1)
                  }
                  required
                />
              </label>
            </div>

            <TableSelector
              date={formData.reservationDate}
              time={formData.reservationTime}
              partySize={formData.partySize}
              selectedTable={formData.tableNumber}
              onSelect={handleTableSelect}
              onLoad={handleTablesLoad}
            />

            <div className={styles.field}>
              <label>
                <span>Ghi chú (tùy chọn)</span>
                <Textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Ví dụ: Bàn gần cửa sổ, yêu cầu đặc biệt..."
                />
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !formData.tableNumber}>
              {isSubmitting ? "Đang xử lý..." : "Đặt bàn ngay"}
            </button>
          </form>

          <aside className={styles.info}>
            <div className={styles.infoCard}>
              <h3>Thông tin liên hệ</h3>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <div>
                    <span>Điện thoại</span>
                    <strong>1900 636 678</strong>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <div>
                    <span>Email</span>
                    <strong>booking@wowwraps.vn</strong>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <div>
                    <span>Địa chỉ</span>
                    <strong>18 Ngô Quyền, Hoàn Kiếm, Hà Nội</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3>Giờ mở cửa</h3>
              <div className={styles.hours}>
                <div className={styles.hourItem}>
                  <span>Thứ 2 - Chủ nhật</span>
                  <strong>9:00 - 22:00</strong>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3>Lưu ý</h3>
              <ul className={styles.notesList}>
                <li>Đặt bàn trước ít nhất 2 giờ</li>
                <li>Thời gian giữ bàn: 2 giờ</li>
                <li>Vui lòng đến đúng giờ đã đặt</li>
                <li>Hủy đặt bàn trước 1 giờ</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
