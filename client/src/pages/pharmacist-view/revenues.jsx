import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRevenueStats,
  fetchRevenueTrend,
  fetchRevenueForTopSellingCategory,
  fetchTopMedicines,
  fetchRecentTransactions,
} from "../../store/pharmacist/pharmacy-revenue-slice";
import moment from "moment";
export default function Revenues() {
  const dispatch = useDispatch();
  const {
    revenuestats,
    revenuetrend,
    topcategory = [],
    topMedicines,
    recentTransactions,
    isLoading,
  } = useSelector((state) => state.revenue);
  const topCategories = Array.isArray(topcategory)
    ? topcategory.slice(0, 4)
    : [];

  const others = Array.isArray(topcategory) ? topcategory.slice(4) : [];

  const othersTotal = others.reduce((sum, item) => sum + item.totalSales, 0);

  useEffect(() => {
    console.log(topcategory);
    dispatch(fetchRevenueStats());
    dispatch(fetchRevenueTrend());
    dispatch(fetchRevenueForTopSellingCategory());
    dispatch(fetchTopMedicines());
    dispatch(fetchRecentTransactions());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (!revenuestats) return <div>No data yet</div>;
  if (!revenuetrend || revenuetrend.length === 0) {
    return <p>No revenue data available</p>;
  }
  if (!topcategory.length) {
    return <p>No category sales data available</p>;
  }
  if (!recentTransactions || recentTransactions.length === 0)
    return <div>No recent transactions</div>;
  return (
    <div>
      <div>
        <h2>Revenue Stats</h2>
        <p>This month revenue: {revenuestats.revenue.thisMonth}</p>
        <p>Revenue growth: {revenuestats.revenue.growthPercentage}%</p>
        <p>Orders this month: {revenuestats.orders.thisMonth}</p>
        <p>Order growth: {revenuestats.orders.growthPercentage}%</p>
        <p>Average order value: {revenuestats.averageOrderValue}</p>
        <p>
          Top category: {revenuestats.topSellingCategory?.category || "N/A"}
        </p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h2>

        <ul className="space-y-2">
          {revenuetrend.map((item, index) => (
            <li key={index} className="flex justify-between border-b pb-1">
              <span>{item.week}</span>
              <span className="font-medium">Rs. {item.revenue}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Top Categories</h2>

        {topCategories.map((item, index) => (
          <div key={index} className="flex justify-between border-b py-1">
            <span className="capitalize">{item.category}</span>
            <span className="font-medium">Rs. {item.totalSales}</span>
          </div>
        ))}

        {/* Others */}
        {others.length > 0 && (
          <div className="flex justify-between pt-2 mt-2 border-t font-semibold text-gray-700">
            <span>Others</span>
            <span>Rs. {othersTotal}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* TOP SELLING MEDICINES */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">
            Top Selling Medicines (This Month)
          </h2>

          {topMedicines.length === 0 ? (
            <p>No data available</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">Medicine</th>
                  <th>This Month</th>
                  <th>Last Month</th>
                  <th>Stock Sold</th>
                  <th>Growth</th>
                </tr>
              </thead>

              <tbody>
                {topMedicines.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2 font-medium">{item.medicineName}</td>

                    <td>Rs. {item.thisMonthRevenue}</td>

                    <td className="text-gray-600">
                      Rs. {item.lastMonthRevenue}
                    </td>

                    <td>{item.totalStockSold}</td>

                    <td
                      className={
                        item.growthPercentage >= 0
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {item.growthPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/*recent transactions*/}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Recent Completed Transactions
        </h2>
        <ul className="space-y-3">
          {recentTransactions.map((tx, index) => (
            <li
              key={index}
              className="border-b pb-2 flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div>
                <p className="font-medium">{tx.patientName}</p>
                <p className="text-sm text-gray-500">
                  Top Items: {tx.topItems.join(", ")}
                </p>
                <p>{tx.totalStockBought}</p>
              </div>
              <div className="mt-2 md:mt-0 text-right">
                <p className="font-semibold">Rs. {tx.totalAmount}</p>
                <p className="text-sm text-gray-400">
                  {moment(tx.createdAt).fromNow()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
