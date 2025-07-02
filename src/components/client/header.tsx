"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { LogOut, Search, ShoppingCart, Home, Info, Store, Newspaper, Phone, UserPlus, LogIn } from "lucide-react"
import axios from "axios"

const ClientHeader = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [keyword, setKeyword] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  // Fetch sản phẩm khi gõ từ khóa
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (keyword.trim()) {
        try {
          const res = await axios.get(`http://localhost:4000/products`)
          const filtered = res.data.filter((product: any) => product.name.toLowerCase().includes(keyword.toLowerCase()))
          setSearchResults(filtered.slice(0, 5))
          setShowDropdown(true)
        } catch (error) {
          console.error("Search error:", error)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [keyword])

  const handleSelectProduct = (id: number) => {
    setKeyword("")
    setSearchResults([])
    setShowDropdown(false)
    navigate(`/product/${id}`)
  }

  const navItems = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/about", label: "Giới thiệu", icon: Info },
    { to: "/product", label: "Shop", icon: Store },
    { to: "/news", label: "Tin tức", icon: Newspaper },
    { to: "/call", label: "Liên hệ", icon: Phone },
  ]

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur opacity-50 animate-pulse"></div>
            </div>
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hover:from-cyan-300 hover:to-purple-300 transition-all duration-300"
            >
              LOGO
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-4xl mx-12 relative">
            <div className={`relative transition-all duration-300 ${isSearchFocused ? "scale-105" : ""}`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search
                  className={`h-5 w-5 transition-colors duration-200 ${isSearchFocused ? "text-cyan-400" : "text-gray-400"}`}
                />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-12 pr-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-white placeholder-gray-300 text-xs hover:bg-white/15"
              />

              {/* Search Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-white/10 cursor-pointer transition-all duration-200 flex items-center gap-3 border-b border-white/10 last:border-b-0"
                      onClick={() => handleSelectProduct(item.id)}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-xl shadow-md"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-white text-xs">{item.name}</span>
                        <span className="text-xs text-cyan-300">{item.price?.toLocaleString()} VND</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4 whitespace-nowrap">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group relative text-gray-300 hover:text-cyan-400 transition-all duration-300 flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-white/10"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"></span>
                </Link>
              )
            })}

            {/* Auth Section */}
            <div className="flex items-center space-x-2 ml-6 border-l border-white/20 pl-6">
              {!token ? (
                <>
                  <Link
                    to="/register"
                    className="text-gray-300 hover:text-cyan-400 transition-all duration-300 flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-white/10"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="text-xs font-medium">Đăng ký</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 text-xs font-medium"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Đăng nhập</span>
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 transition-all duration-300 flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-medium">Đăng xuất</span>
                </button>
              )}
            

              {/* Cart */}
              <Link
                to="/carts"
                className="relative p-3 text-gray-300 hover:text-cyan-400 transition-all duration-300 rounded-lg hover:bg-white/10 group"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  3
                </span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default ClientHeader



