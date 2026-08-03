"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, Bell, Search, ChevronDown } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const menuItems = [
    { id: 'platform', label: 'Platform', items: ['Clinical Intelligence', 'HMIS', 'EMR', 'Telemedicine', 'Analytics'] },
    { id: 'solutions', label: 'Solutions', items: ['Hospitals', 'Clinics', 'Private Practice', 'Telemedicine', 'Medical Schools', 'Research', 'Public Health', 'Governments', 'NGOs', 'Flying Doctors', 'Insurance'] },
    { id: 'users', label: 'Users', items: ['Doctors', 'Nurses', 'Clinical Officers', 'Students', 'Researchers', 'Pharmacists', 'Laboratory', 'Radiology', 'Administrators', 'Patients', 'Families', 'Government', 'ICT', 'Developers', 'Partners'] },
    { id: 'resources', label: 'Resources', items: ['Documentation', 'API', 'FHIR', 'HL7', 'DICOM', 'SMART', 'Support', 'Community', 'Market', 'Education', 'Research'] },
    { id: 'developers', label: 'Developers', items: ['SDK', 'API', 'FHIR', 'HL7', 'DICOM', 'OpenEHR', 'Plugin', 'Marketplace', 'Documentation', 'Guides'] },
    { id: 'marketplace', label: 'Marketplace', items: ['Apps', 'Plugins', 'AI', 'Plugins', 'Modules', 'Themes', 'Integrations', 'SDKs'] },
  ];

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-lg backdrop-blur-md' : 'bg-transparent'} `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AMEXAN</span>
            </div>
            <span className="text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}">AMEXAN</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((menu) => (
              <div key={menu.id} className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown(menu.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'} `}
                >
                  {menu.label}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {activeDropdown === menu.id && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {menu.items.map((item) => (
                      <Link
                        key={item}
                        href={`/solutions/${menu.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/register" className="text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'}">Get Started</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-900 bg-white p-2 rounded-lg shadow-lg"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 mt-20">
            <div className="px-4 py-2 space-y-2">
              {menuItems.map((menu) => (
                <div key={menu.id} className="py-2">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === menu.id ? null : menu.id)}
                    className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                  >
                    {menu.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {activeDropdown === menu.id && (
                    <div className="pl-4 mt-2 space-y-1">
                      {menu.items.map((item) => (
                        <Link
                          key={item}
                          href={`/solutions/${menu.id}`}
                          className="block py-1 text-sm text-gray-600 hover:text-blue-600"
                          onClick={closeMenu}
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/register" className="block py-2 text-sm font-medium text-blue-600" onClick={closeMenu}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}