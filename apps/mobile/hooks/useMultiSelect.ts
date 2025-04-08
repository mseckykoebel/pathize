import {useState} from 'react';

export const useMultiSelect = <T>() => {
  const [selectedItems, setSelectedItems] = useState<Set<T>>(new Set());
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);

  const toggleSelection = (itemId: T) => {
    setSelectedItems(prevSelectedItems => {
      const newSelectedItems = new Set(prevSelectedItems);

      if (newSelectedItems.has(itemId)) {
        newSelectedItems.delete(itemId);
      } else {
        newSelectedItems.add(itemId);
      }

      // Disable multi-select mode if no items are selected
      if (newSelectedItems.size === 0) {
        setMultiSelectEnabled(false);
      }

      return newSelectedItems;
    });
  };

  const enableMultiSelect = (itemId: T) => {
    setSelectedItems(prevSelectedItems =>
      new Set(prevSelectedItems).add(itemId),
    );
    setMultiSelectEnabled(true);
  };

  const disableMultiSelect = () => {
    setSelectedItems(new Set());
    setMultiSelectEnabled(false);
  };

  return {
    selectedItems,
    setSelectedItems,
    multiSelectEnabled,
    setMultiSelectEnabled,
    toggleSelection,
    enableMultiSelect,
    disableMultiSelect,
  };
};
