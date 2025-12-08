import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Button/Button";
import Loading from "@/components/Loading/Loading";
import { useMenuItemDetail } from "@/hooks/useMenuItemDetail";
import { useMenuItems } from "@/hooks/useMenuItems";
import { createRating } from "@/services/menuService";
import { formatCurrency } from "@/utils/formatCurrency";
import { useCartContext } from "@/store/CartContext";
import { useAuthContext } from "@/store/AuthContext";
import styles from "./Product.module.scss";

const RatingStars = ({ score = 0 }) => {
  const activeStars = Math.round(score);
  return (
    <div
      className={styles.stars}
      aria-label={`Đánh giá ${score.toFixed(1)} trên 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} data-active={index < activeStars}>
          ★
        </span>
      ))}
      <span className={styles.score}>{score.toFixed(1)}</span>
    </div>
  );
};

const initialReview = {
  name: "",
  email: "",
  website: "",
  comment: "",
  rating: 5,
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [detailRefresh, setDetailRefresh] = useState(0);
  const [reviewForm, setReviewForm] = useState(initialReview);
  const [reviewStatus, setReviewStatus] = useState({
    submitting: false,
    error: null,
    success: null,
  });
  const [reviewErrors, setReviewErrors] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    comment: false,
  });
  const { addItemToCart } = useCartContext();
  const { isAuthenticated, openAuthModal } = useAuthContext();

  const {
    data: product,
    initialLoading,
    error,
  } = useMenuItemDetail(productId, detailRefresh);

  const relatedParams = useMemo(() => {
    if (!product) return null;
    return {
      category: product.category,
      limit: 3,
      excludeId: product.id,
      sortBy: "orderIndex",
    };
  }, [product]);

  const { data: relatedItems } = useMenuItems(relatedParams || { limit: 0 });

  const handleQuantity = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleReviewChange = (field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
    if (reviewErrors[field]) {
      setReviewErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleReviewBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    // Validate khi blur
    let error = "";
    if (field === "name" && !reviewForm.name.trim()) {
      error = "Vui lòng nhập họ tên";
    } else if (field === "email") {
      if (!reviewForm.email.trim()) {
        error = "Vui lòng nhập email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewForm.email)) {
        error = "Email không hợp lệ";
      }
    } else if (field === "comment" && !reviewForm.comment.trim()) {
      error = "Vui lòng viết một vài cảm nhận";
    }

    setReviewErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!product) return;

    // Validate tất cả fields
    const errors = {};
    if (!reviewForm.name.trim()) {
      errors.name = "Vui lòng nhập họ tên";
    }
    if (!reviewForm.email.trim()) {
      errors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewForm.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!reviewForm.comment.trim()) {
      errors.comment = "Vui lòng viết một vài cảm nhận";
    }

    setReviewErrors(errors);
    setTouchedFields({ name: true, email: true, comment: true });

    if (Object.keys(errors).length > 0) {
      setReviewStatus({
        submitting: false,
        error: "Vui lòng điền đầy đủ thông tin.",
        success: null,
      });
      return;
    }

    setReviewStatus({ submitting: true, error: null, success: null });
    try {
      await createRating({
        menuItemId: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      setReviewStatus({
        submitting: false,
        error: null,
        success: "Cảm ơn bạn đã gửi đánh giá!",
      });
      setReviewForm(initialReview);
      setReviewErrors({ name: "", email: "", comment: "" });
      setTouchedFields({ name: false, email: false, comment: false });
      setDetailRefresh((value) => value + 1);
    } catch (submissionError) {
      setReviewStatus({
        submitting: false,
        error: submissionError.message || "Không thể gửi đánh giá lúc này.",
        success: null,
      });
    }
  };

  if (initialLoading) {
    return <Loading fullScreen text="Đang tải thông tin món ăn..." />;
  }

  if (error || !product) {
    return (
      <section className={styles.state}>
        <p>{error || "Không tìm thấy món ăn bạn yêu cầu."}</p>
        <Button onClick={() => navigate("/menu")}>Quay lại thực đơn</Button>
      </section>
    );
  }

  const ratingCount = product.ratings?.length || 0;
  const descriptionText =
    product.description ||
    "Chúng tôi chuẩn bị món ăn này mỗi ngày với nguyên liệu địa phương tươi mới, kết hợp kỹ thuật nấu chậm để giữ trọn hương vị.";
  const coverImage =
    product.imageUrl ||
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    addItemToCart({
      menuItemId: product.id,
      price: product.price,
      quantity,
      name: product.name,
      meta: {
        imageUrl: coverImage,
        description: product.description,
        category: product.category,
      },
    });
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.media}>
          <img src={coverImage} alt={product.name} />
        </div>

        <div className={styles.details}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/menu">Thực đơn</Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>

          <h1>{product.name}</h1>

          <div className={styles.ratingRow}>
            <RatingStars score={product.averageRating || 0} />
            <span className={styles.ratingMeta}>({ratingCount} đánh giá)</span>
          </div>

          <p className={styles.price}>{formatCurrency(product.price)}</p>

          <p className={styles.description}>{descriptionText}</p>

          <div className={styles.ctaRow}>
            <div className={styles.quantity}>
              <button
                type="button"
                onClick={() => handleQuantity(-1)}
                aria-label="Giảm số lượng">
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => handleQuantity(1)}
                aria-label="Tăng số lượng">
                +
              </button>
            </div>
            <Button size="lg" onClick={handleAddToCart}>
              Thêm vào giỏ
            </Button>
          </div>

          <ul className={styles.meta}>
            <li>
              <span>SKU</span>
              <strong>{product.sku || "Đang cập nhật"}</strong>
            </li>
            <li>
              <span>Danh mục</span>
              <strong>{product.category}</strong>
            </li>
            <li>
              <span>Nhãn</span>
              <strong>{(product.tags || []).join(", ") || "Theo mùa"}</strong>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.tabs}>
        <div className={styles.tabHeader}>
          <button
            type="button"
            data-active={activeTab === "description"}
            onClick={() => setActiveTab("description")}>
            Mô tả
          </button>
          <button
            type="button"
            data-active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}>
            Đánh giá ({ratingCount})
          </button>
        </div>

        <div className={styles.tabBody}>
          {activeTab === "description" ? (
            <div className={styles.richText}>
              <p>{descriptionText}</p>
              <p>
                Món ăn được hoàn thiện với kỹ thuật slow-cook để giữ trọn cấu
                trúc nguyên bản. Khi phục vụ, đầu bếp sẽ hoàn thiện tại bàn với
                sốt đặc chế để đảm bảo trải nghiệm của bạn là độc nhất.
              </p>
            </div>
          ) : (
            <div className={styles.reviews}>
              {ratingCount === 0 ? (
                <p>
                  Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm món ăn
                  này!
                </p>
              ) : (
                product.ratings.map((rating) => (
                  <article key={rating.id}>
                    <RatingStars score={rating.rating} />
                    <p>
                      {rating.comment || "Khách hàng không để lại bình luận."}
                    </p>
                    <span>
                      {new Date(rating.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </article>
                ))
              )}
              <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
                <h3>Thêm đánh giá</h3>
                <p className={styles.formHint}>
                  Email của bạn sẽ không được công bố. Các trường * là bắt buộc.
                </p>
                <div className={styles.formGrid}>
                  <label className={styles.inputGroup}>
                    <span>Họ tên *</span>
                    <input
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) =>
                        handleReviewChange("name", e.target.value)
                      }
                      onBlur={() => handleReviewBlur("name")}
                      className={
                        touchedFields.name && reviewErrors.name
                          ? styles.inputError
                          : ""
                      }
                      required
                    />
                    {touchedFields.name && reviewErrors.name && (
                      <span className={styles.fieldError}>
                        {reviewErrors.name}
                      </span>
                    )}
                  </label>
                  <label className={styles.inputGroup}>
                    <span>Email *</span>
                    <input
                      type="email"
                      value={reviewForm.email}
                      onChange={(e) =>
                        handleReviewChange("email", e.target.value)
                      }
                      onBlur={() => handleReviewBlur("email")}
                      className={
                        touchedFields.email && reviewErrors.email
                          ? styles.inputError
                          : ""
                      }
                      required
                    />
                    {touchedFields.email && reviewErrors.email && (
                      <span className={styles.fieldError}>
                        {reviewErrors.email}
                      </span>
                    )}
                  </label>
                  <label className={styles.inputGroup}>
                    <span>Website</span>
                    <input
                      type="url"
                      value={reviewForm.website}
                      onChange={(e) =>
                        handleReviewChange("website", e.target.value)
                      }
                      placeholder="https://example.com"
                    />
                  </label>
                </div>

                <div className={styles.ratingInput}>
                  <span>Đánh giá của bạn *</span>
                  <div className={styles.ratingSelector}>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const starValue = index + 1;
                      return (
                        <button
                          type="button"
                          key={starValue}
                          data-active={starValue <= reviewForm.rating}
                          onClick={() =>
                            handleReviewChange("rating", starValue)
                          }>
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className={styles.inputGroup}>
                  <span>Nhận xét *</span>
                  <textarea
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      handleReviewChange("comment", e.target.value)
                    }
                    onBlur={() => handleReviewBlur("comment")}
                    className={
                      touchedFields.comment && reviewErrors.comment
                        ? styles.inputError
                        : ""
                    }
                    required
                  />
                  {touchedFields.comment && reviewErrors.comment && (
                    <span className={styles.fieldError}>
                      {reviewErrors.comment}
                    </span>
                  )}
                </label>

                <label className={styles.checkbox}>
                  <input type="checkbox" />
                  <span>Lưu tên và email cho những lần nhận xét sau.</span>
                </label>

                {reviewStatus.error ? (
                  <p className={styles.formError}>{reviewStatus.error}</p>
                ) : null}
                {reviewStatus.success ? (
                  <p className={styles.formSuccess}>{reviewStatus.success}</p>
                ) : null}

                <Button type="submit" disabled={reviewStatus.submitting}>
                  {reviewStatus.submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>

      <section className={styles.related}>
        <div className={styles.relatedHead}>
          <span className="pill">Thực đơn</span>
          <h2>Món liên quan</h2>
        </div>
        <div className={styles.relatedGrid}>
          {relatedItems && relatedItems.length > 0 ? (
            relatedItems.map((item) => (
              <article key={item.id} className={styles.relatedCard}>
                <Link to={`/menu/${item.id}`}>
                  <img
                    src={
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={item.name}
                    loading="lazy"
                  />
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.description || `Phục vụ vào bữa ${item.category}.`}
                    </p>
                    <strong>{formatCurrency(item.price)}</strong>
                  </div>
                </Link>
              </article>
            ))
          ) : (
            <p className={styles.state}>Chưa có món liên quan.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
