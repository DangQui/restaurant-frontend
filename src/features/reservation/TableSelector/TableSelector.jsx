import { useEffect, useState, useRef } from "react";
import styles from "./TableSelector.module.scss";
import Loading from "@/components/Loading/Loading";

const TableSelector = ({
  date,
  time,
  partySize,
  selectedTable,
  onSelect,
  onLoad,
}) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const onLoadRef = useRef(onLoad);

  // Cập nhật ref mỗi khi onLoad thay đổi
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    if (!date || !time || !partySize || partySize < 1) {
      setTables([]);
      setLoading(false);
      setError(null);
      onLoadRef.current?.([]);
      return;
    }

    const fetchTables = async () => {
      setLoading(true);
      setError(null);
      try {
        const { reservationService } = await import(
          "@/services/reservationService"
        );
        const availableTables = await reservationService.getAvailableTables(
          date,
          time,
          partySize
        );
        setTables(availableTables);
        onLoadRef.current?.(availableTables);
      } catch (err) {
        console.error("Lỗi tải danh sách bàn:", err);
        setError(err.message || "Không thể tải danh sách bàn");
        setTables([]);
        onLoadRef.current?.([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [date, time, partySize]);

  if (!date || !time || !partySize || partySize < 1) {
    return (
      <div className={styles.container}>
        <p className={styles.hint}>
          Vui lòng chọn ngày, giờ và số người để xem bàn trống
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading text="Đang tìm bàn trống..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>
          Không có bàn trống cho thời gian này. Vui lòng chọn thời gian khác.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Chọn bàn ({tables.length} bàn trống)</h3>
      <div className={styles.grid}>
        {tables.map((table) => (
          <button
            key={table.id}
            type="button"
            className={`${styles.tableCard} ${
              selectedTable === table.tableNumber ? styles.selected : ""
            }`}
            onClick={() => onSelect(table.tableNumber)}>
            <div className={styles.tableNumber}>Bàn {table.tableNumber}</div>
            <div className={styles.tableInfo}>
              <span className={styles.capacity}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {table.capacity} người
              </span>
              <span className={styles.zone}>{table.zone || "Indoor"}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableSelector;
