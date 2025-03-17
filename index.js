import express from "express";
import db from "./db/config.js";
import { PostResponse, GetResponse } from "./response/response.js";
import multer from "multer";
import { fillMissingDates, formatData } from "./utils/helper.js";
import dotenv from "dotenv"

const app = express();
dotenv.config();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer();
app.use(upload.none());

// api lưu lại hành động của người dùng
// @param
// device_name string (thiết bị thực hiện thao tác)
// action_name string (tên hành động)
app.post("/user/action", async (req, res) => {
  try {
    const { device_name, action_name } = req.body;
    if (device_name && action_name) {
      var created_at = new Date().toISOString().split('T')[0];

      await db.execute(
        "UPDATE user_action_statistic SET count = count + 1 WHERE device_name = ? AND action_name = ? AND created_at = ?",
        [device_name, action_name, created_at],
        { prepare: true }
      );

      await db.execute(
        "UPDATE user_action SET count = count + 1 WHERE action_name = ? AND created_at = ?",
        [action_name, created_at],
        { prepare: true }
      );
      res.status(200).json(new PostResponse("success", "Lưu thành công!"));
    } else {
      throw new Error("Lưu không thành công!");
    }
  } catch (error) {
    res.status(400).json(new PostResponse("fail", error.message));
  }
});

// api lấy thống kê theo hành động của người dùng
// @param
// start_date string(YYYY-MM-DD) (ngày bắt đầu lấy số liệu)
// end_date string(YYYY-MM-DD) (ngày cuối cùng lấy số liệu)
// action_name string (tên hành động cần thống kê)
app.get("/user/action/statistic", async (req, res) => {
  try {
    const { start_date, end_date, action_name } = req.query;
    if (start_date && end_date) {
      var query =
        "select count, created_at from user_action where action_name = ? and created_at >= ? and created_at <= ? allow filtering";
      // Chuyển đổi chuỗi yyyy-mm-dd thành timestamp
      const startTimestamp = new Date(start_date); // Bắt đầu ngày
      const endTimestamp = new Date(end_date); // Kết thúc ngày
      if (!action_name) {
        throw new Error("Vui lòng chọn hành động cần thống kê");
      }
      var params = [action_name, startTimestamp, endTimestamp];
      const result = await db.execute(query, params, { prepare: true });
      var data = fillMissingDates(result.rows, start_date, end_date);
      data = formatData(data);
      res
        .status(200)
        .json(new GetResponse("success", "lấy dữ liệu thành công", data));
    } else {
      throw new Error("Vui lòng chọn ngày tháng để thống kê");
    }
  } catch (error) {
    res.status(400).json(new GetResponse("fail", error.message, []));
  }
});


// api lấy thống kê theo thiết bị và hành động của người dùng
// @param
// start_date string(YYYY-MM-DD) (ngày bắt đầu lấy số liệu)
// end_date string(YYYY-MM-DD) (ngày cuối cùng lấy số liệu)
// device_name string (tên thiết bị cần thống kê)
// action_name string (tên hành động cần thống kê)
app.get("/user/device/statistic", async (req, res) => {
  try {
    const { start_date, end_date, device_name, action_name } = req.query;
    if (start_date && end_date) {
      var query =
        "select count, created_at from user_action_statistic where device_name = ? and action_name = ? and created_at >= ? and created_at <= ? allow filtering";
      // Chuyển đổi chuỗi yyyy-mm-dd thành timestamp
      const startTimestamp = new Date(start_date); // Bắt đầu ngày
      const endTimestamp = new Date(end_date); // Kết thúc ngày
      if (!device_name) {
        throw new Error("Vui lòng chọn thiết bị cần thống kê");
      }
      if (!action_name) {
        throw new Error("Vui lòng chọn hành động cần thống kê");
      }
      var params = [device_name, action_name, startTimestamp, endTimestamp];
      const result = await db.execute(query, params, { prepare: true });
      var data = fillMissingDates(result.rows, start_date, end_date);
      data = formatData(data);
      res
        .status(200)
        .json(new GetResponse("success", "lấy dữ liệu thành công", data));
    } else {
      throw new Error("Vui lòng chọn ngày tháng để thống kê");
    }
  } catch (error) {
    res.status(400).json(new GetResponse("fail", error.message, []));
  }
});

// lấy danh sách thiết bị
app.get("/device/list", async (req, res) => {
  try {
    const query = "select * from device";
    const result = await db.execute(query);
    res
      .status(200)
      .json(
        new GetResponse("success", "Lấy thông tin thành công!", result.rows)
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new GetResponse("fail", "Có lỗi xảy ra vui lòng thử lại sau!", null)
      );
  }
});

// lấy danh sách hành động
app.get("/action/list", async (req, res) => {
  try {
    const query = "select * from action";
    const result = await db.execute(query);
    res
      .status(200)
      .json(
        new GetResponse("success", "Lấy thông tin thành công!", result.rows)
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new GetResponse("fail", "Có lỗi xảy ra vui lòng thử lại sau!", null)
      );
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
