export const fillMissingDates = (data, startDate, endDate) => {
  // Tạo map (key-value) để tra cứu nhanh
  const dataMap = {};
  data.forEach((item) => {
    dataMap[item.created_at] = item.count;
  });

  // Kết quả cuối cùng
  const result = [];

  // Duyệt qua từng ngày trong khoảng [startDate, endDate]
  for (
    let d = new Date(startDate);
    d <= new Date(endDate);
    d.setDate(d.getDate() + 1)
  ) {
    const dateStr = d.toISOString().split("T")[0];
    // Nếu dateStr có trong dataMap thì lấy count, không thì gán "0"
    result.push({
      created_at: dateStr,
      count: dataMap[dateStr] || "0",
    });
  }

  return result;
};

export function formatData(data) {
  var total = 0;
  const dataObj = data.reduce((acc, item) => {
    total += parseInt(item.count);
    acc[item.created_at] = parseInt(item.count);
    return acc;
  }, {});
  const result = {
    list: dataObj,
    count: total,
  };
  return result;
}
