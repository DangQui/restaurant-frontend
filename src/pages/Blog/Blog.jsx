import { useState } from "react";
import styles from "./Blog.module.scss";

// Dữ liệu blog cứng bằng tiếng Việt
const blogData = {
  featured: {
    id: 1,
    title:
      "Tất Cả Những Điều Bạn Cần Biết Về Vai Trò Ngày Càng Tăng Của AI Trong Nhà Hàng",
    summary:
      "Hãy tưởng tượng bạn đang ngồi trong một nhà hàng, đặt món qua máy tính bảng trên bàn, và ngay lập tức nhận được thông báo rằng món ăn của bạn đang được chuẩn bị. Đây không còn là tương lai - đây là hiện tại với sự trợ giúp của trí tuệ nhân tạo (AI) trong ngành nhà hàng.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop",
    date: "6 tháng 8, 2024",
    author: "Admin",
    category: "Công Nghệ",
  },
  articles: [
    {
      id: 2,
      title: "Dự Báo Bữa Sáng: Nắng Hay Mây?",
      summary:
        "Phân tích xu hướng bữa sáng trong ngành nhà hàng và cách các nhà hàng đang thích ứng với thay đổi thói quen ăn uống của khách hàng.",
      image:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
      date: "6 tháng 8, 2024",
      author: "Admin",
      category: "Xu Hướng",
    },
    {
      id: 3,
      title: "Tuyển Dụng Nhanh (Nhưng An Toàn) Khi Nhu Cầu Ăn Uống Tăng Cao",
      summary:
        "Hướng dẫn các nhà hàng cách tuyển dụng nhân viên một cách hiệu quả và an toàn trong thời kỳ nhu cầu tăng cao sau đại dịch.",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop",
      date: "5 tháng 8, 2024",
      author: "Admin",
      category: "Nhân Sự",
    },
    {
      id: 4,
      title: "5 Cách Công Nghệ Nhà Hàng Tạo Nên Hoặc Phá Vỡ Doanh Nghiệp",
      summary:
        "Công nghệ có thể là công cụ mạnh mẽ nhất của bạn hoặc trở thành gánh nặng lớn nhất. Tìm hiểu cách sử dụng công nghệ một cách thông minh.",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
      date: "4 tháng 8, 2024",
      author: "Admin",
      category: "Công Nghệ",
    },
    {
      id: 5,
      title: "Tiết Kiệm Hàng Tồn Kho, Thời Gian Và Chi Phí Lao Động Với IoT",
      summary:
        "Internet of Things (IoT) đang cách mạng hóa cách các nhà hàng quản lý hàng tồn kho và tối ưu hóa hoạt động hàng ngày.",
      image:
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop",
      date: "3 tháng 8, 2024",
      author: "Admin",
      category: "Quản Lý",
    },
    {
      id: 6,
      title: "Sử Dụng Video Trực Tiếp Để Giới Thiệu Nhà Hàng Của Bạn",
      summary:
        "Video trực tiếp là cách tuyệt vời để kết nối với khách hàng và cho họ thấy những gì đang diễn ra trong nhà bếp của bạn.",
      image:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop",
      date: "2 tháng 8, 2024",
      author: "Admin",
      category: "Marketing",
    },
    {
      id: 7,
      title: "Chương Trình Phúc Lợi Tài Chính Cho Nhà Hàng",
      summary:
        "Các chương trình phúc lợi tài chính có thể giúp thu hút và giữ chân nhân viên tốt nhất trong ngành nhà hàng.",
      image:
        "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&h=400&fit=crop",
      date: "1 tháng 8, 2024",
      author: "Admin",
      category: "Nhân Sự",
    },
    {
      id: 8,
      title: "Xu Hướng Thực Đơn Mùa Hè 2024: Món Ăn Nào Đang Hot?",
      summary:
        "Khám phá các xu hướng thực đơn mùa hè mới nhất và cách các nhà hàng đang tận dụng chúng để thu hút khách hàng.",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      date: "31 tháng 7, 2024",
      author: "Admin",
      category: "Xu Hướng",
    },
    {
      id: 9,
      title: "Quản Lý Chi Phí Thực Phẩm: Bí Quyết Từ Các Chuyên Gia",
      summary:
        "Học cách quản lý chi phí thực phẩm hiệu quả từ các chuyên gia trong ngành để tối đa hóa lợi nhuận.",
      image:
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
      date: "30 tháng 7, 2024",
      author: "Admin",
      category: "Quản Lý",
    },
    {
      id: 10,
      title: "Xây Dựng Thương Hiệu Nhà Hàng Trên Mạng Xã Hội",
      summary:
        "Mạng xã hội là công cụ mạnh mẽ để xây dựng thương hiệu. Tìm hiểu cách tận dụng tối đa các nền tảng này.",
      image:
        "https://images.unsplash.com/photo-1552569975-48b1c3b73e4e?w=600&h=400&fit=crop",
      date: "29 tháng 7, 2024",
      author: "Admin",
      category: "Marketing",
    },
    {
      id: 11,
      title: "Bền Vững Trong Ngành Nhà Hàng: Từ Ý Tưởng Đến Thực Tế",
      summary:
        "Các nhà hàng đang ngày càng quan tâm đến tính bền vững. Khám phá các cách thực tế để áp dụng.",
      image:
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
      date: "28 tháng 7, 2024",
      author: "Admin",
      category: "Bền Vững",
    },
    {
      id: 12,
      title: "Dịch Vụ Khách Hàng Xuất Sắc: Nghệ Thuật Làm Hài Lòng Khách",
      summary:
        "Dịch vụ khách hàng là trái tim của mọi nhà hàng thành công. Học cách tạo trải nghiệm đáng nhớ.",
      image:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
      date: "27 tháng 7, 2024",
      author: "Admin",
      category: "Dịch Vụ",
    },
  ],
};

const ITEMS_PER_PAGE = 6;

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(blogData.articles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentArticles = blogData.articles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <span className={styles.pill}>Blog</span>
          <h1 className={styles.title}>Blog Quản Lý & Phát Triển Nhà Hàng</h1>
          <p className={styles.subtitle}>
            Khám phá những bài viết mới nhất về quản lý nhà hàng, xu hướng ẩm
            thực, công nghệ và nhiều hơn nữa từ đội ngũ chuyên gia của chúng
            tôi.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        {/* Featured Article */}
        <article className={styles.featured}>
          <div className={styles.featuredImage}>
            <img src={blogData.featured.image} alt={blogData.featured.title} />
          </div>
          <div className={styles.featuredContent}>
            <div className={styles.meta}>
              <span className={styles.category}>
                {blogData.featured.category}
              </span>
              <span className={styles.separator}>•</span>
              <span className={styles.date}>{blogData.featured.date}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.author}>
                Bởi {blogData.featured.author}
              </span>
            </div>
            <h2 className={styles.featuredTitle}>{blogData.featured.title}</h2>
            <p className={styles.featuredSummary}>
              {blogData.featured.summary}
            </p>
            <a href="#" className={styles.readMore}>
              Đọc thêm →
            </a>
          </div>
        </article>

        {/* Articles Grid */}
        <div className={styles.articlesGrid}>
          {currentArticles.map((article) => (
            <article key={article.id} className={styles.articleCard}>
              <div className={styles.articleImage}>
                <img src={article.image} alt={article.title} />
              </div>
              <div className={styles.articleContent}>
                <div className={styles.meta}>
                  <span className={styles.date}>{article.date}</span>
                  <span className={styles.separator}>•</span>
                  <span className={styles.author}>Bởi {article.author}</span>
                </div>
                <h3 className={styles.articleTitle}>{article.title}</h3>
                <p className={styles.articleSummary}>{article.summary}</p>
                <a href="#" className={styles.readMore}>
                  Đọc thêm →
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}>
              ← Trước
            </button>
            <div className={styles.paginationNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`${styles.paginationNumber} ${
                      currentPage === page ? styles.active : ""
                    }`}
                    onClick={() => handlePageChange(page)}>
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}>
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <div className={styles.newsletterImage}>
            <img
              src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=400&fit=crop"
              alt="Newsletter"
            />
          </div>
          <div className={styles.newsletterForm}>
            <h2 className={styles.newsletterTitle}>
              Đăng Ký Nhận Bản Tin & Nhận Tin Tức Mới Nhất
            </h2>
            <p className={styles.newsletterDescription}>
              Nhận quyền truy cập độc quyền vào tin tức, mẹo và xu hướng mới
              nhất từ ngành nhà hàng.
            </p>
            <form
              className={styles.newsletterFormContainer}
              onSubmit={(e) => {
                e.preventDefault();
                alert("Cảm ơn bạn đã đăng ký!");
              }}>
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                className={styles.newsletterInput}
                required
              />
              <button type="submit" className={styles.newsletterButton}>
                →
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
