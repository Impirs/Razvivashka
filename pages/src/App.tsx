import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import Install from './pages/Install'
import Docs from './pages/Docs'

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/welcome" replace />} />
                        <Route path="/welcome" element={<Welcome />} />
                        <Route path="/install" element={<Install />} />
                        <Route path="/docs" element={<Docs />} />
                    </Routes>
                </Layout>
            </LanguageProvider>
        </ThemeProvider>
    )
}

export default App
