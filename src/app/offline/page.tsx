export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">📡</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Không có kết nối Internet
        </h1>
        <p className="text-gray-600 mb-6">
          Vui lòng kiểm tra kết nối mạng của bạn và thử lại.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          🔄 Thử lại
        </button>
      </div>
    </div>
  );
}