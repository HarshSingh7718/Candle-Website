import { useNavigate } from "react-router-dom";
import styles from "./MainBtn.module.css";

function MainBtn({text, onClick, type = "button", path, className = ""}) {

    const navigate = useNavigate();

    const handleClick = () => {
    if (path) {
        navigate(path);
    } else if (onClick) {
        onClick();
    }
};

    return (
       <>
    <button
        type={type}
        className={`${styles.btn} ${className}`}
        onClick={handleClick}
    >
        <span className={styles["btn-text-one"]}>{text}</span>
        <span className={styles["btn-text-two"]}>{text}</span>
    </button>
</>
    )
}

export default MainBtn;