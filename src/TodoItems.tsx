import { useCallback } from "react";
import Chip from "@material-ui/core/Chip";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import CheckIcon from "@material-ui/icons/Check";
import ChipInput from "material-ui-chip-input";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import EditIcon from "@material-ui/icons/Edit";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

import { TodoItem, useTodoItems } from "./TodoItemsContext";

const spring = {
  type: "spring",
  damping: 25,
  stiffness: 120,
  duration: 0.25,
};

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: "none",
    padding: 0,
  },
});

export const TodoItemsList = function ({
  filterTags,
}: {
  filterTags: Array<string>;
}) {
  const { todoItems } = useTodoItems();
  const classes = useTodoItemListStyles();

  let filterItems = todoItems;

  if (filterTags) {
    filterItems = todoItems.filter((item, index) => {
      let tags = true;
      filterTags.forEach((tag) => {
        if (!item.tags?.includes(tag)) {
          tags = false;
        }
      });
      return tags;
    });
  }

  const sortedItems = filterItems.slice().sort((a, b) => {
    if (a.done && !b.done) {
      return 1;
    }

    if (!a.done && b.done) {
      return -1;
    }

    return 0;
  });

  return (
    <ul className={classes.root}>
      {sortedItems.map((item) => (
        <motion.li key={item.id} transition={spring} layout={true}>
          <TodoItemCard item={item} />
        </motion.li>
      ))}
    </ul>
  );
};

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
    marginBottom: 24,
  },
  doneRoot: {
    textDecoration: "line-through",
    color: "#888888",
  },
  chip: {
    spacing: 0.5,
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
  },
});

export const TodoItemCard = function ({ item }: { item: TodoItem }) {
  const classes = useTodoItemCardStyles();
  const { dispatch } = useTodoItems();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const [editTitle, setEditTitle] = useState<string>(item.title || "");
  const [editDesc, setEditDesc] = useState<string>(item.details || "");
  const [editTags, setEditTags] = useState<Array<string>>(item.tags || []);

  useEffect(() => {
    if (!cardRef.current) {
      return;
    }
    const clickOutSide = (e: any) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsEdit(false);
      }
    };
    document.addEventListener("click", clickOutSide);
    return () => {
      document.removeEventListener("click", clickOutSide);
    };
  }, [cardRef]);

  const handleDelete = useCallback(
    () => dispatch({ type: "delete", data: { id: item.id } }),
    [item.id, dispatch]
  );

  const handleEdit = () => {
    if (isEdit) {
      dispatch({
        type: "edit",
        data: {
          id: item.id,
          title: editTitle,
          details: editDesc,
          tags: editTags,
        },
      });
    } else {
      setEditTags(item.tags || []);
      setEditTitle(item.title || "");
      setEditDesc(item.details || "");
    }
    setIsEdit((prev) => !prev);
  };

  const handleToggleDone = useCallback(
    () =>
      dispatch({
        type: "toggleDone",
        data: { id: item.id },
      }),
    [item.id, dispatch]
  );
  return (
    <Card
      ref={cardRef}
      className={classnames(classes.root, {
        [classes.doneRoot]: item.done,
      })}
    >
      <CardHeader
        action={
          <>
            {!isEdit && (
              <IconButton
                className="todo-button"
                aria-label="delete"
                onClick={handleDelete}
              >
                <DeleteIcon />
              </IconButton>
            )}

            {!item.done && (
              <IconButton
                className="todo-button"
                aria-label="edit"
                onClick={handleEdit}
              >
                {!isEdit ? <EditIcon /> : <CheckIcon />}
              </IconButton>
            )}
          </>
        }
        title={
          isEdit ? (
            <TextField
              defaultValue={item.title}
              label="TODO"
              onChange={(e) => setEditTitle(e.target.value)}
              fullWidth={true}
              //multiline={true}
            />
          ) : (
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.done}
                  onChange={handleToggleDone}
                  name={`checked-${item.id}`}
                  color="primary"
                />
              }
              label={item.title}
            />
          )
        }
      />
      {item.details || isEdit ? (
        <CardContent>
          {isEdit ? (
            <TextField
              defaultValue={item.details}
              label="Details"
              onChange={(e) => setEditDesc(e.target.value)}
              fullWidth={true}
              //multiline={true}
            />
          ) : (
            <Typography variant="body2" component="p">
              {item.details}
            </Typography>
          )}
        </CardContent>
      ) : null}
      {item.tags && (
        <CardContent className={classes.chip}>
          {!isEdit ? (
            item.tags.map((tag, index) => {
              return <Chip key={index} label={tag} />;
            })
          ) : (
            <ChipInput
              defaultValue={item.tags}
              onChange={(e: Array<string>) => setEditTags(e)}
              label="Tags"
              fullWidth={true}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
};
