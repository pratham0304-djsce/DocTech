import { useState } from 'react'
import { Menu, X, HeartPulse } from 'lucide-react'
import { Link } from 'react-router-dom'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Doctors', href: '#departments' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-primary-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo — always navigates to landing page */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-md group-hover:bg-primary-600 transition-colors">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary-700 tracking-tight">
              Doc<span className="text-primary-500">Tech</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300 rounded-full" />
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300 rounded-full" />
                </a>
              )
            )}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-semibold text-primary-600 border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors">
              Login
            </a>
            <a href="/signup" className="text-sm font-semibold text-white bg-primary-500 px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
              Sign Up
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-primary-100 bg-white px-4 py-4 space-y-3 shadow-lg">
          {navLinks.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-primary-600 py-1.5 transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-primary-600 py-1.5 transition-colors"
              >
                {link.label}
              </a>
            )
          )}
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
            <a href="/login" className="text-sm font-semibold text-primary-600 border border-primary-200 px-4 py-2.5 rounded-lg hover:bg-primary-50 transition-colors text-center">
              Login
            </a>
            <a href="/signup" className="text-sm font-semibold text-white bg-primary-500 px-4 py-2.5 rounded-lg hover:bg-primary-600 transition-colors text-center">
              Sign Up
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
