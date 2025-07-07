import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { message, Modal } from 'antd'

const Account = () => {
  const [user, setUser] = useState<any>(null)
  const [originalUser, setOriginalUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile'>('profile'); // Chỉ còn tab profile


  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    sdt: '',
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const localUser = localStorage.getItem('user')
    if (!localUser) return

    const { email } = JSON.parse(localUser)

    axios.get(`http://localhost:4000/users?email=${email}`)
      .then((res) => {
        // Nếu trả về mảng, lấy phần tử đầu tiên
        const userData = Array.isArray(res.data) ? res.data[0] : res.data
        if (userData) {
          setUser(userData)
          setOriginalUser(userData)
        } else {
          message.error("Không tìm thấy người dùng. Vui lòng đăng nhập lại.")
          navigate('/login')
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy thông tin người dùng:", err)
        message.error("Lỗi kết nối server. Vui lòng thử lại sau.")
        navigate('/login')
      })
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "datn-xphone")
    formData.append("cloud_name", "dx3ffn8li")

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.secure_url) {
        setUser((prev: any) => ({ ...prev, avatar: data.secure_url }))
        message.success("Cập nhật ảnh đại diện thành công!")
      } else {
        message.error("Upload ảnh thất bại")
      }
    } catch (err) {
      console.error("Lỗi khi upload ảnh:", err)
      message.error("Có lỗi khi upload ảnh lên Cloudinary")
    }
  }

  const handleSave = async () => {
    if (!originalUser || !user) return

    const updatedFields: Partial<typeof user> = {}
    for (const key in user) {
      if (user[key] !== originalUser[key]) {
        updatedFields[key] = user[key]
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      message.info("Không có thay đổi nào để lưu.")
      return
    }

    Modal.confirm({
      title: "Xác nhận sửa thông tin?",
      content: "Bạn có chắc muốn thay đổi thông tin tài khoản?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const { data: updatedUser } = await axios.patch(
            `http://localhost:4000/users/${user._id || user.id}`,
            updatedFields
          )

          setIsEditing(false)
          setOriginalUser(updatedUser)
          setUser(updatedUser)
          localStorage.setItem("user", JSON.stringify(updatedUser))

          message.success("Cập nhật thành công!")
        } catch (error) {
          console.error("Lỗi cập nhật:", error)
          message.error("Cập nhật thất bại.")
        }
      }
    });
  }

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:4000/users', {
        ...registerData,
        role: 'seller'
      })
      message.success("Đăng ký tài khoản bán hàng thành công! Vui lòng đăng nhập.")
      setShowRegisterForm(false)
      setRegisterData({ name: '', email: '', password: '', sdt: '' })
    } catch (error) {
      console.error('Lỗi đăng ký:', error)
      message.error("Đăng ký thất bại, vui lòng thử lại.")
    }
  }

  if (!user) {
    const localUser = localStorage.getItem('user')
    if (!localUser) {
      return (
        <div className="p-10 text-center">
          <p className="mb-4 text-red-600 font-semibold">Bạn chưa đăng nhập.</p>
          <Link to="/login" className="text-blue-600 underline hover:text-blue-800">
            Vui lòng đăng nhập tại đây
          </Link>
          <hr className="my-6" />
          {!showRegisterForm && (
            <p
              onClick={() => setShowRegisterForm(true)}
              className="cursor-pointer text-green-600 font-semibold underline hover:text-green-800"
            >
              Đăng ký tài khoản bán hàng
            </p>
          )}
          {showRegisterForm && (
            <form
              onSubmit={handleRegisterSubmit}
              className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">Form đăng ký tài khoản bán hàng</h2>
              <input type="text" name="name" value={registerData.name} onChange={handleRegisterInputChange} placeholder="Tên đăng nhập" required className="w-full p-2 border border-gray-300 rounded" />
              <input type="email" name="email" value={registerData.email} onChange={handleRegisterInputChange} placeholder="Email" required className="w-full p-2 border border-gray-300 rounded" />
              <input type="password" name="password" value={registerData.password} onChange={handleRegisterInputChange} placeholder="Mật khẩu" required className="w-full p-2 border border-gray-300 rounded" />
              <input type="text" name="sdt" value={registerData.sdt} onChange={handleRegisterInputChange} placeholder="Số điện thoại" required className="w-full p-2 border border-gray-300 rounded" />
              <button type="submit" className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Đăng ký</button>
              <button type="button" onClick={() => setShowRegisterForm(false)} className="w-full py-2 mt-2 bg-gray-300 rounded hover:bg-gray-400 transition">Hủy</button>
            </form>
          )}
        </div>
      )
    }
    return <p className="p-10">Đang tải dữ liệu...</p>
  }

  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 min-h-screen py-10">
      {/* Main content chỉ còn phần hồ sơ */}
      <div className="flex-grow flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 mt-8">
          {/* Hồ sơ của tôi */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <img
                src={user.avatar || 'https://i.pravatar.cc/100?img=3'}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-pink-300 shadow"
              />
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 shadow hover:bg-blue-600 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    title="Đổi ảnh"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" /></svg>
                  </button>
                </>
              )}
            </div>
            <div className="font-bold text-xl mt-3">{user.name}</div>
          </div>
          <h1 className="text-lg font-semibold mb-2 text-center text-pink-600">Hồ sơ cá nhân</h1>
          <div className="divide-y divide-gray-200">
            <InfoRow label="Tên đăng nhập" name="name" value={user.name} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Email" name="email" value={user.email} editable={isEditing} onChange={handleChange} />
            <InfoRow label="SĐT" name="sdt" value={user.sdt || "Chưa cập nhật"} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Địa chỉ" name="address" value={user.address || "Chưa cập nhật"} editable={isEditing} onChange={handleChange} />
            {isEditing ? (
              <div className="flex items-center py-3">
                <div className="w-32 text-gray-500 text-sm">Giới tính</div>
                <select
                  name="gender"
                  value={user.gender || ''}
                  onChange={(e) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                  className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm"
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            ) : (
              <InfoRow
                label="Giới tính"
                name="gender"
                value={user.gender || "Chưa cập nhật"}
                editable={false}
              />
            )}

            {/* Chỉ hiển thị 3 dòng này khi KHÔNG chỉnh sửa */}
            {!isEditing && (
              <>
                <InfoRow label="Vai trò" name="role" value={user.role === 'seller' ? "Thành viên bán hàng" : "Khách hàng"} editable={false} />
                <InfoRow label="Thông báo" name="notification" value={user.notification || 'Không có'} editable={false} />
                <InfoRow
                  label="Trạng thái"
                  name="active"
                  value={
                    user.hasOwnProperty('active')
                      ? (user.active ? 'Đang hoạt động' : 'Bị khóa')
                      : 'Đang hoạt động'
                  }
                  editable={false}
                  className={
                    user.hasOwnProperty('active')
                      ? (user.active ? 'text-green-600' : 'text-red-600')
                      : 'text-green-600'
                  }
                />
              </>
            )}
            <InfoRow label="Ngày sinh" name="dob" value={user.dob || ''} editable={isEditing} onChange={handleChange} />
          </div>
          <div className="flex gap-2 mt-6 justify-center">
            {/* Chỉ hiển thị nút Sửa thông tin, ẩn các nút Lưu và Quay lại khi đang chỉnh sửa */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 bg-yellow-500 text-white rounded-lg font-semibold shadow hover:bg-yellow-600 text-sm"
              >
                Sửa thông tin
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 text-sm"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => {
                    setUser(originalUser);
                    setIsEditing(false);
                  }}
                  className="px-5 py-2 bg-gray-400 text-white rounded-lg font-semibold shadow hover:bg-gray-500 text-sm"
                >
                  Quay lại
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoRow = ({
  label,
  value,
  name,
  onChange,
  editable,
  className = ''
}: {
  label: string
  value: string
  name: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  editable?: boolean
  className?: string
}) => (
  <div className="flex items-center py-3">
    <div className="w-32 text-gray-500 text-sm">{label}</div>
    {editable ? (
      <input
        type="text"
        name={name}
        value={value || ''} // Nếu không có giá trị, sẽ là chuỗi rỗng
        placeholder="Chưa cập nhật" // Placeholder là 'Chưa cập nhật'
        onChange={onChange}
        className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm"
      />
    ) : (
      <div className={`flex-grow text-base font-medium text-gray-800 ${className}`}>
        {value || 'Chưa cập nhật'}
      </div>
    )}
  </div>
)


export default Account
