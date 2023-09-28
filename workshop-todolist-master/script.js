const form = document.querySelector('.create-task-form');
const taskList = document.querySelector('.collection');
const filter = document.querySelector('.filter-input');
const clearBtn = document.querySelector('.clear-tasks');
const taskInput = document.querySelector('.task-input');

document.addEventListener('DOMContentLoaded', loadTasks);
form.addEventListener('submit', createTask);
taskList.addEventListener('click', updateOrDelete);
clearBtn.addEventListener('click', removeAllTasks);
filter.addEventListener('keyup', filterItem);

let taskId = Number(localStorage.getItem('taskId')) || 0;

function showIcons(li) {
  const deleteElement = document.createElement('span');
  deleteElement.className = 'delete-item';
  deleteElement.innerHTML = '<i class="fa fa-remove"><i>';
  li.appendChild(deleteElement);

  const editElement = document.createElement('span');
  editElement.className = 'edit-item';
  editElement.innerHTML = '<i class="fa fa-edit"><i>';
  li.appendChild(editElement);
}

function loadTasks() {
  let tasks;

  if (localStorage.getItem('tasks') !== null) {
    tasks = JSON.parse(localStorage.getItem('tasks'));
  } else {
    tasks = [];
  }

  tasks.forEach(function (task) {
    const li = document.createElement('li');
    li.className = 'collection-item';
    li.appendChild(document.createTextNode(task.summary));
    li.dataset.taskId = task.id;

    showIcons(li);

    taskList.appendChild(li);
  });
}

function createTask(event) {
  if (taskInput.value.trim() === '') {
    event.preventDefault();
    return null;
  }

  const li = document.createElement('li');
  li.className = 'collection-item';
  li.dataset.taskId = taskId;
  li.appendChild(document.createTextNode(taskInput.value));
  taskList.appendChild(li);
  storeTaskInLocalStorage(taskInput.value, taskId);

  showIcons(li);

  //clear the input field
  taskInput.value = '';
  // block default behaviour of submit button (append text to the URL)
  event.preventDefault();

  taskId++;
  localStorage.setItem('taskId', taskId);
}

function updateOrDelete(event) {
  const iconContainer = event.target.parentElement;
  const collectionItem = iconContainer.parentElement;
  const taskId = Number(collectionItem.dataset.taskId);

  if (iconContainer.classList.contains('delete-item')) {
    if (confirm('Do you really want to delete this task?')) {
      collectionItem.remove();
      deleteTaskInLocalStorage(collectionItem, taskId);
    }
  } else if (iconContainer.classList.contains('edit-item')) {
    collectionItem.textContent =
      prompt('Edit task summary', collectionItem.textContent) ||
      collectionItem.textContent;

    showIcons(collectionItem);
    updateTaskInLocalStorage(collectionItem, taskId);
  }
}

function storeTaskInLocalStorage(summary, id) {
  let tasks;
  if (localStorage.getItem('tasks') !== null) {
    tasks = JSON.parse(localStorage.getItem('tasks'));
  } else {
    tasks = [];
  }

  tasks.push({ summary, id });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskInLocalStorage(taskItemAsHTMLElement, id) {
  let tasks;
  tasks = JSON.parse(localStorage.getItem('tasks'));

  const objectIndex = tasks.findIndex(obj => obj.id === id);
  tasks[objectIndex].summary = taskItemAsHTMLElement.textContent;
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteTaskInLocalStorage(taskItemAsHTMLElement, id) {
  let tasks;

  if (localStorage.getItem('tasks') !== null) {
    tasks = JSON.parse(localStorage.getItem('tasks'));
  } else {
    tasks = [];
  }

  tasks.forEach(function (task, index) {
    if (taskItemAsHTMLElement.textContent === task.summary && id === task.id) {
      tasks.splice(index, 1);
    }
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeAllTasks() {
  if (confirm('Do you really want to delete all tasks?')) {
    //delete all content inside the list
    taskList.innerHTML = '';
    removeAllTasksFromLocalStorage();
  }
}

function removeAllTasksFromLocalStorage() {
  localStorage.clear();
}

function filterItem(event) {
  const filterQuery = event.target.value.toLowerCase();
  //find all task elements on the page
  document
    .querySelectorAll('.collection-item')
    .forEach(function (taskItemAsHTMLElement) {
      const taskText =
        taskItemAsHTMLElement.firstChild.textContent.toLowerCase();
      if (taskText.includes(filterQuery)) {
        taskItemAsHTMLElement.style.display = 'block';
      } else {
        taskItemAsHTMLElement.style.display = 'none';
      }
    });
}
