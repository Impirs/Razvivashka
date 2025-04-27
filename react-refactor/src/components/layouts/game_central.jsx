import React, {useState, useEffect} from "react";
import NavButton from "../buttons/nav_btn";

const GameCentralLayout = ({ title, children, left, right }) => {
    const [gameTitle, setTitle] = useState("");
    const {t} = usei18n();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const stack = JSON.parse(sessionStorage.getItem('navStack') || '[]');
        if (stack[stack.length - 1] !== location.pathname) {
            stack.push(location.pathname);
            sessionStorage.setItem('navStack', JSON.stringify(stack));
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchTranslation = async () => {
            if(!t) return;

            const translation = await t(title);
            setTitle(translation);
        };

        fetchTranslation();
    }, [t])

    const handleBack = () => {
        const stack = JSON.parse(sessionStorage.getItem('navStack') || '[]');
        if (stack.length > 1) {
            stack.pop();
            const prev = stack[stack.length - 1];
            sessionStorage.setItem('navStack', JSON.stringify(stack));
            if (prev === "/") {
                sessionStorage.setItem('navStack', JSON.stringify(["/"]));
            }
            navigate(prev);
        } else {
            sessionStorage.setItem('navStack', JSON.stringify(["/"]));
            navigate('/');
        }
    };
    
    const handleSecond = () => {
        if (pageType === "settings") {
            sessionStorage.setItem('navStack', JSON.stringify(["/"]));
            navigate('/');
        } else {
            navigate('/settings');
        }
    };
    return (
        <div className="game-central-layout">
            <div className="game-header">
                <NavButton id="back" value="" onClick={handleBack} />
                <h1>{gameTitle}</h1>
                <NavButton id="settings" value="" onClick={handleSecond} />
            </div>
            <div className="game-content">
                <aside className="game-side left">{left}</aside>
                <main className="game-main">{children}</main>
                <aside className="game-side right">{right}</aside>
            </div>
        </div>
    )
}

export default GameCentralLayout;