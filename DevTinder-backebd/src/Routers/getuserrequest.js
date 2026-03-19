const express=require("express")
const {UserAuth}=require("../middlwares/auth.js")
const {ConnectionRequestModel}=require("../models/sendconnection.js")
const getuserrequest=express.Router()
const {UserModel}=require("../models/user")
getuserrequest.get("/connection/request/received", UserAuth, async (req, res) => {
  try {
    const LoggedInUser = req.User;
    console.log(`🔍 Fetching requests for user: ${LoggedInUser._id}`);
    
    const findAllRequest = await ConnectionRequestModel.find({
      ToUserid: LoggedInUser._id,
      Status: "interested"
    }).populate("FromUserId", ["FirstName", "LastName", "PhotoUrl", "Age", "Gender", "About", "Skills"]);

    console.log(`✅ Found ${findAllRequest.length} pending requests`);
    
    res.json({
      message: "All the requests you have received",
      connectionRequests: findAllRequest,
      count: findAllRequest.length
    });
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    res.status(400).json({ 
      error: err.message,
      message: "Failed to fetch connection requests" 
    });
  }
});


getuserrequest.get("/connection/accepted", UserAuth, async (req, res) => {
  try {
    const loggedPearson = req.User;

    const Getallconnections = await ConnectionRequestModel.find({
      $or: [
        { FromUserId: loggedPearson._id, Status: "accepted" },
        { ToUserid: loggedPearson._id, Status: "accepted" },
      ],
    })
      .populate("FromUserId", ["_id", "FirstName", "LastName", "PhotoUrl", "Age", "Gender", "About", "Skills"])
      .populate("ToUserid", ["_id", "FirstName", "LastName", "PhotoUrl", "Age", "Gender", "About", "Skills"]);

    // Use map to get only the friend (other user)
    const friends = Getallconnections.map(row => {
      if (row.FromUserId._id.toString() === loggedPearson._id.toString()) {
        return row.ToUserid; // friend is the receiver
      }
      return row.FromUserId; // friend is the sender
    });

    res.json({
      message: "find all your connections",
      friends
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// In getuserrequest.js or a new route
getuserrequest.get("/connection/stats", UserAuth, async (req, res) => {
  try {
    const user = req.User;

    const pendingRequests = await ConnectionRequestModel.countDocuments({
      ToUserid: user._id,
      Status: "interested",
    });

    const totalConnections = await ConnectionRequestModel.countDocuments({
      $or: [
        { FromUserId: user._id, Status: "accepted" },
        { ToUserid: user._id, Status: "accepted" },
      ],
    });

    res.json({
      pendingRequests,
      totalConnections,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

getuserrequest.get("/feed", UserAuth, async (req, res) => {
  try {
    const loggedUser = req.User;
    console.log("🔍 Feed Request - Logged User ID:", loggedUser._id);

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 20) limit = 10;
    const skip = (page - 1) * limit;

    // ✅ Find ALL connections (both I sent and received)
    const allConnections = await ConnectionRequestModel.find({
      $or: [
        { FromUserId: loggedUser._id },
        { ToUserid: loggedUser._id },
      ],
    }).select(["FromUserId", "ToUserid", "Status"]);

    // ✅ Exclude interested/accepted connections
    const excludeIdsSet = new Set([loggedUser._id.toString()]);
    allConnections.forEach((conn) => {
      if (conn.Status === "interested" || conn.Status === "accepted") {
        if (conn.FromUserId?.toString()) excludeIdsSet.add(conn.FromUserId.toString());
        if (conn.ToUserid?.toString()) excludeIdsSet.add(conn.ToUserid.toString());
      }
    });
    const excludeIds = Array.from(excludeIdsSet);

    console.log("🚫 Excluding IDs:", excludeIds.map(id => id.toString()));

    // ✅ Fetch all users except excluded ones (NO filters)
    let query = {
      _id: { $nin: excludeIds },
    };

    const feedUsers = await UserModel.find(query)
      .select([
        "_id",
        "FirstName",
        "LastName",
        "Age",
        "Gender",
        "About",
        "Skills",
        "PhotoUrl",
      ])
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("✅ Feed Users Count:", feedUsers.length);

    if (!feedUsers || feedUsers.length === 0) {
      return res.json({
        users: [],
        page,
        message: "No new developers available",
        hasMore: false,
      });
    }

    // ✅ Get total available for pagination
    const totalAvailable = await UserModel.countDocuments(query);
    const hasMore = skip + feedUsers.length < totalAvailable;

    return res.json({
      users: feedUsers,
      page,
      totalAvailable,
      hasMore,
    });
  } catch (err) {
    console.error("Feed Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});




module.exports={getuserrequest}