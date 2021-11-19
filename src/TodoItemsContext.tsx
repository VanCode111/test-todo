import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  done: boolean;
  tags?: Array<string>;
}

export interface ITodoItem {
  title: string;
  details?: string;
  tags?: Array<string>;
}

interface TodoItemsState {
  todoItems: TodoItem[];
}

interface ActionLoadState {
  type: "loadState";
  data: TodoItem[];
}

interface ActionAdd {
  type: "add";
  data: ITodoItem;
}

interface ActionDeletes {
  type: "delete";
  data: { id: string };
}

interface ActionToggleDone {
  type: "toggleDone";
  data: { id: string };
}

export interface ITodoItemEdit extends ITodoItem {
  id: string;
}

interface ActionEdit {
  type: "edit";
  data: ITodoItemEdit;
}

type TodoItemsAction =
  | ActionAdd
  | ActionLoadState
  | ActionDeletes
  | ActionToggleDone
  | ActionEdit;

const TodoItemsContext = createContext<
  (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null);

const defaultState = { todoItems: [] };
const localStorageKey = "todoListState";

export const TodoItemsContextProvider = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const [state, dispatch] = useReducer<
    React.Reducer<TodoItemsState, TodoItemsAction>
  >(todoItemsReducer, defaultState);

  useEffect(() => {
    const savedState = localStorage.getItem(localStorageKey);

    if (savedState) {
      try {
        dispatch({
          type: "loadState",
          data: [...JSON.parse(savedState).todoItems],
        });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [state]);

  return (
    <TodoItemsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TodoItemsContext.Provider>
  );
};

export const useTodoItems = () => {
  const todoItemsContext = useContext(TodoItemsContext);

  if (!todoItemsContext) {
    throw new Error(
      "useTodoItems hook should only be used inside TodoItemsContextProvider"
    );
  }

  return todoItemsContext;
};

function todoItemsReducer(
  state: TodoItemsState,
  action: TodoItemsAction
): TodoItemsState {
  switch (action.type) {
    case "loadState": {
      return { todoItems: action.data };
    }
    case "add":
      return {
        ...state,
        todoItems: [
          { id: generateId(), done: false, ...action.data },
          ...state.todoItems,
        ],
      };
    case "delete":
      return {
        ...state,
        todoItems: state.todoItems.filter(({ id }) => id !== action.data.id),
      };
    case "edit":
      return {
        ...state,
        todoItems: state.todoItems.map((item) => {
          if (item.id !== action.data.id) {
            return item;
          }

          return {
            ...item,
            ...action.data,
          };
        }),
      };
    case "toggleDone":
      const itemIndex = state.todoItems.findIndex(
        ({ id }) => id === action.data.id
      );
      const item = state.todoItems[itemIndex];

      return {
        ...state,
        todoItems: [
          ...state.todoItems.slice(0, itemIndex),
          { ...item, done: !item.done },
          ...state.todoItems.slice(itemIndex + 1),
        ],
      };
    default:
      throw new Error();
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e16
  ).toString(36)}`;
}
