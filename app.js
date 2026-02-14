/**
 * DevTeam - Team Management SaaS Application
 * Core Logic: State Management, UI Rendering, and Event Handling
 */

// --- State Management ---

const defaultData = {
    teams: [
        { id: 1, name: 'Sarah Connor', role: 'Frontend Lead', email: 'sarah@devteam.io', avatar: 'SC' },
        { id: 2, name: 'John Reese', role: 'Backend Engineer', email: 'john@devteam.io', avatar: 'JR' },
        { id: 3, name: 'Harold Finch', role: 'Product Manager', email: 'harold@devteam.io', avatar: 'HF' },
        { id: 4, name: 'Sameen Shaw', role: 'DevOps Engineer', email: 'shaw@devteam.io', avatar: 'SS' }
    ],
    projects: [
        { id: 1, name: 'Website Redesign', description: 'Overhaul of the corporate website.', status: 'Active', deadline: '2023-12-31' },
        { id: 2, name: 'Mobile App Beta', description: 'First release of the iOS app.', status: 'In Progress', deadline: '2023-11-15' },
        { id: 3, name: 'API Migration', description: 'Migrate legacy API to GraphQL.', status: 'Planning', deadline: '2024-02-20' }
    ],
    tasks: [
        { id: 1, projectId: 1, title: 'Design Homepage Mockups', assigneeId: 1, status: 'Completed', priority: 'High' },
        { id: 2, projectId: 1, title: 'Implement Responsive Nav', assigneeId: 1, status: 'In Progress', priority: 'Medium' },
        { id: 3, projectId: 2, title: 'Setup CI/CD Pipeline', assigneeId: 4, status: 'To Do', priority: 'High' },
        { id: 4, projectId: 3, title: 'Database Schema Design', assigneeId: 2, status: 'In Progress', priority: 'High' }
    ]
};

let appState = JSON.parse(localStorage.getItem('devTeamData')) || defaultData;

function saveState() {
    localStorage.setItem('devTeamData', JSON.stringify(appState));
    showToast('Changes saved successfully');
}

// --- DOM Elements ---

const contentContainer = document.getElementById('content-container');
const pageTitle = document.getElementById('page-title');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const toast = document.getElementById('toast');
const globalAddBtn = document.getElementById('global-add-btn');

// --- Navigation ---

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        // Handle active state
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const view = e.currentTarget.dataset.view;
        renderView(view);
    });
});

function renderView(viewName) {
    contentContainer.innerHTML = '';
    
    // Update Global Add Button context
    refreshGlobalAddButton(viewName);

    switch(viewName) {
        case 'dashboard':
            pageTitle.innerText = 'Dashboard';
            renderDashboard();
            break;
        case 'projects':
            pageTitle.innerText = 'Projects';
            renderProjects();
            break;
        case 'tasks':
            pageTitle.innerText = 'Tasks';
            renderTasks();
            break;
        case 'team':
            pageTitle.innerText = 'Team Members';
            renderTeam();
            break;
        default:
            renderDashboard();
    }
}

function refreshGlobalAddButton(viewName) {
    if (viewName === 'dashboard') {
        globalAddBtn.style.display = 'none';
        return;
    }
    globalAddBtn.style.display = 'flex';
    globalAddBtn.onclick = () => openModal(viewName);
}

// --- Render Functions ---

function renderDashboard() {
    const totalProjects = appState.projects.length;
    const activeTasks = appState.tasks.filter(t => t.status !== 'Completed').length;
    const teamSize = appState.teams.length;

    const html = `
        <div class="dashboard-grid">
            <div class="card stat-card">
                <div class="stat-icon" style="background: #EEF2FF; color: #4F46E5;">
                    <ion-icon name="folder-open"></ion-icon>
                </div>
                <div class="stat-info">
                    <strong>${totalProjects}</strong>
                    <span>Active Projects</span>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon" style="background: #ECFDF5; color: #10B981;">
                    <ion-icon name="checkbox"></ion-icon>
                </div>
                <div class="stat-info">
                    <strong>${activeTasks}</strong>
                    <span>Pending Tasks</span>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon" style="background: #FEF3C7; color: #D97706;">
                    <ion-icon name="people"></ion-icon>
                </div>
                <div class="stat-info">
                    <strong>${teamSize}</strong>
                    <span>Team Members</span>
                </div>
            </div>
        </div>

        <div class="card">
            <h3>Recent Tasks</h3>
            <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Project</th>
                        <th>Assignee</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${appState.tasks.slice(0, 5).map(task => {
                        const project = appState.projects.find(p => p.id == task.projectId)?.name || 'Unknown';
                        const assignee = appState.teams.find(t => t.id == task.assigneeId)?.name || 'Unassigned';
                        return `
                        <tr>
                            <td>${task.title}</td>
                            <td>${project}</td>
                            <td>${assignee}</td>
                            <td><span class="status-badge ${getStatusClass(task.status)}">${task.status}</span></td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            </div>
        </div>
    `;
    contentContainer.innerHTML = html;
}

function renderProjects() {
    const html = `
        <div class="grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${appState.projects.map(project => {
                const projectTasks = appState.tasks.filter(t => t.projectId === project.id);
                const completed = projectTasks.filter(t => t.status === 'Completed').length;
                const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;

                return `
                <div class="card" style="display: flex; flex-direction: column; height: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <h3 style="margin: 0;">${project.name}</h3>
                        <span class="status-badge ${getStatusClass(project.status)}">${project.status}</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; flex: 1;">${project.description}</p>
                    
                    <div style="margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 5px;">
                            <span>Progress</span>
                            <span>${progress}%</span>
                        </div>
                        <div style="width: 100%; background: #E5E7EB; height: 6px; border-radius: 3px;">
                            <div style="width: ${progress}%; background: var(--primary); height: 100%; border-radius: 3px;"></div>
                        </div>
                    </div>

                    <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px;">
                        <button onclick="deleteItem('projects', ${project.id})" class="btn-text" style="color: var(--danger);">Delete</button>
                        <button onclick="openModal('projects', ${project.id})" class="btn-secondary">Edit</button>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
    contentContainer.innerHTML = html;
}

function renderTasks() {
    const html = `
        <div class="card">
            <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Project</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appState.tasks.map(task => {
                        const project = appState.projects.find(p => p.id == task.projectId)?.name || 'Unknown';
                        const assignee = appState.teams.find(t => t.id == task.assigneeId)?.name || 'Unassigned'; // Fixed type coercion
                        return `
                        <tr>
                            <td>${task.title}</td>
                            <td>${project}</td>
                            <td><span style="color: ${getPriorityColor(task.priority)}; font-weight: 600;">${task.priority}</span></td>
                            <td>${assignee}</td>
                            <td><span class="status-badge ${getStatusClass(task.status)}">${task.status}</span></td>
                            <td style="display: flex; gap: 10px;">
                                <button onclick="openModal('tasks', ${task.id})" class="btn-text">Edit</button>
                                <button onclick="deleteItem('tasks', ${task.id})" class="btn-text" style="color: var(--danger);">
                                    <ion-icon name="trash-outline"></ion-icon>
                                </button>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            </div>
        </div>
    `;
    contentContainer.innerHTML = html;
}

function renderTeam() {
    const html = `
        <div class="grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
            ${appState.teams.map(member => `
                <div class="card" style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: #E0E7FF; color: #4F46E5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 15px;">
                        ${member.avatar}
                    </div>
                    <h3>${member.name}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 5px;">${member.role}</p>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">${member.email}</p>
                    
                    <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
                        <button onclick="openModal('team', ${member.id})" class="btn-secondary">Edit</button>
                        <button onclick="deleteItem('teams', ${member.id})" class="btn-text" style="color: var(--danger);">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    contentContainer.innerHTML = html;
}

// --- Helper Functions ---

function getStatusClass(status) {
    if (['Active', 'Completed', 'Done'].includes(status)) return 'status-completed';
    if (['In Progress'].includes(status)) return 'status-active';
    return 'status-pending'; // To Do, Planning, Default
}

function getPriorityColor(priority) {
    if (priority === 'High') return '#EF4444';
    if (priority === 'Medium') return '#F59E0B';
    return '#10B981';
}

function showToast(message) {
    const toastMsg = document.getElementById('toast-message');
    toastMsg.innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// --- Modal & Form Handling ---

// Close Modal
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });
});

window.openModal = function(type, id = null) {
    modalOverlay.classList.remove('hidden');
    let title = '';
    let body = '';
    
    // Determine Edit or Create
    const isEdit = id !== null;
    let data = null;

    if (isEdit) {
        if (type === 'team') data = appState.teams.find(x => x.id === id);
        if (type === 'projects') data = appState.projects.find(x => x.id === id);
        if (type === 'tasks') data = appState.tasks.find(x => x.id === id);
    }

    if (type === 'team') {
        title = isEdit ? 'Edit Team Member' : 'Add Team Member';
        body = `
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" id="team-name" class="form-input" value="${data ? data.name : ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Role</label>
                <input type="text" id="team-role" class="form-input" value="${data ? data.role : ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="team-email" class="form-input" value="${data ? data.email : ''}">
            </div>
        `;
        modalConfirmBtn.onclick = () => saveTeamMember(id);
    } else if (type === 'projects') {
        title = isEdit ? 'Edit Project' : 'New Project';
        body = `
            <div class="form-group">
                <label class="form-label">Project Name</label>
                <input type="text" id="proj-name" class="form-input" value="${data ? data.name : ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Status</label>
                <select id="proj-status" class="form-select">
                    <option value="Active" ${data && data.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="In Progress" ${data && data.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Planning" ${data && data.status === 'Planning' ? 'selected' : ''}>Planning</option>
                    <option value="Completed" ${data && data.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="proj-desc" class="form-textarea">${data ? data.description : ''}</textarea>
            </div>
        `;
        modalConfirmBtn.onclick = () => saveProject(id);
    } else if (type === 'tasks') {
        title = isEdit ? 'Edit Task' : 'New Task';
        const projectOptions = appState.projects.map(p => `<option value="${p.id}" ${data && data.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('');
        const assigneeOptions = appState.teams.map(t => `<option value="${t.id}" ${data && data.assigneeId === t.id ? 'selected' : ''}>${t.name}</option>`).join('');
        
        body = `
            <div class="form-group">
                <label class="form-label">Task Title</label>
                <input type="text" id="task-title" class="form-input" value="${data ? data.title : ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Project</label>
                <select id="task-project" class="form-select">${projectOptions}</select>
            </div>
            <div class="form-group">
                <label class="form-label">Assignee</label>
                <select id="task-assignee" class="form-select">${assigneeOptions}</select>
            </div>
            <div class="form-group">
                <label class="form-label">Priority</label>
                <select id="task-priority" class="form-select">
                    <option value="High" ${data && data.priority === 'High' ? 'selected' : ''}>High</option>
                    <option value="Medium" ${data && data.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="Low" ${data && data.priority === 'Low' ? 'selected' : ''}>Low</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Status</label>
                <select id="task-status" class="form-select">
                    <option value="To Do" ${data && data.status === 'To Do' ? 'selected' : ''}>To Do</option>
                    <option value="In Progress" ${data && data.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${data && data.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
        `;
        modalConfirmBtn.onclick = () => saveTask(id);
    }

    modalTitle.innerText = title;
    modalBody.innerHTML = body;
};

window.deleteItem = function(type, id) {
    if(!confirm('Are you sure you want to delete this item?')) return;
    
    // Type is 'teams', 'projects', or 'tasks' based on array name in state
    appState[type] = appState[type].filter(item => item.id !== id);
    saveState();
    
    // Re-render current view based on active nav
    const activeView = document.querySelector('.nav-item.active').dataset.view;
    renderView(activeView);
}

// --- Save Handlers ---

function saveTeamMember(id) {
    const name = document.getElementById('team-name').value;
    const role = document.getElementById('team-role').value;
    const email = document.getElementById('team-email').value;
    
    if (!name || !role) return alert('Name and Role are required');

    const avatar = name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2);
    
    if (id) {
        const index = appState.teams.findIndex(t => t.id === id);
        appState.teams[index] = { ...appState.teams[index], name, role, email, avatar };
    } else {
        const newId = Math.max(...appState.teams.map(t => t.id), 0) + 1;
        appState.teams.push({ id: newId, name, role, email, avatar });
    }
    
    finalizeSave('team');
}

function saveProject(id) {
    const name = document.getElementById('proj-name').value;
    const status = document.getElementById('proj-status').value;
    const desc = document.getElementById('proj-desc').value;

    if (!name) return alert('Project Name is required');

    if (id) {
        const index = appState.projects.findIndex(p => p.id === id);
        appState.projects[index] = { ...appState.projects[index], name, status, description: desc };
    } else {
        const newId = Math.max(...appState.projects.map(p => p.id), 0) + 1;
        appState.projects.push({ id: newId, name, status, description: desc });
    }
    finalizeSave('projects');
}

function saveTask(id) {
    const title = document.getElementById('task-title').value;
    const projectId = parseInt(document.getElementById('task-project').value);
    const assigneeId = parseInt(document.getElementById('task-assignee').value);
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value;

    if (!title) return alert('Task Title is required');

    if (id) {
        const index = appState.tasks.findIndex(t => t.id === id);
        appState.tasks[index] = { ...appState.tasks[index], title, projectId, assigneeId, priority, status };
    } else {
        const newId = Math.max(...appState.tasks.map(t => t.id), 0) + 1;
        appState.tasks.push({ id: newId, title, projectId, assigneeId, priority, status });
    }
    finalizeSave('tasks');
}

function finalizeSave(viewToRender) {
    saveState();
    modalOverlay.classList.add('hidden');
    renderView(viewToRender);
}

// --- Initialization ---

// Start with Dashboard
renderView('dashboard');
refreshGlobalAddButton('dashboard');
