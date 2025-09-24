class AttendanceTracker {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.attendance = JSON.parse(localStorage.getItem('attendance')) || {};
        this.currentDate = new Date().toISOString().split('T')[0];
        
        this.initializeElements();
        this.bindEvents();
        this.loadInitialData();
        this.updateStats();
        this.renderAttendanceTable();
    }

    initializeElements() {
        // Header elements
        this.addStudentBtn = document.getElementById('addStudentBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Control elements
        this.attendanceDate = document.getElementById('attendanceDate');
        this.searchStudent = document.getElementById('searchStudent');
        this.classFilter = document.getElementById('classFilter');
        this.markAllPresentBtn = document.getElementById('markAllPresentBtn');
        this.selectAll = document.getElementById('selectAll');
        
        // Table elements
        this.attendanceTableBody = document.getElementById('attendanceTableBody');
        
        // Modal elements
        this.addStudentModal = document.getElementById('addStudentModal');
        this.addStudentForm = document.getElementById('addStudentForm');
        this.closeModal = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
        
        // Set current date
        this.attendanceDate.value = this.currentDate;
    }

    bindEvents() {
        // Header events
        this.addStudentBtn.addEventListener('click', () => this.showAddStudentModal());
        this.exportBtn.addEventListener('click', () => this.exportData());
        
        // Control events
        this.attendanceDate.addEventListener('change', (e) => {
            this.currentDate = e.target.value;
            this.updateStats();
            this.renderAttendanceTable();
        });
        
        this.searchStudent.addEventListener('input', () => this.renderAttendanceTable());
        this.classFilter.addEventListener('change', () => this.renderAttendanceTable());
        this.markAllPresentBtn.addEventListener('click', () => this.markAllPresent());
        this.selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        
        // Modal events
        this.closeModal.addEventListener('click', () => this.hideAddStudentModal());
        this.cancelBtn.addEventListener('click', () => this.hideAddStudentModal());
        this.addStudentForm.addEventListener('submit', (e) => this.handleAddStudent(e));
        
        // Close modal on outside click
        this.addStudentModal.addEventListener('click', (e) => {
            if (e.target === this.addStudentModal) {
                this.hideAddStudentModal();
            }
        });
    }

    loadInitialData() {
        // Add sample students if none exist
        if (this.students.length === 0) {
            this.students = [
                { id: 'STU001', name: 'Alice Johnson', class: 'Grade 10A', email: 'alice@school.edu' },
                { id: 'STU002', name: 'Bob Smith', class: 'Grade 10A', email: 'bob@school.edu' },
                { id: 'STU003', name: 'Carol Davis', class: 'Grade 10B', email: 'carol@school.edu' },
                { id: 'STU004', name: 'David Wilson', class: 'Grade 10B', email: 'david@school.edu' },
                { id: 'STU005', name: 'Eva Brown', class: 'Grade 11A', email: 'eva@school.edu' },
                { id: 'STU006', name: 'Frank Miller', class: 'Grade 11A', email: 'frank@school.edu' },
                { id: 'STU007', name: 'Grace Lee', class: 'Grade 11B', email: 'grace@school.edu' },
                { id: 'STU008', name: 'Henry Taylor', class: 'Grade 11B', email: 'henry@school.edu' }
            ];
            this.saveData();
        }
        
        // Populate class filter
        this.populateClassFilter();
    }

    populateClassFilter() {
        const classes = [...new Set(this.students.map(student => student.class))].sort();
        this.classFilter.innerHTML = '<option value="">All Classes</option>';
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            this.classFilter.appendChild(option);
        });
    }

    showAddStudentModal() {
        this.addStudentModal.classList.add('show');
        document.getElementById('studentId').focus();
    }

    hideAddStudentModal() {
        this.addStudentModal.classList.remove('show');
        this.addStudentForm.reset();
    }

    handleAddStudent(e) {
        e.preventDefault();
        
        const studentData = {
            id: document.getElementById('studentId').value.trim(),
            name: document.getElementById('studentName').value.trim(),
            class: document.getElementById('studentClass').value.trim(),
            email: document.getElementById('studentEmail').value.trim()
        };

        // Validate student ID uniqueness
        if (this.students.some(student => student.id === studentData.id)) {
            this.showToast('Student ID already exists!', 'error');
            return;
        }

        this.students.push(studentData);
        this.saveData();
        this.populateClassFilter();
        this.updateStats();
        this.renderAttendanceTable();
        this.hideAddStudentModal();
        this.showToast('Student added successfully!', 'success');
    }

    markAttendance(studentId, status) {
        const dateKey = this.currentDate;
        if (!this.attendance[dateKey]) {
            this.attendance[dateKey] = {};
        }
        
        this.attendance[dateKey][studentId] = {
            status: status,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        };
        
        this.saveData();
        this.updateStats();
        this.renderAttendanceTable();
        
        const student = this.students.find(s => s.id === studentId);
        this.showToast(`${student.name} marked as ${status}`, 'success');
    }

    markAllPresent() {
        const filteredStudents = this.getFilteredStudents();
        const dateKey = this.currentDate;
        
        if (!this.attendance[dateKey]) {
            this.attendance[dateKey] = {};
        }
        
        filteredStudents.forEach(student => {
            this.attendance[dateKey][student.id] = {
                status: 'present',
                time: new Date().toLocaleTimeString(),
                timestamp: Date.now()
            };
        });
        
        this.saveData();
        this.updateStats();
        this.renderAttendanceTable();
        this.showToast(`Marked ${filteredStudents.length} students as present`, 'success');
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.student-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    getFilteredStudents() {
        let filtered = [...this.students];
        
        // Filter by search term
        const searchTerm = this.searchStudent.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(student => 
                student.name.toLowerCase().includes(searchTerm) ||
                student.id.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by class
        const classFilter = this.classFilter.value;
        if (classFilter) {
            filtered = filtered.filter(student => student.class === classFilter);
        }
        
        return filtered;
    }

    renderAttendanceTable() {
        const filteredStudents = this.getFilteredStudents();
        const dateKey = this.currentDate;
        const todayAttendance = this.attendance[dateKey] || {};
        
        this.attendanceTableBody.innerHTML = '';
        
        filteredStudents.forEach(student => {
            const attendance = todayAttendance[student.id];
            const status = attendance ? attendance.status : 'unmarked';
            const time = attendance ? attendance.time : '-';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="student-checkbox" data-student-id="${student.id}">
                </td>
                <td><strong>${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>
                    <span class="status-badge status-${status}">${status}</span>
                </td>
                <td>
                    <span class="time-badge">${time}</span>
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-success" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" 
                                onclick="attendanceTracker.markAttendance('${student.id}', 'present')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" 
                                onclick="attendanceTracker.markAttendance('${student.id}', 'absent')">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" 
                                onclick="attendanceTracker.removeStudent('${student.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            this.attendanceTableBody.appendChild(row);
        });
    }

    removeStudent(studentId) {
        if (confirm('Are you sure you want to remove this student?')) {
            this.students = this.students.filter(student => student.id !== studentId);
            
            // Remove from all attendance records
            Object.keys(this.attendance).forEach(date => {
                delete this.attendance[date][studentId];
            });
            
            this.saveData();
            this.populateClassFilter();
            this.updateStats();
            this.renderAttendanceTable();
            this.showToast('Student removed successfully', 'success');
        }
    }

    updateStats() {
        const dateKey = this.currentDate;
        const todayAttendance = this.attendance[dateKey] || {};
        const filteredStudents = this.getFilteredStudents();
        
        const totalStudents = filteredStudents.length;
        const presentCount = filteredStudents.filter(student => 
            todayAttendance[student.id]?.status === 'present'
        ).length;
        const absentCount = filteredStudents.filter(student => 
            todayAttendance[student.id]?.status === 'absent'
        ).length;
        const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
        
        document.getElementById('totalPresent').textContent = presentCount;
        document.getElementById('totalAbsent').textContent = absentCount;
        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
    }

    exportData() {
        const exportData = {
            students: this.students,
            attendance: this.attendance,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `attendance-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Data exported successfully!', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    saveData() {
        localStorage.setItem('students', JSON.stringify(this.students));
        localStorage.setItem('attendance', JSON.stringify(this.attendance));
    }
}

// Initialize the application
const attendanceTracker = new AttendanceTracker();