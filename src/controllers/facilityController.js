import Facility from "../models/FacilityModel.js";

// @desc    Tạo cơ sở mới
// @route   POST /api/facilities
// @access  Private (Admin only)
export const createFacility = async (req, res) => {
  try {
    const {
      name,
      region,
      address,
      phone,
      email,
      manager,
      capacity,
      description,
      coordinates,
      facilities,
      operatingHours,
      images,
    } = req.body;

    // Kiểm tra cơ sở đã tồn tại chưa
    const existingFacility = await Facility.findOne({
      $or: [{ name: name }, { email: email }],
    });

    if (existingFacility) {
      return res.status(400).json({
        success: false,
        message: "Cơ sở đã tồn tại với tên hoặc email này",
      });
    }

    const facility = new Facility({
      name,
      region,
      address,
      phone,
      email,
      manager,
      capacity,
      description,
      coordinates,
      facilities,
      operatingHours,
      images,
    });

    await facility.save();

    res.status(201).json({
      success: true,
      message: "Tạo cơ sở thành công",
      data: facility,
    });
  } catch (error) {
    console.error("Error in createFacility:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Lấy danh sách cơ sở theo khu vực
// @route   GET /api/facilities?region=Miền Bắc
// @access  Public
export const getFacilitiesByRegion = async (req, res) => {
  try {
    const { region, status, page = 1, limit = 10 } = req.query;

    let query = {};

    if (region) {
      query.region = region;
    }

    if (status) {
      query.status = status;
    }

    const facilities = await Facility.find(query)
      .select("-__v")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Facility.countDocuments(query);

    res.json({
      success: true,
      data: facilities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error in getFacilitiesByRegion:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Lấy thông tin cơ sở theo ID
// @route   GET /api/facilities/:id
// @access  Public
export const getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id).select("-__v");

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cơ sở",
      });
    }

    res.json({
      success: true,
      data: facility,
    });
  } catch (error) {
    console.error("Error in getFacilityById:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Cập nhật cơ sở
// @route   PUT /api/facilities/:id
// @access  Private (Admin only)
export const updateFacility = async (req, res) => {
  try {
    const {
      name,
      region,
      address,
      phone,
      email,
      manager,
      capacity,
      description,
      status,
      coordinates,
      facilities,
      operatingHours,
      images,
    } = req.body;

    // Kiểm tra cơ sở có tồn tại không
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cơ sở",
      });
    }

    // Kiểm tra tên hoặc email trùng lặp (nếu có thay đổi)
    if (name !== facility.name || email !== facility.email) {
      const existingFacility = await Facility.findOne({
        _id: { $ne: req.params.id },
        $or: [{ name: name }, { email: email }],
      });

      if (existingFacility) {
        return res.status(400).json({
          success: false,
          message: "Cơ sở đã tồn tại với tên hoặc email này",
        });
      }
    }

    // Cập nhật thông tin
    const updatedFacility = await Facility.findByIdAndUpdate(
      req.params.id,
      {
        name,
        region,
        address,
        phone,
        email,
        manager,
        capacity,
        description,
        status,
        coordinates,
        facilities,
        operatingHours,
        images,
      },
      { new: true, runValidators: true }
    ).select("-__v");

    res.json({
      success: true,
      message: "Cập nhật cơ sở thành công",
      data: updatedFacility,
    });
  } catch (error) {
    console.error("Error in updateFacility:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Xóa cơ sở
// @route   DELETE /api/facilities/:id
// @access  Private (Admin only)
export const deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cơ sở",
      });
    }

    await Facility.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Xóa cơ sở thành công",
    });
  } catch (error) {
    console.error("Error in deleteFacility:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Tìm kiếm cơ sở
// @route   GET /api/facilities/search?q=keyword
// @access  Public
export const searchFacilities = async (req, res) => {
  try {
    const { q, region, page = 1, limit = 10 } = req.query;

    let query = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (region) {
      query.region = region;
    }

    const facilities = await Facility.find(query)
      .select("-__v")
      .sort({ score: { $meta: "textScore" } })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Facility.countDocuments(query);

    res.json({
      success: true,
      data: facilities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error in searchFacilities:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
