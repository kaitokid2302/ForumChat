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

// /group/:userID: get all groups of a user
func (h *GroupHandler) GetAllGroupsByUserID(c *gin.Context) {
	userIDString := c.Param("userID")
	userID, er := strconv.Atoi(userIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
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
	if er := c.ShouldBindQuery(input); er != nil {
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
// /groupd/:groupID/:userID
func (h *GroupHandler) GetLastReadMessage(c *gin.Context) {
	groupIDString := c.Param("groupID")
	groupID, er := strconv.Atoi(groupIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
	userIDString := c.Param("userID")
	userID, er := strconv.Atoi(userIDString)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
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
	er := h.GroupService.UpgradeWebsocket(c, username)
	if er != nil {
		response.ReponseOutput(c, response.Fail, er.Error(), nil)
		return
	}
}

// /group/new?name=: create new group

// /groupd/rename?name=: rename group

// /groupd/delete?groupID=: delete group
