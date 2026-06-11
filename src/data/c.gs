// ===== SHEET SETUP =====
function getPostSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var postSheet = ss.getSheetByName("posts");
  if (!postSheet) {
    postSheet = ss.insertSheet("posts");
    postSheet.appendRow(["ID", "Avatar", "Name", "FollowEnabled", "RoleName", "UpdatedTime", "Heading", "Description", "Images", "Upvotes", "Comments", "Shares", "Slug", "Type", "CreatedAt", "Status"]);
  }
  return postSheet;
}

function getUserSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var userSheet = ss.getSheetByName("users");
  if (!userSheet) {
    userSheet = ss.insertSheet("users");
    userSheet.appendRow(["Email", "Name", "Role", "Interests", "Avatar", "AuthProvider"]);
  }
  return userSheet;
}

function getCommentsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var commentsSheet = ss.getSheetByName("comments");
  if (!commentsSheet) {
    commentsSheet = ss.insertSheet("comments");
    commentsSheet.appendRow(["CommentID", "PostID", "ParentID", "UserEmail", "UserName", "UserAvatar", "CommentText", "CommentImage", "Timestamp", "Likes"]);
  }
  return commentsSheet;
}

function getCommentLikesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var likesSheet = ss.getSheetByName("comment_likes");
  if (!likesSheet) {
    likesSheet = ss.insertSheet("comment_likes");
    likesSheet.appendRow(["CommentID", "UserEmail", "Timestamp"]);
  }
  return likesSheet;
}

function getNotificationsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var notifSheet = ss.getSheetByName("notifications");
  if (!notifSheet) {
    notifSheet = ss.insertSheet("notifications");
    notifSheet.appendRow(["NotificationID", "RecipientEmail", "Type", "ActorEmail", "ActorName", "TargetType", "TargetID", "Message", "Timestamp", "IsRead"]);
  }
  return notifSheet;
}

// ===== GET (Read Data) =====
function doGet(e) {
  var action = e.parameter.action;

  // 1. CHECK IF USER EXISTS
  if (action === 'checkUser') {
    var email = e.parameter.email;
    var result = checkUserExists(email);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. GET POSTS (for public website)
  if (action === 'getPosts' || e.parameter.username) {
    var postSheet = getPostSheet();
    var username = e.parameter.username;
    var dataRange = postSheet.getDataRange().getValues();
    var results = [];

    for (var i = dataRange.length - 1; i >= 1; i--) {
      var row = dataRange[i];
      var status = row[15] || "Active";
      if (status === "Banned") continue;

      var post = {
        id: row[0], 
        avatar: row[1], 
        name: row[2], 
        follow_enabled: String(row[3]).toUpperCase() === "TRUE",
        role_name: row[4], 
        updated_time: row[5], 
        heading: row[6], 
        description: row[7],
        images: row[8] ? String(row[8]).split(",").filter(Boolean) : [],
        upvotes: Number(row[9]) || 0, 
        comments: Number(row[10]) || 0, 
        shares: Number(row[11]) || 0,
        slug: row[12], 
        type: row[13], 
        created_at: row[14]
      };

      if (username) {
        if (row[2] === username) results.push(post);
      } else {
        results.push(post);
      }
      if (results.length >= 30) break;
    }
    return ContentService.createTextOutput(JSON.stringify(results)).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. GET COMMENTS (with replies nested)
  if (action === 'getComments') {
    var postId = e.parameter.postId;
    var userEmail = e.parameter.userEmail || "";
    var result = getComments(postId, userEmail);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 4. GET NOTIFICATIONS
  if (action === 'getNotifications') {
    var userEmail = e.parameter.email;
    var filter = e.parameter.filter || "all";
    var result = getNotifications(userEmail, filter);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 5. MARK NOTIFICATION READ
  if (action === 'markNotifRead') {
    var notifId = e.parameter.notifId;
    var result = markNotificationRead(notifId);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result })).setMimeType(ContentService.MimeType.JSON);
  }

  // 6. MARK ALL NOTIFICATIONS READ
  if (action === 'markAllNotifRead') {
    var userEmail = e.parameter.email;
    var count = markAllNotificationsRead(userEmail);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: count })).setMimeType(ContentService.MimeType.JSON);
  }

  // 7. GET USER PROFILE
  if (action === 'getUserProfile') {
    var email = e.parameter.email;
    var result = getUserProfile(email);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 8. GET USER POSTS
  if (action === 'getUserPosts') {
    var email = e.parameter.email;
    var result = getUserPosts(email);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 9. DEFAULT: SERVE ADMIN DASHBOARD
  return HtmlService.createHtmlOutputFromFile('admin')
    .setTitle('TechEngineer Admin Panel')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ===== POST (Write Data) =====
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action || "create";

  // 1. CREATE A NEW POST
  if (action === "create") {
    var postSheet = getPostSheet();
    var id = Utilities.getUuid();
    postSheet.appendRow([
      id, 
      data.avatar || "icon.png", 
      data.name || "Guest Engineer",
      data.follow_enabled === true ? "TRUE" : "FALSE", 
      data.role_name || "Tech Engineer",
      data.updated_time || "Just now", 
      data.heading || "", 
      data.description || "",
      (data.images || []).join(","), 
      data.upvotes || 0, 
      data.comments || 0, 
      data.shares || 0,
      data.slug || "", 
      data.type || "Question", 
      new Date(), 
      "Active"
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: id })).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. SAVE USER PROFILE
  if (action === "saveProfile") {
    var result = saveUserProfile(data);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result })).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. UPDATE UPVOTE COUNT
  if (action === "updateUpvote") {
    var result = updateUpvote(data.postId, data.increment, data);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", newCount: result })).setMimeType(ContentService.MimeType.JSON);
  }

  // 4. UPDATE COMMENT COUNT
  if (action === "updateCommentCount") {
    var result = updateCommentCount(data.postId, data.increment);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", newCount: result })).setMimeType(ContentService.MimeType.JSON);
  }

  // 5. UPDATE SHARE COUNT
  if (action === "updateShareCount") {
    var result = updateShareCount(data.postId);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", newCount: result })).setMimeType(ContentService.MimeType.JSON);
  }

  // 6. ADD COMMENT (handles both main comments AND replies)
  if (action === "addComment") {
    var result = addComment(data);
    
    // ✅ Create notification for post author
    if (data.parentID) {
      // Reply notification
      createNotification({
        recipientEmail: getCommentAuthorEmail(data.parentID),
        type: "comment",
        actorEmail: data.userEmail,
        actorName: data.userName,
        targetType: "comment",
        targetID: data.parentID,
        message: data.userName + " replied to your comment"
      });
    } else {
      // Comment notification
      createNotification({
        recipientEmail: getPostAuthorEmail(data.postId),
        type: "comment",
        actorEmail: data.userEmail,
        actorName: data.userName,
        targetType: "post",
        targetID: data.postId,
        message: data.userName + " commented on your post"
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", comment: result })).setMimeType(ContentService.MimeType.JSON);
  }

  // 7. TOGGLE COMMENT LIKE
  if (action === "toggleCommentLike") {
    var result = toggleCommentLike(data.commentId, data.userEmail);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 8. FOLLOW USER
  if (action === "followUser") {
    var result = followUser(data);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 9. UNFOLLOW USER
  if (action === "unfollowUser") {
    var result = unfollowUser(data);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 10. ADD NOTIFICATION (manual)
  if (action === "addNotification") {
    createNotification(data);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 11. DELETE POST
  if (action === "deletePost") {
    var result = deletePostById(data.postId);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  // 12. UPDATE POST
  if (action === "updatePost") {
    var result = updatePostById(data.postId, data);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid action" })).setMimeType(ContentService.MimeType.JSON);
}

// ===== USER FUNCTIONS =====
function checkUserExists(email) {
  var userSheet = getUserSheet();
  var data = userSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return { 
        isNew: false, 
        name: data[i][1], 
        role: data[i][2], 
        interests: data[i][3], 
        avatar: data[i][4] 
      };
    }
  }
  return { isNew: true };
}

function saveUserProfile(data) {
  var userSheet = getUserSheet();
  var dataRange = userSheet.getDataRange().getValues();

  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === data.email) {
      if (data.name) userSheet.getRange(i + 1, 2).setValue(data.name);
      if (data.role) userSheet.getRange(i + 1, 3).setValue(data.role);
      if (data.interests) userSheet.getRange(i + 1, 4).setValue(data.interests);
      if (data.avatar) userSheet.getRange(i + 1, 5).setValue(data.avatar);
      if (data.authProvider) userSheet.getRange(i + 1, 6).setValue(data.authProvider);
      return "Updated";
    }
  }

  userSheet.appendRow([
    data.email, 
    data.name || "", 
    data.role || "", 
    data.interests || "", 
    data.avatar || "", 
    data.authProvider || "google"
  ]);
  return "Created";
}

function getUserProfile(email) {
  var userSheet = getUserSheet();
  var data = userSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return {
        email: data[i][0],
        name: data[i][1],
        role: data[i][2],
        interests: data[i][3],
        avatar: data[i][4],
        authProvider: data[i][5]
      };
    }
  }
  return null;
}

function getUserPosts(email) {
  var postSheet = getPostSheet();
  var dataRange = postSheet.getDataRange().getValues();
  var results = [];
  
  for (var i = 1; i < dataRange.length; i++) {
    var row = dataRange[i];
    if (row[1] === email) { // Match user email
      results.push({
        id: row[0],
        avatar: row[1],
        name: row[2],
        follow_enabled: String(row[3]).toUpperCase() === "TRUE",
        role_name: row[4],
        updated_time: row[5],
        heading: row[6],
        description: row[7],
        images: row[8] ? String(row[8]).split(",").filter(Boolean) : [],
        upvotes: Number(row[9]) || 0,
        comments: Number(row[10]) || 0,
        shares: Number(row[11]) || 0,
        slug: row[12],
        type: row[13],
        created_at: row[14]
      });
    }
  }
  return results;
}

// ===== POST INTERACTION FUNCTIONS =====

// Update upvote count
function updateUpvote(postId, increment, data) {
  var postSheet = getPostSheet();
  var dataRange = postSheet.getDataRange().getValues();
  
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === postId) {
      var currentCount = Number(dataRange[i][9]) || 0;
      var newCount = currentCount + (increment ? 1 : -1);
      newCount = Math.max(0, newCount);
      postSheet.getRange(i + 1, 10).setValue(newCount);
      
      // ✅ Create notification for post author when upvoted
      if (increment && data && data.actorEmail && data.actorName) {
        var postAuthorEmail = dataRange[i][1]; // Column B (author/avatar)
        var postHeading = dataRange[i][6]; // Column G (heading)
        
        // Only notify if actor is not the post author
        if (postAuthorEmail !== data.actorEmail) {
          createNotification({
            recipientEmail: postAuthorEmail,
            type: "upvote",
            actorEmail: data.actorEmail,
            actorName: data.actorName,
            targetType: "post",
            targetID: postId,
            message: data.actorName + " upvoted your post: \"" + postHeading + "\""
          });
        }
      }
      
      return newCount;
    }
  }
  return 0;
}


// Update comment count
function updateCommentCount(postId, increment) {
  var postSheet = getPostSheet();
  var dataRange = postSheet.getDataRange().getValues();
  
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === postId) {
      var currentCount = Number(dataRange[i][10]) || 0;
      var newCount = currentCount + (increment ? 1 : -1);
      newCount = Math.max(0, newCount);
      postSheet.getRange(i + 1, 11).setValue(newCount);
      return newCount;
    }
  }
  return 0;
}

// Update share count
function updateShareCount(postId) {
  var postSheet = getPostSheet();
  var dataRange = postSheet.getDataRange().getValues();
  
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === postId) {
      var currentCount = Number(dataRange[i][11]) || 0;
      var newCount = currentCount + 1;
      postSheet.getRange(i + 1, 12).setValue(newCount);
      return newCount;
    }
  }
  return 0;
}

// ADD COMMENT (supports both main comments and replies)
function addComment(data) {
  var commentsSheet = getCommentsSheet();
  var commentId = Utilities.getUuid();
  var timestamp = new Date();
  
  commentsSheet.appendRow([
    commentId,
    data.postId,
    data.parentID || "",
    data.userEmail,
    data.userName,
    data.userAvatar || "/assets/icon.png",
    data.commentText || "",
    data.commentImage || "",
    timestamp,
    0
  ]);
  
  updateCommentCount(data.postId, true);
  
  return {
    id: commentId,
    postId: data.postId,
    parentID: data.parentID || "",
    userName: data.userName,
    userAvatar: data.userAvatar || "/assets/icon.png",
    text: data.commentText,
    image: data.commentImage || "",
    timestamp: timestamp.toISOString(),
    likes: 0,
    userLiked: false
  };
}

// GET COMMENTS (returns nested structure with replies)
function getComments(postId, currentUserEmail) {
  var commentsSheet = getCommentsSheet();
  var dataRange = commentsSheet.getDataRange().getValues();
  var likesSheet = getCommentLikesSheet();
  var likesData = likesSheet.getDataRange().getValues();
  
  var allComments = [];
  var userLikedComments = {};
  
  // Build user likes map
  for (var i = 1; i < likesData.length; i++) {
    if (likesData[i][1] === currentUserEmail) {
      userLikedComments[likesData[i][0]] = true;
    }
  }
  
  // Get all comments for this post
  for (var i = 1; i < dataRange.length; i++) {
    var row = dataRange[i];
    if (row[1] === postId) {
      allComments.push({
        id: row[0],
        postId: row[1],
        parentID: row[2] || "",
        userEmail: row[3],
        userName: row[4],
        userAvatar: row[5],
        text: row[6],
        image: row[7],
        timestamp: row[8],
        likes: row[9] || 0,
        userLiked: userLikedComments[row[0]] || false
      });
    }
  }
  
  // Separate main comments and replies
  var mainComments = allComments.filter(function(c) { return !c.parentID; });
  var replies = allComments.filter(function(c) { return c.parentID; });
  
  // Attach replies to their parent comments
  mainComments.forEach(function(comment) {
    comment.replies = replies.filter(function(r) { 
      return r.parentID === comment.id; 
    });
  });
  
  // Sort main comments by timestamp (newest first)
  mainComments.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Sort replies by timestamp (oldest first)
  mainComments.forEach(function(comment) {
    comment.replies.sort(function(a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  });
  
  return mainComments;
}

// TOGGLE COMMENT LIKE
function toggleCommentLike(commentId, userEmail) {
  var likesSheet = getCommentLikesSheet();
  var commentsSheet = getCommentsSheet();
  var dataRange = likesSheet.getDataRange().getValues();
  
  var found = false;
  var rowToDelete = -1;
  
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === commentId && dataRange[i][1] === userEmail) {
      found = true;
      rowToDelete = i + 1;
      break;
    }
  }
  
  var commentsData = commentsSheet.getDataRange().getValues();
  var commentRowIndex = -1;
  var currentLikes = 0;
  var commentAuthorEmail = "";
  
  for (var j = 1; j < commentsData.length; j++) {
    if (commentsData[j][0] === commentId) {
      commentRowIndex = j + 1;
      currentLikes = Number(commentsData[j][9]) || 0;
      commentAuthorEmail = commentsData[j][3];
      break;
    }
  }
  
  if (commentRowIndex === -1) {
    return { status: "error", message: "Comment not found" };
  }
  
  if (found) {
    likesSheet.deleteRow(rowToDelete);
    var newLikes = Math.max(0, currentLikes - 1);
    commentsSheet.getRange(commentRowIndex, 10).setValue(newLikes);
    return { status: "success", liked: false, likes: newLikes };
  } else {
    likesSheet.appendRow([commentId, userEmail, new Date()]);
    var newLikes = currentLikes + 1;
    commentsSheet.getRange(commentRowIndex, 10).setValue(newLikes);
    
    // ✅ Create notification for comment author
    if (commentAuthorEmail !== userEmail) {
      var userSheet = getUserSheet();
      var userData = userSheet.getDataRange().getValues();
      var actorName = "Someone";
      for (var k = 1; k < userData.length; k++) {
        if (userData[k][0] === userEmail) {
          actorName = userData[k][1];
          break;
        }
      }
      
      createNotification({
        recipientEmail: commentAuthorEmail,
        type: "upvote",
        actorEmail: userEmail,
        actorName: actorName,
        targetType: "comment",
        targetID: commentId,
        message: actorName + " liked your comment"
      });
    }
    
    return { status: "success", liked: true, likes: newLikes };
  }
}

// ===== NOTIFICATION FUNCTIONS =====

// Create a notification
function createNotification(data) {
  if (!data.recipientEmail || !data.type) return;
  
  // Don't notify yourself
  if (data.recipientEmail === data.actorEmail) return;
  
  var notifSheet = getNotificationsSheet();
  var notificationId = Utilities.getUuid();
  
  notifSheet.appendRow([
    notificationId,
    data.recipientEmail,
    data.type,
    data.actorEmail || "",
    data.actorName || "",
    data.targetType || "",
    data.targetID || "",
    data.message || "",
    new Date(),
    "FALSE"
  ]);
  
  return notificationId;
}

// Get notifications for a user
function getNotifications(userEmail, filter) {
  if (!userEmail) return [];
  
  var notifSheet = getNotificationsSheet();
  var dataRange = notifSheet.getDataRange().getValues();
  var results = [];
  
  for (var i = 1; i < dataRange.length; i++) {
    var row = dataRange[i];
    if (row[1] === userEmail) {
      if (filter && filter !== "all" && row[2] !== filter) {
        continue;
      }
      
      results.push({
        id: row[0],
        type: row[2],
        actorEmail: row[3],
        actorName: row[4],
        targetType: row[5],
        targetID: row[6],
        message: row[7],
        timestamp: row[8],
        isRead: String(row[9]).toUpperCase() === "TRUE"
      });
    }
  }
  
  results.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  return results;
}

// Mark single notification as read
function markNotificationRead(notifId) {
  var notifSheet = getNotificationsSheet();
  var dataRange = notifSheet.getDataRange().getValues();
  
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === notifId) {
      notifSheet.getRange(i + 1, 10).setValue("TRUE");
      return "Success";
    }
  }
  return "Not Found";
}

// Mark all notifications as read
function markAllNotificationsRead(userEmail) {
  if (!userEmail) return 0;
  
  var notifSheet = getNotificationsSheet();
  var dataRange = notifSheet.getDataRange().getValues();
  var count = 0;
  
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][1] === userEmail && String(dataRange[i][9]).toUpperCase() !== "TRUE") {
      notifSheet.getRange(i + 1, 10).setValue("TRUE");
      count++;
    }
  }
  
  return count;
}

// ===== FOLLOW FUNCTIONS =====

function followUser(data) {
  if (!data.followerEmail || !data.targetEmail) {
    return { status: "error", message: "Missing email" };
  }
  
  if (data.followerEmail === data.targetEmail) {
    return { status: "error", message: "Cannot follow yourself" };
  }
  
  createNotification({
    recipientEmail: data.targetEmail,
    type: "following",
    actorEmail: data.followerEmail,
    actorName: data.followerName || "Someone",
    targetType: "user",
    targetID: data.followerEmail,
    message: (data.followerName || "Someone") + " started following you"
  });
  
  return { status: "success" };
}

function unfollowUser(data) {
  if (!data.followerEmail || !data.targetEmail) {
    return { status: "error", message: "Missing email" };
  }
  
  return { status: "success" };
}

// ===== HELPER FUNCTIONS =====

// Get post author email
function getPostAuthorEmail(postId) {
  var postSheet = getPostSheet();
  var dataRange = postSheet.getDataRange().getValues();
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === postId) {
      return dataRange[i][1]; // Column B = Avatar (which might be email or image)
    }
  }
  return "";
}

// Get comment author email
function getCommentAuthorEmail(commentId) {
  var commentsSheet = getCommentsSheet();
  var dataRange = commentsSheet.getDataRange().getValues();
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === commentId) {
      return dataRange[i][3]; // Column D = UserEmail
    }
  }
  return "";
}

// Delete post by ID
function deletePostById(postId) {
  var postSheet = getPostSheet();
  var dataRange = postSheet.getDataRange().getValues();
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === postId) {
      postSheet.deleteRow(i + 1);
      return { status: "success" };
    }
  }
  return { status: "error", message: "Post not found" };
}

// Update post by ID
function updatePostById(postId, data) {
  var postSheet = getPostSheet();
  var dataRange = postSheet.getDataRange().getValues();
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === postId) {
      var row = i + 1;
      if (data.heading !== undefined) postSheet.getRange(row, 7).setValue(data.heading);
      if (data.description !== undefined) postSheet.getRange(row, 8).setValue(data.description);
      if (data.images !== undefined) postSheet.getRange(row, 9).setValue((data.images || []).join(","));
      if (data.upvotes !== undefined) postSheet.getRange(row, 10).setValue(Number(data.upvotes));
      if (data.comments !== undefined) postSheet.getRange(row, 11).setValue(Number(data.comments));
      if (data.shares !== undefined) postSheet.getRange(row, 12).setValue(Number(data.shares));
      if (data.status !== undefined) postSheet.getRange(row, 16).setValue(data.status);
      return { status: "success" };
    }
  }
  return { status: "error", message: "Post not found" };
}

// ===== ADMIN FUNCTIONS =====
function getAdminPosts() {
  var postSheet = getPostSheet();
  var dataRange = postSheet.getDataRange().getValues();
  var results = [];
  for (var i = 1; i < dataRange.length; i++) {
    var row = dataRange[i];
    results.push({
      row: i + 1, 
      id: row[0], 
      avatar: row[1], 
      name: row[2], 
      heading: row[6],
      description: row[7], 
      images: row[8] ? String(row[8]).split(",").filter(Boolean) : [],
      upvotes: Number(row[9]) || 0, 
      comments: Number(row[10]) || 0, 
      shares: Number(row[11]) || 0,
      status: row[15] || "Active"
    });
  }
  return results;
}

function updatePost(rowNumber, data) {
  var postSheet = getPostSheet();
  if (data.avatar !== undefined) postSheet.getRange(rowNumber, 2).setValue(data.avatar);
  if (data.name !== undefined) postSheet.getRange(rowNumber, 3).setValue(data.name);
  if (data.follow_enabled !== undefined) postSheet.getRange(rowNumber, 4).setValue(data.follow_enabled ? "TRUE" : "FALSE");
  if (data.role_name !== undefined) postSheet.getRange(rowNumber, 5).setValue(data.role_name);
  if (data.updated_time !== undefined) postSheet.getRange(rowNumber, 6).setValue(data.updated_time);
  if (data.heading !== undefined) postSheet.getRange(rowNumber, 7).setValue(data.heading);
  if (data.description !== undefined) postSheet.getRange(rowNumber, 8).setValue(data.description);
  if (data.images !== undefined) postSheet.getRange(rowNumber, 9).setValue(data.images);
  if (data.upvotes !== undefined) postSheet.getRange(rowNumber, 10).setValue(Number(data.upvotes));
  if (data.comments !== undefined) postSheet.getRange(rowNumber, 11).setValue(Number(data.comments));
  if (data.shares !== undefined) postSheet.getRange(rowNumber, 12).setValue(Number(data.shares));
  return "Success";
}

function createAdminPost(data) {
  var postSheet = getPostSheet();
  var id = Utilities.getUuid();
  postSheet.appendRow([
    id, 
    data.avatar || "icon.png", 
    data.name || "Admin", 
    "TRUE", 
    data.role_name || "Admin", 
    "Just now", 
    data.heading, 
    data.description || "", 
    data.images || "", 
    0, 
    0, 
    0, 
    data.heading.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-"), 
    data.type || "Post", 
    new Date(), 
    "Active"
  ]);
  return "Success";
}

function banPost(rowNumber) { 
  getPostSheet().getRange(rowNumber, 16).setValue("Banned"); 
  return "Success"; 
}

function activatePost(rowNumber) { 
  getPostSheet().getRange(rowNumber, 16).setValue("Active"); 
  return "Success"; 
}

function deletePost(rowNumber) { 
  getPostSheet().deleteRow(rowNumber); 
  return "Success"; 
}

function uploadImageToDrive(data) {
  try {
    var folders = DriveApp.getFoldersByName("TechEngineer_Images");
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("TechEngineer_Images");
    var blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType, data.fileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) { 
    return "Error: " + e.toString(); 
  }
}

