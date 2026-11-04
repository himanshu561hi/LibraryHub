import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FacilitiesPage from './pages/FacilitiesPage';
import MembershipPage from './pages/MembershipPage';
import GalleryPage from './pages/GalleryPage';
import RulesPage from './pages/RulesPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="facilities" element={<FacilitiesPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="faqs" element={<FaqPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

