// hooks/useGroupSearch.js
import debounce from "lodash/debounce";
import { useCallback, useMemo, useRef, useState } from "react";

export const useGroupSearch = (groups) => {
  const [searchText, setSearchText] = useState("");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Tách riêng việc filter với debounce
  const debouncedFilter = useCallback(
    debounce(() => {
      setIsSearching(false);
    }, 300),
    [],
  );

  // Xử lý search ngay lập tức cho input
  const handleSearch = (value) => {
    setSearchText(value); // Update input value ngay lập tức
    setIsSearching(true);
    debouncedFilter(); // Debounce chỉ cho việc ẩn loading
  };

  // Filter groups dựa trên searchText
  const filteredGroups = useMemo(() => {
    if (!searchText.trim()) return groups;
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [groups, searchText]);

  const handleSearchEnter = (e) => {
    if (e.key === "Enter") {
      setIsSearching(false);
    }
  };

  return {
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
  };
};
