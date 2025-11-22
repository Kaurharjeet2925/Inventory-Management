exports.getProductsDashboard = (req, res) => {
  const user = req.user || {};
  res.json({
    message: "Products dashboard data",
    user: {
      id: user._id || user.id || null,
      name: user.name || null,
      email: user.email || null
    },
    // example dashboard payload
    stats: {
      totalProducts: 120,
      lowStock: 7,
      recentSales: 15
    }
  });
};