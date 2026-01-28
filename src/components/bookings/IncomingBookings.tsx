import React from "react";

const IncomingBookings = () => {
  // Contoh data booking, nanti bisa diganti dengan data asli dari backend/Supabase
  const bookings = [
    { id: 1, nama: "Penyewa A", tanggal: "2024-06-10", status: "Menunggu Konfirmasi" },
    { id: 2, nama: "Penyewa B", tanggal: "2024-06-12", status: "Dikonfirmasi" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Booking Masuk</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Nama Penyewa</th>
            <th className="py-2 px-4 border">Tanggal</th>
            <th className="py-2 px-4 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="py-2 px-4 border">{booking.nama}</td>
              <td className="py-2 px-4 border">{booking.tanggal}</td>
              <td className="py-2 px-4 border">{booking.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomingBookings;