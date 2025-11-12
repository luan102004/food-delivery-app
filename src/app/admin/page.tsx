{/* Quick Actions */}
<div className="grid md:grid-cols-3 gap-6">
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Quản lý người dùng
    </h3>
    <ul className="space-y-2">
      <li>
        <a href="/admin/users" className="text-blue-600 hover:underline">
          👥 Danh sách người dùng
        </a>
      </li>
      <li>
        <a href="/admin/users?role=restaurant" className="text-blue-600 hover:underline">
          🏪 Chủ nhà hàng
        </a>
      </li>
      <li>
        <a href="/admin/users?role=driver" className="text-blue-600 hover:underline">
          🚗 Tài xế
        </a>
      </li>
    </ul>
  </div>

  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Quản lý nhà hàng
    </h3>
    <ul className="space-y-2">
      <li>
        <a href="/admin/restaurants" className="text-blue-600 hover:underline">
          🏪 Danh sách nhà hàng
        </a>
      </li>
      <li>
        <a href="/admin/restaurants/assign" className="text-blue-600 hover:underline">
          ➕ Gán nhà hàng mới
        </a>
      </li>
    </ul>
  </div>

  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Báo cáo & Thống kê
    </h3>
    <ul className="space-y-2">
      <li>
        <a href="/admin/reports" className="text-blue-600 hover:underline">
          📊 Báo cáo doanh thu
        </a>
      </li>
      <li>
        <a href="/admin/analytics" className="text-blue-600 hover:underline">
          📈 Phân tích hệ thống
        </a>
      </li>
      <li>
        <a href="/admin/promotions" className="text-blue-600 hover:underline">
          🎫 Quản lý khuyến mãi
        </a>
      </li>
    </ul>
  </div>
</div>