// components/JoinedGroup.jsx
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, List, Modal, Skeleton } from "antd";
import { useCallback } from "react";
import { memo, useContext } from "React";
import { HomeContext } from "../../../context/home/home.jsx";
import { useGroupSearch } from "../../../hooks/home/groupJoinedHook.js";
import { Group } from "./Group.jsx"; // Thêm memo

// Tách SearchInput thành component riêng và memo
const SearchInput = memo(({ value, onChange, onPressEnter, inputRef }) => (
  <Input
    ref={inputRef}
    prefix={<SearchOutlined />}
    placeholder="Search chats"
    size="large"
    value={value}
    onChange={onChange}
    onPressEnter={onPressEnter}
    className="mb-2"
    allowClear
  />
));

// Tách GroupList thành component riêng và memo
const GroupList = memo(({ groups, activeGroupId, onGroupClick, loading }) => {
  if (loading) {
    return Array(3)
      .fill(null)
      .map((_, index) => (
        <Skeleton
          key={index}
          avatar
          active
          paragraph={false}
          className="px-4 py-3"
        />
      ));
  }

  return (
    <List
      className="overflow-y-auto h-[calc(100vh-140px)]"
      dataSource={groups}
      renderItem={(group) => (
        <Group
          key={group.id}
          group={group}
          isActive={group.id === activeGroupId}
          onClick={onGroupClick}
        />
      )}
    />
  );
});

export const JoinedGroup = () => {
  const {
    joinedGroups,
    isLoading,
    handleCreate,
    activeGroupId,
    handleSelectGroup,
  } = useContext(HomeContext);
  const {
    searchText,
    filteredGroups,
    handleSearch,
    handleSearchEnter,
    isCreateModalVisible,
    setIsCreateModalVisible,
    newGroupName,
    setNewGroupName,
    isSearching,
    searchInputRef,
  } = useGroupSearch(joinedGroups);

  const handleGroupClick = useCallback((groupId) => {
    handleSelectGroup(groupId);
  }, []);

  const handleCreateGroup = useCallback(() => {
    if (!newGroupName.trim()) return;
    handleCreate(newGroupName);
    setNewGroupName("");
    setIsCreateModalVisible(false);
  }, [newGroupName, handleCreate]);

  return (
    <div className="w-80 h-screen border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Chats</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
            size="small"
          >
            New Group
          </Button>
        </div>
        <SearchInput
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onPressEnter={handleSearchEnter}
          inputRef={searchInputRef}
        />
      </div>

      <GroupList
        groups={filteredGroups}
        activeGroupId={activeGroupId}
        onGroupClick={handleGroupClick}
        loading={isLoading || isSearching}
      />

      <Modal
        title="Create New Group"
        open={isCreateModalVisible}
        onOk={handleCreateGroup}
        onCancel={() => setIsCreateModalVisible(false)}
        okButtonProps={{ disabled: !newGroupName.trim() }}
      >
        <Input
          placeholder="Enter group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onPressEnter={handleCreateGroup}
          autoFocus
        />
      </Modal>
    </div>
  );
};
