import { forwardRef } from "react";
import clsx from "clsx";
import styles from "./Textarea.module.scss";

const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={clsx(styles.textarea, className)}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
