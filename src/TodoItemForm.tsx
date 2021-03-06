import { useTodoItems } from "./TodoItemsContext";
import { useForm, Controller } from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { ITodoItem } from "./TodoItemsContext";
import { makeStyles } from "@material-ui/core/styles";
import ChipInput from "material-ui-chip-input";

const useInputStyles = makeStyles(() => ({
  root: {
    marginBottom: 24,
  },
}));

export default function TodoItemForm() {
  const classes = useInputStyles();
  const { dispatch } = useTodoItems();
  const { control, handleSubmit, reset, watch } = useForm();

  return (
    <form
      onSubmit={handleSubmit((formData: ITodoItem) => {
        dispatch({ type: "add", data: formData });
        reset({ title: "", details: "", tags: [] });
      })}
    >
      <Controller
        name="title"
        control={control}
        defaultValue=""
        rules={{ required: true }}
        render={({ field }) => (
          <TextField
            {...field}
            label="TODO"
            fullWidth={true}
            className={classes.root}
          />
        )}
      />
      <Controller
        name="details"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Details"
            fullWidth={true}
            multiline={true}
            className={classes.root}
          />
        )}
      />

      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <ChipInput
            onChange={field.onChange}
            value={field.value}
            onDelete={(e) =>
              field.onChange(field.value.filter((item: string) => item !== e))
            }
            onAdd={(e) => field.onChange([...field.value, e])}
            label="Tags"
            fullWidth={true}
            className={classes.root}
          />
        )}
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={!watch("title")}
      >
        Add
      </Button>
    </form>
  );
}
