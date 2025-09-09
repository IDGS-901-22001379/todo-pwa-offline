// creating database structure
const db = new Dexie("Todo App");
db.version(1).stores({ todos: "++id, todo" });

const form   = document.querySelector("#new-task-form");
const input  = document.querySelector("#new-task-input");
const listEl = document.querySelector("#tasks");

// Escapar para evitar romper el HTML al renderizar valores
function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// add todo
form.onsubmit = async (event) => {
  event.preventDefault();
  const todo = input.value.trim();
  if (!todo) return;

  await db.todos.add({ todo });
  await getTodos();
  form.reset();
};

// display todo
const getTodos = async () => {
  // reverse correcto: ordenamos por id y luego invertimos
  const allTodos = await db.todos.orderBy("id").reverse().toArray();

  listEl.innerHTML = allTodos
    .map(
      (t) => `
      <div class="task" data-id="${t.id}">
        <div class="content">
          <input id="edit-${t.id}" class="text" readonly="readonly" type="text" value="${esc(t.todo)}">
        </div>
        <div class="actions">
          <button class="delete" onclick="deleteTodo(event, ${t.id})">Delete</button>
        </div>
      </div>`
    )
    .join("");
};

window.onload = getTodos;

// delete todo
window.deleteTodo = async (_event, id) => {
  await db.todos.delete(id);
  await getTodos();
};
