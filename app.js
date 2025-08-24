// app.js - Improved version for Engineering Life (by Vengababu 🚀)

// ✅ Supabase Client
const supabaseUrl = 'https://ylwqbywihmtnvnmhljod.supabase.co';
const supabaseKey = '<YOUR_SUPABASE_KEY>'; // keep this safe
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ✅ Page routing
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const page = document.getElementById(pageId);
    if (page) page.style.display = 'block';
}

// ✅ Global loading state
function setLoading(isLoading, msg = "Loading...") {
    let loader = document.getElementById("global-loader");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "global-loader";
        loader.style.position = "fixed";
        loader.style.top = "0";
        loader.style.left = "0";
        loader.style.width = "100%";
        loader.style.height = "100%";
        loader.style.background = "rgba(0,0,0,0.5)";
        loader.style.color = "#fff";
        loader.style.display = "flex";
        loader.style.alignItems = "center";
        loader.style.justifyContent = "center";
        loader.style.zIndex = "1000";
        loader.style.fontSize = "1.2rem";
        document.body.appendChild(loader);
    }
    loader.innerText = msg;
    loader.style.display = isLoading ? "flex" : "none";
}

// ✅ Handle login
async function login() {
    const email = document.getElementById("email").value.trim();
    if (!email) {
        alert("Please enter your email.");
        return;
    }

    setLoading(true, "Sending login link...");

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: 'https://vengababu.github.io/Engeenering-life/'
        }
    });

    setLoading(false);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("✅ Check your email for the login link.");
    }
}

// ✅ Save Student Info
async function saveStudentInfo() {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const branch = document.getElementById("branch").value.trim();

    if (!name || !phone || !branch) {
        alert("⚠️ Please fill all fields.");
        return;
    }

    setLoading(true, "Saving your info...");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("No user session found.");
        setLoading(false);
        return;
    }

    const { error } = await supabase
        .from('students')
        .upsert([{ id: user.id, name, phone, branch }]);

    setLoading(false);

    if (error) {
        alert("Error: " + error.message);
    } else {
        showPage("welcome-page");
        document.getElementById("student-info-display").innerText =
            `Welcome, ${name} (${branch})`;
    }
}

// ✅ Load Courses
async function loadCourses() {
    setLoading(true, "Loading courses...");
    const { data, error } = await supabase.from("courses").select("*");
    setLoading(false);

    const list = document.getElementById("course-list");
    list.innerHTML = "";

    if (error) {
        list.innerHTML = `<p style="color:red;">Error loading courses.</p>`;
        return;
    }

    data.forEach(course => {
        const div = document.createElement("div");
        div.className = "course-card";
        div.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <button onclick="viewCourse(${course.id})">View</button>
        `;
        list.appendChild(div);
    });
}

// ✅ Load My Book (Enrolled Courses)
async function loadMyBook() {
    setLoading(true, "Loading your courses...");
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from("enrollments")
        .select("courses(*)")
        .eq("student_id", user.id);
    setLoading(false);

    const list = document.getElementById("mybook-list");
    list.innerHTML = "";

    if (error) {
        list.innerHTML = `<p style="color:red;">Error loading enrolled courses.</p>`;
        return;
    }

    data.forEach(enrollment => {
        const course = enrollment.courses;
        const div = document.createElement("div");
        div.className = "course-card";
        div.innerHTML = `
            <h3>${course.title}</h3>
            <button onclick="viewCourse(${course.id})">Go to Course</button>
        `;
        list.appendChild(div);
    });
}

// ✅ View Course Detail
async function viewCourse(courseId) {
    setLoading(true, "Loading course...");
    const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("course_id", courseId);
    setLoading(false);

    showPage("course-detail-page");
    const container = document.getElementById("course-detail");
    container.innerHTML = "";

    if (error) {
        container.innerHTML = `<p style="color:red;">Error loading course.</p>`;
        return;
    }

    data.forEach(unit => {
        const div = document.createElement("div");
        div.className = "unit-card";
        div.innerHTML = `
            <h4>${unit.title}</h4>
            <p>${unit.content || ""}</p>
            <button onclick="completeUnit(${unit.id})">Mark Complete</button>
        `;
        container.appendChild(div);
    });
}

// ✅ Complete Unit
async function completeUnit(unitId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from("unit_progress")
        .upsert([{ unit_id: unitId, student_id: user.id, completed: true }]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("🎉 Unit marked complete!");
    }
}

// ✅ Load Profile
async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();

    const container = document.getElementById("profile-info");
    container.innerHTML = "";

    if (error) {
        container.innerHTML = `<p style="color:red;">Error loading profile.</p>`;
        return;
    }

    container.innerHTML = `
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Branch:</strong> ${data.branch}</p>
        <button onclick="logout()">Logout</button>
    `;
}

// ✅ Logout
async function logout() {
    await supabase.auth.signOut();
    showPage("login-page");
}

// ✅ Init
window.onload = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showPage("home-page");
        loadCourses();
    } else {
        showPage("login-page");
    }
};

