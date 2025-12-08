import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/Button/Button";
import styles from "./Contact.module.scss";

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    toast.success("Cảm ơn bạn, chúng tôi đã nhận được thông tin liên hệ.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const handleViewMap = () => {
    window.open(
      "https://www.google.com/maps/place/Hoan+Kiem+Lake/@21.028779,105.848253,15z",
      "_blank"
    );
  };

  return (
    <div className={styles.page}>
      <section className={styles.topSection}>
        <div className={styles.infoColumn}>
          <p className={styles.eyebrow}>Liên hệ</p>
          <h1 className={styles.title}>Chúng tôi ở đâu?</h1>
          <p className={styles.description}>
            WowWraps tọa lạc tại trung tâm thành phố, dễ dàng di chuyển và thuận
            tiện cho mọi cuộc hẹn. Không gian ấm cúng, hiện đại, phù hợp cho cả
            những buổi gặp gỡ thân mật lẫn những dịp đặc biệt.
          </p>

          <div className={styles.infoBlock}>
            <p className={styles.infoTitle}>Địa chỉ</p>
            <p className={styles.infoText}>
              18 Ngô Quyền, Hoàn Kiếm, Hà Nội
              <br />
              (Gần hồ Hoàn Kiếm)
            </p>
          </div>

          <div className={styles.infoGrid}>
            <div>
              <p className={styles.infoTitle}>Giờ mở cửa</p>
              <p className={styles.infoText}>
                Thứ 2 – Thứ 6: 10:00 – 22:00
                <br />
                Thứ 7 – Chủ nhật: 09:00 – 23:00
              </p>
            </div>
            <div>
              <p className={styles.infoTitle}>Liên hệ</p>
              <p className={styles.infoText}>
                Điện thoại: 1900 636 678
                <br />
                Email: booking@wowwraps.vn
              </p>
            </div>
          </div>

          <Button variant="primary" size="md" onClick={handleViewMap}>
            Xem trên Google Maps
          </Button>
        </div>

        <div className={styles.imageColumn}>
          <div className={styles.heroImage}>
            <img
              src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=900&h=900&fit=crop"
              alt="Không gian nhà hàng"
            />
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formHeader}>
          <h2>Gửi lời nhắn cho chúng tôi</h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi, góp ý hay yêu cầu đặt tiệc riêng, hãy để
            lại thông tin. Đội ngũ của chúng tôi sẽ phản hồi trong thời gian sớm
            nhất.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label className={styles.field}>
              <span>
                Họ và tên <span className={styles.required}>*</span>
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                required
              />
            </label>

            <label className={styles.field}>
              <span>
                Email <span className={styles.required}>*</span>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Chủ đề</span>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Ví dụ: Đặt bàn sinh nhật, góp ý dịch vụ..."
            />
          </label>

          <label className={styles.field}>
            <span>
              Nội dung <span className={styles.required}>*</span>
            </span>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Hãy cho chúng tôi biết bạn cần gì..."
              required
            />
          </label>

          <div className={styles.actions}>
            <Button type="submit" variant="primary" size="md">
              Gửi lời nhắn
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ContactPage;
