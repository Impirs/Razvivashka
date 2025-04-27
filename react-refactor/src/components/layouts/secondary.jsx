import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import NavButton from '../buttons/nav_btn';
import usei18n from '../../hooks/usei18n';

const SecondaryLayout = ({ pageType }) => {
    const [title, setTitle] = useState("");
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

            const translation = await t(pageType);
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
        <div className='secondary-layout'>
            <div className='layout-header'>
                <NavButton id="back" value="" onClick={handleBack} />
                <h1>{title}</h1>
                <NavButton
                    id={pageType === "settings" ? "home" : "settings"}
                    value=""
                    onClick={handleSecond}
                />
            </div>
            <div className='layout-content'>
                <Outlet />
            </div>
        </div>
    );
};

export default SecondaryLayout;