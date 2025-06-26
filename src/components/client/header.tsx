"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Search, ShoppingCart, Home, Info, Store, Newspaper, Phone, UserPlus, LogIn, LogOut } from "lucide-react"

const ClientHeader = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const navItems = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/about", label: "Giới thiệu", icon: Info },
    { to: "/product", label: "Shop", icon: Store },
    { to: "/news", label: "Tin tức", icon: Newspaper },
    { to: "/call", label: "Liên hệ", icon: Phone },
  ]

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-md border-b border-purple-800/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-12 gap-4 items-center h-20">
          {/* Logo - 2 columns */}
          <div className="col-span-2 flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              LOGO
            </span>
          </div>

          {/* Search Bar - 4 columns */}
          <div className="col-span-3">
            <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? "scale-105" : ""}`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search
                  className={`h-5 w-5 transition-colors duration-200 ${isSearchFocused ? "text-cyan-400" : "text-gray-400"}`}
                />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
                className="w-full pl-12 pr-6 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-300 text-sm"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Navigation & Auth - 6 columns */}
          <div className="col-span-7 flex items-center justify-end space-x-4">
            {/* Navigation */}
            <nav className="flex items-center space-x-3 whitespace-nowrap">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group relative text-gray-300 hover:text-cyan-400 transition-all duration-200 flex items-center space-x-1 flex-shrink-0"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                  </Link>
                )
              })}
            </nav>

            {/* Auth & Cart */}
            <div className="flex items-center space-x-2 whitespace-nowrap">
              {!token ? (
                <>
                  <Link
                    to="/register"
                    className="text-gray-300 hover:text-cyan-400 transition-all duration-200 font-medium flex items-center space-x-1 flex-shrink-0"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="text-sm">Đăng ký</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium flex items-center space-x-1 flex-shrink-0"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="text-sm">Đăng nhập</span>
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 transition-all duration-200 font-medium flex items-center space-x-1 flex-shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              )}

              <Link
                to="/carts"
                className="relative p-2 text-gray-300 hover:text-cyan-400 transition-all duration-200 flex-shrink-0"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                  3
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ClientHeader
