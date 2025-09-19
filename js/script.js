// Todo List Application
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.initElements();
        this.bindEvents();
        this.render();
    }

    initElements() {
        this.todoForm = document.getElementById('todoForm');
        this.taskInput = document.getElementById('taskInput');
        this.dateInput = document.getElementById('dateInput');
        this.todoList = document.getElementById('todoList');
        this.deleteAllBtn = document.getElementById('deleteAllBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        this.deleteAllBtn.addEventListener('click', () => this.deleteAllTodos());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    handleAddTodo(e) {
        e.preventDefault();
        
        const taskText = this.taskInput.value.trim();
        const dueDate = this.dateInput.value;
        
        if (!this.validateInput(taskText, dueDate)) {
            return;
        }

        const newTodo = {
            id: Date.now(),
            task: taskText,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(newTodo);
        this.saveTodos();
        this.render();
        this.resetForm();
        
        // Success animation
        this.showSuccessMessage();
    }

    validateInput(task, date) {
        if (!task) {
            alert('Mohon masukkan task!');
            return false;
        }
        
        if (!date) {
            alert('Mohon pilih tanggal!');
            return false;
        }
        
        // Check if date is not in the past
        const today = new Date().toDateString();
        const selectedDate = new Date(date).toDateString();
        
        if (new Date(selectedDate) < new Date(today)) {
            if (!confirm('Tanggal yang dipilih sudah terlewat. Tetap lanjutkan?')) {
                return false;
            }
        }
        
        return true;
    }

    resetForm() {
        this.taskInput.value = '';
        this.dateInput.value = '';
        this.taskInput.focus();
    }

    showSuccessMessage() {
        const btn = document.querySelector('.add-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓';
        btn.style.background = 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 1000);
    }

    handleFilter(e) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        if (confirm('Yakin ingin menghapus task ini?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    deleteAllTodos() {
        if (this.todos.length === 0) {
            alert('Tidak ada task untuk dihapus!');
            return;
        }
        
        if (confirm(`Yakin ingin menghapus semua ${this.todos.length} task?`)) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            default:
                return this.todos;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        };
        return date.toLocaleDateString('id-ID', options);
    }

    isOverdue(dateString) {
        const today = new Date();
        const dueDate = new Date(dateString);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = '<div class="empty-state">No task found</div>';
            return;
        }

        const todosHtml = filteredTodos.map(todo => {
            const isOverdue = this.isOverdue(todo.dueDate) && !todo.completed;
            const statusClass = todo.completed ? 'status-completed' : 'status-pending';
            const statusText = todo.completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending');
            
            return `
                <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    <div class="task-text">${this.escapeHtml(todo.task)}</div>
                    <div class="task-date">${this.formatDate(todo.dueDate)}</div>
                    <div class="status-badge ${statusClass}">${statusText}</div>
                    <div class="actions">
                        <button class="action-btn complete-btn" onclick="todoApp.toggleTodo(${todo.id})" title="${todo.completed ? 'Mark as pending' : 'Mark as completed'}">
                            ${todo.completed ? '↶' : '✓'}
                        </button>
                        <button class="action-btn delete-btn" onclick="todoApp.deleteTodo(${todo.id})" title="Delete task">
                            ×
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.todoList.innerHTML = todosHtml;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
    }

loadTodos() {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Set default date to today
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('dateInput');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
});