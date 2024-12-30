package group

import (
	"strconv"

	"ForumChat/internal/request"
	"ForumChat/internal/response"
	"ForumChat/internal/service/group"
	"ForumChat/internal/service/message"
	"github.com/gin-gonic/gin"
)

type GroupHandler struct {
	group.GroupService
	message.MessageService
}

func NewGroupHandler(groupService group.GroupService, messageService message.MessageService) *GroupHandler {
	return &GroupHandler{
		GroupService:   groupService,
		MessageService: messageService,
	}
}

// /group/markread/group/:groupID/user/:userID/message/:messageID
func (h *GroupHandler) MarkRead(c *gin.Context) {
	groupIDString := c.Param("groupID")
	groupID, er := strconv.Atoi(groupIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	userID := c.GetInt("userID")
	messageIDString := c.Param("messageID")
	messageID, er := strconv.Atoi(messageIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	er = h.GroupService.MarkRead(c, groupID, userID, messageID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", nil)
}

// /group/users?groupID=: get all users in a group
func (h *GroupHandler) GetAllUsersInAGroup(c *gin.Context) {
	groupIDString := c.Query("groupID")
	groupID, er := strconv.Atoi(groupIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	users, er := h.GroupService.GetUsersInAGroup(c, groupID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", users)
}

// /group/user
func (h *GroupHandler) GetAllGroupsByUserID(c *gin.Context) {
	userID := c.GetInt("userID")
	group, er := h.GroupService.GetGroupsByUserID(c, userID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", group)
}

// /group/:groupID?size=&offset=
func (h *GroupHandler) GetMessagesByGroupID(c *gin.Context) {
	var input request.MessageRequest
	if er := c.ShouldBindQuery(&input); er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	groupIDString := c.Param("groupID")
	groupID, er := strconv.Atoi(groupIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	messages, er := h.MessageService.GetMessagesByGroupID(c, groupID, input.Size, input.Offset)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", messages)
}

// read messageID of a group
// /group/:groupID/:userID
func (h *GroupHandler) GetLastReadMessage(c *gin.Context) {
	groupIDString := c.Param("groupID")
	groupID, er := strconv.Atoi(groupIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	userID := c.GetInt("userID")
	message, er := h.GroupService.GetLastReadMessage(c, groupID, userID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	messageID := message.ID
	response.ReponseOutput(c, response.Success, "", messageID)
}

// websocket group to dectect create, rename, delete group

func (h *GroupHandler) UpgradeWebsocket(c *gin.Context) {
	username := c.GetString("username")
	userID := c.GetInt("userID")

	er := h.GroupService.UpgradeWebsocket(c, username, userID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
}

func (h *GroupHandler) GetAllGroups(c *gin.Context) {
	var input request.MessageRequest
	if err := c.ShouldBindQuery(&input); err != nil {
		response.ReponseOutput(c, response.Fail, err.Error(), nil)
		return
	}
	groups, er := h.GroupService.GetAllGroups(c, input.Size, input.Offset)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", groups)
	return
}

func (h *GroupHandler) CountUnreadMessage(c *gin.Context) {
	groupIDString := c.Param("groupID")
	groupID, er := strconv.Atoi(groupIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	userID := c.GetInt("userID")
	count, er := h.GroupService.CountUnreadMessage(c, groupID, userID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", count)
}

func (h *GroupHandler) GetAllMessageUnread(c *gin.Context) {
	groupIDString := c.Param("groupID")
	groupID, er := strconv.Atoi(groupIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	message, er := h.GroupService.GetAllMessageUnread(c, groupID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", message)
}
func (h *GroupHandler) GetAllUnjoinedGroup(c *gin.Context) {
	userID := c.GetInt("userID")
	groups, er := h.GroupService.GetUnjoinedGroup(c, userID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", groups)
}

func (h *GroupHandler) GetOwnerGroup(c *gin.Context) {
	groupIDString := c.Param("groupID")
	groupID, er := strconv.Atoi(groupIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	group, er := h.GroupService.GetOwnerGroup(c, groupID)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	response.ReponseOutput(c, response.Success, "", group)
}

// /group/new?name=: create new group

// /groupd/rename?name=: rename group

// /groupd/delete?groupID=: delete group

// all to websocket
