// GET ENTRIES
function getEntries() {
    return JSON.parse(localStorage.getItem("diaryEntries") || "[]");
}

// SAVE ENTRIES
function saveEntries(entries) {
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
}

// DELETE
function deleteEntry(id) {
    const yakin = confirm("Are you sure want to delete this journal ?");
    if (!yakin) return; 
    let entries = getEntries();
    entries = entries.filter(e => e.id !== id);
    saveEntries(entries);
    location.reload();
}

// EDIT (REDIRECT TO FORM WITH ID)
function editEntry(id) {
    window.location.href = `form.html?id=${id}`;
}

// FORM PAGE LOGIC
if (document.body.contains(document.getElementById("entryForm"))) {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");

    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const imageInput = document.getElementById("image");
    const chooseImageBtn = document.getElementById("chooseImageBtn");
    const previewImg = document.getElementById("previewImg");

    //if upload photo
    chooseImageBtn.addEventListener("click", () => {
        imageInput.click();
    });

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            previewImg.src = reader.result;
            previewImg.style.display = "block";
            chooseImageBtn.innerText = "Change Image📷";

        };
        reader.readAsDataURL(file);
    });

    // If editing
    if (editId) {
        const entry = getEntries().find(e => e.id == editId);

        if (!entry) { window.location.replace("index.html"); throw new Error("Journal not found"); }
        document.getElementById("form-title").innerText = "Edit Entry";
        titleInput.value = entry.title;
        contentInput.value = entry.content;

        if (entry.image) {
            previewImg.src = entry.image;
            previewImg.style.display = "block";
        }
    }

    //if date
    const dateEl = document.getElementById("journal-date");
    if (dateEl) {
        const today = new Date();
        const options = {
            weekday: "long",
            day: "2-digit",
            month: "short"
        };
        dateEl.innerText = today.toLocaleDateString("en-US", options);
    }     

    // SUBMIT FORM
    document.getElementById("entryForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const title = titleInput.value;
        const content = contentInput.value;
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const file = imageInput.files[0];


        let entries = getEntries();

        const saveData = (imageBase64 = "") => {
            if (editId) {
                const idx = entries.findIndex(e => e.id == editId);
                entries[idx] = {
                    ...entries[idx],
                    title,
                    content,
                    image: imageBase64 || entries[idx].image
                };
            } else {
                entries.push({
                    id: Date.now(),
                    title,
                    content,
                    date: today,
                    image: imageBase64
                });
            }

        saveEntries(entries);
        window.location.href = "index.html";
    };

        if (file) {
            const reader = new FileReader();
            reader.onload = () => saveData(reader.result);
            reader.readAsDataURL(file);
        } else {
            saveData();
        }   
        
    });

    document.getElementById("cancelBtn").addEventListener("click", () => {
    const confirmCancel = confirm("Are you sure want to stop writing? This journal won't be saved.");
        if (confirmCancel) {
            window.location.href = "index.html";
        }
    });

}

