import React, { useState, useEffect } from "react";
import ChipInput from "material-ui-chip-input";

const TodoItemsFilters = ({
  filterTagsChange,
}: {
  filterTagsChange?: (tags: Array<string>) => void;
}) => {
  const [filterTags, setFilterTags] = useState<Array<string>>([]);

  useEffect(() => {
    if (!filterTagsChange) {
      return;
    }
    filterTagsChange(filterTags);
  }, [filterTags, filterTagsChange]);
  return (
    <>
      <ChipInput
        label="Поиск по тегам"
        fullWidth={true}
        value={filterTags}
        onDelete={(e) =>
          setFilterTags((prev) => prev.filter((item: string) => item !== e))
        }
        onAdd={(e) => setFilterTags((prev) => [...prev, e])}
        //className={classes.root}
      />
    </>
  );
};

export default TodoItemsFilters;
