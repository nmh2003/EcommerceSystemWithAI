import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import Chart from "react-apexcharts";
import "./AdminDashboard.css";

function AdminDashboard() {

  const [statistics, setStatistics] = useState(null);
  const [salesByDate, setSalesByDate] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth(); // Lấy thông tin user từ Context API

  useEffect(() => {

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statisticsRes, salesByDateRes, usersRes] = await Promise.all([
          fetch("http://localhost:1337/api/orders/statistics", {
            credentials: "include",
          }),
          fetch("http://localhost:1337/api/orders/sales-by-date", {
            credentials: "include",
          }),
          fetch("http://localhost:1337/api/users", {
            credentials: "include",
          }),
        ]);

        if (!statisticsRes.ok) {
          throw new Error("Không thể lấy dữ liệu thống kê");
        }
        if (!salesByDateRes.ok) {
          throw new Error("Không thể lấy dữ liệu biểu đồ");
        }
        if (!usersRes.ok) {
          throw new Error("Không thể lấy dữ liệu người dùng");
        }

        const statisticsData = await statisticsRes.json();
        const salesByDateData = await salesByDateRes.json();
        const usersData = await usersRes.json();

        setStatistics({
          totalRevenue: statisticsData.totalRevenue || 0,
          totalUsers: usersData.users ? usersData.users.length : 0, // Parse Sails.js format
          totalOrders: statisticsData.totalOrders || 0,
        });

        console.log("📊 Sales by date data:", salesByDateData);
        setSalesByDate(salesByDateData);

        console.log("✅ Fetch dashboard data thành công");
      } catch (err) {
        console.error("❌ Lỗi khi fetch dashboard data:", err);

      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData(); // Gọi hàm async
  }, [user]); // Dependency: user (chạy lại khi user thay đổi)

  const formatPriceVN = (price) => {

    return price.toLocaleString("vi-VN") + " đ";
  };

  const formatDateVN = (dateString) => {

    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const options = {
    chart: {
      type: "bar",
      height: 300,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: salesByDate.map((item) => formatDateVN(item.date)),
    },
    yaxis: {
      title: {
        text: "VNĐ",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return formatPriceVN(val);
        },
      },
    },
    colors: ["#00E396"],
  };

  const series = [
    {
      name: "Doanh Thu",
      data: salesByDate.map((item) => parseFloat(item.sales) || 0),
    },
  ];

  return (
    <>

      <AdminMenu />

      <section
        style={{
          marginLeft: window.innerWidth >= 1280 ? "4rem" : "0rem", // xl:ml-[4rem] md:ml-[0rem]
          padding: "20px",
        }}
      >

        <div
          style={{
            width: "80%", // w-[80%]
            display: "flex",
            justifyContent: "space-around", // justify-around
            flexWrap: "wrap", // flex-wrap
            margin: "0 auto",
          }}
        >

          <div
            style={{
              backgroundColor: "#000000", // bg-black
              padding: "20px", // p-5
              width: "320px", // w-[20rem] = 320px
              marginTop: "20px", // mt-5
              borderRadius: "6px", // rounded-lg
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                width: "48px", // w-[3rem]
                height: "48px", // w-[3rem]
                backgroundColor: "#ec4899", // bg-pink-500
                borderRadius: "50%", // rounded-full
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "white",
              }}
            >
              đ
            </div>
            <p
              style={{
                marginTop: "20px", // mt-5
                color: "white",
                marginBottom: "0",
              }}
            >
              Doanh Thu
            </p>
            <h1
              style={{
                fontSize: "24px", // text-xl
                fontWeight: "bold", // font-bold
                color: "white",
                marginTop: "0",
              }}
            >
              {loading ? (
                <Loader />
              ) : (
                formatPriceVN(statistics ? statistics.totalRevenue : 0)
              )}
            </h1>
          </div>

          <div
            style={{
              backgroundColor: "#000000", // bg-black
              padding: "20px", // p-5
              width: "320px", // w-[20rem] = 320px
              marginTop: "20px", // mt-5
              borderRadius: "6px", // rounded-lg
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                width: "48px", // w-[3rem]
                height: "48px", // w-[3rem]
                backgroundColor: "#ec4899", // bg-pink-500
                borderRadius: "50%", // rounded-full
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "white",
              }}
            >
              $
            </div>
            <p
              style={{
                marginTop: "20px", // mt-5
                color: "white",
                marginBottom: "0",
              }}
            >
              Khách Hàng
            </p>
            <h1
              style={{
                fontSize: "24px", // text-xl
                fontWeight: "bold", // font-bold
                color: "white",
                marginTop: "0",
              }}
            >
              {loading ? <Loader /> : statistics ? statistics.totalUsers : 0}
            </h1>
          </div>

          <div
            style={{
              backgroundColor: "#000000", // bg-black
              padding: "20px", // p-5
              width: "320px", // w-[20rem] = 320px
              marginTop: "20px", // mt-5
              borderRadius: "6px", // rounded-lg
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                width: "48px", // w-[3rem]
                height: "48px", // w-[3rem]
                backgroundColor: "#ec4899", // bg-pink-500
                borderRadius: "50%", // rounded-full
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "white",
              }}
            >
              $
            </div>
            <p
              style={{
                marginTop: "20px", // mt-5
                color: "white",
                marginBottom: "0",
              }}
            >
              Tổng Đơn Hàng
            </p>
            <h1
              style={{
                fontSize: "24px", // text-xl
                fontWeight: "bold", // font-bold
                color: "white",
                marginTop: "0",
              }}
            >
              {loading ? <Loader /> : statistics ? statistics.totalOrders : 0}
            </h1>
          </div>
        </div>

        <div
          style={{
            marginLeft: "160px", // ml-[10rem]
            marginTop: "64px", // mt-[4rem]
          }}
        >

          <div
            style={{
              width: "70%", // width="70%"
              margin: "0 auto",
            }}
          >

            <h2
              style={{
                textAlign: "left", // align="left"
                marginBottom: "20px",
                color: "white",
              }}
            >
              Xu Hướng Doanh Thu
            </h2>

            {salesByDate && salesByDate.length > 0 ? (
              <Chart
                options={options}
                series={series}
                type="bar"
                width="100%"
              />
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  padding: "40px",
                }}
              >
                Không có dữ liệu doanh thu
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: "64px", // mt-[4rem]
          }}
        >
          <OrderList />
        </div>
      </section>
    </>
  );
}

export default AdminDashboard;
