
async function paginate(model, filter = {}, req, populate = null, sort = { createdAt: -1 }) {
  
  // 1️⃣ page & limit (safe defaults)
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 8, 1);
  const skip = (page - 1) * limit;

  // 2️⃣ total count
  const totalItems = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);

  // 3️⃣ base query
  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  // 4️⃣ apply populate (optional)
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((p) => {
        query = query.populate(p);
      });
    } else {
      query = query.populate(populate);
    }
  }

  // 5️⃣ fetch data
  const data = await query;

  return {
    page,
    limit,
    totalItems,
    totalPages,
    data,
  };
}

module.exports = paginate;
