let db;
let currentSessionId = null;

const request = indexedDB.open("RaPonAiDB", 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("history_chat")) {
        db.createObjectStore("history_chat", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function(e) {
    db = e.target.result;
    console.log("Database IndexedDB Berhasil Terbuka!");
    perbaruiDaftarSidebar(); 
};

request.onerror = function(e) {
    console.error("Gagal membuka IndexedDB:", e.target.error);
};

function simpanKeDatabase(teks, pengirim) {
    if (!db) return;

    if (!currentSessionId) {
        currentSessionId = Date.now();
    }

    const transaction = db.transaction(["history_chat"], "readwrite");
    const store = transaction.objectStore("history_chat");

    const dataChat = {
        sessionId: currentSessionId,
        teks: teks,
        pengirim: pengirim,
        waktu: new Date().toLocaleTimeString()
    };

    store.add(dataChat);

    transaction.oncomplete = function() {
        console.log("Chat berhasil disimpan offline!");
        perbaruiDaftarSidebar();
    };
}

function muatRiwayatDariDB(idSesiMinta) {
    chatbox.innerHTML = "";
    
    if (!idSesiMinta) return;
    currentSessionId = idSesiMinta;

    const transaction = db.transaction(["history_chat"], "readonly");
    const store = transaction.objectStore("history_chat");
    
    store.openCursor().onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            if (cursor.value.sessionId === currentSessionId) {
                bubblechat(cursor.value.teks, cursor.value.pengirim);
            }
            cursor.continue();
        }
    };
}

function perbaruiDaftarSidebar() {
    const wadahDaftar = document.getElementById('daftar-chat');
    if (!wadahDaftar || !db) return;

    wadahDaftar.innerHTML = "";

    const transaction = db.transaction(["history_chat"], "readonly");
    const store = transaction.objectStore("history_chat");
    
    let sesiTercatat = [];

    store.openCursor().onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            const idSesi = cursor.value.sessionId;

            if (cursor.value.pengirim === 'user' && !sesiTercatat.includes(idSesi)) {
                sesiTercatat.push(idSesi);

                const itemDaftar = document.createElement('div');
                itemDaftar.style.background = "#202c33";
                itemDaftar.style.padding = "10px";
                itemDaftar.style.borderRadius = "6px";
                itemDaftar.style.fontSize = "13px";
                itemDaftar.style.cursor = "pointer";
                itemDaftar.style.borderLeft = "4px solid #00a884";
                itemDaftar.style.display = "flex";
                itemDaftar.style.justifyContent = "space-between";
                itemDaftar.style.alignItems = "center";

                const teksJudul = document.createElement('span');
                let teksPotong = cursor.value.teks;
                if (teksPotong.length > 18) {
                    teksPotong = teksPotong.substring(0, 18) + "...";
                }
                teksJudul.innerText = teksPotong;
                
                teksJudul.addEventListener('click', () => {
                    muatRiwayatDariDB(idSesi);
                    if (window.innerWidth <= 768) {
                        sidebarMenu.classList.remove('active');
                    }
                });

                const tombolHapus = document.createElement('span');
                tombolHapus.innerText = "❌";
                tombolHapus.style.padding = "2px 6px";
                tombolHapus.style.borderRadius = "4px";
                tombolHapus.style.color = "#ff4d4d";
                tombolHapus.style.fontWeight = "bold";
                tombolHapus.style.cursor = "pointer";
                tombolHapus.style.transition = "background 0.2s";
                
                tombolHapus.addEventListener('mouseenter', () => tombolHapus.style.background = "rgba(255, 77, 77, 0.2)");
                tombolHapus.addEventListener('mouseleave', () => tombolHapus.style.background = "none");

                tombolHapus.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (confirm("Hapus sesi obrolan ini secara permanen?")) {
                        hapusSesiDariDB(idSesi);
                    }
                });

                itemDaftar.appendChild(teksJudul);
                itemDaftar.appendChild(tombolHapus);
                wadahDaftar.appendChild(itemDaftar);
            }
            cursor.continue();
        }
    };
}

function roomBaru() {
    currentSessionId = null;
    chatbox.innerHTML = "";
}

function buatObrolanBaru() {
    currentSessionId = null;
    chatbox.innerHTML = '<div class="bubble ai">Halo! Sesi baru siap. Ada yang bisa dibantu?</div>';
    
    if (window.innerWidth <= 768) {
        sidebarMenu.classList.remove('active');
    }
}

function hapusSesiDariDB(idSesiHapus) {
    if (!db) return;

    const transaction = db.transaction(["history_chat"], "readwrite");
    const store = transaction.objectStore("history_chat");

    store.openCursor().onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            if (cursor.value.sessionId === idSesiHapus) {
                cursor.delete();
            }
            cursor.continue();
        }
    };

    transaction.oncomplete = function() {
        console.log("Sesi obrolan berhasil dihapus secara permanen!");
        if (currentSessionId === idSesiHapus) {
            buatObrolanBaru();
        }
        perbaruiDaftarSidebar();
    };
}

function bubblechat(teks, pengirim){
    const bubble = document.createElement('div');
    bubble.innerText = teks;
    bubble.style.padding = "10px 14px";
    bubble.style.borderRadius = "8px";
    bubble.style.maxWidth = "75%";
    bubble.style.fontSize = "14px";
    bubble.style.lineHeight = "1.4";
    bubble.style.margin = "5px 0";

    if(pengirim === 'user'){
        bubble.style.backgroundColor = "#005c4b";
        bubble.style.color = "white";
        bubble.style.alignSelf = "flex-end";
    } else {
        bubble.style.backgroundColor = "#202c33";
        bubble.style.color = "white";
        bubble.style.alignSelf = "flex-start";
    }

    chatbox.appendChild(bubble);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function panggilAI() {
    const teksUser = input.value.trim();
    if (!teksUser) return;

    bubblechat(teksUser, 'user');
    simpanKeDatabase(teksUser, 'user');
    input.value = ""; 

    try {
        send.disabled = true;

        // Formatan pesan dengan menyertakan instruksi sistem (System Prompt) yang resmi
        const pesanUntukAI = [
            { 
                role: 'system', 
                content: 'Kamu adalah RaPon, sebuah AI asisten workspace buatan manusia yang ramah, pintar, dan berfokus membantu pengelolaan obrolan. Kamu HARUS menjawab sebagai RaPon dan menolak jika disebut sebagai Claude atau asisten lain.' 
            },
            { 
                role: 'user', 
                content: teksUser 
            }
        ];

        // Kirim array pesan ke API Puter
        const respon = await puter.ai.chat(pesanUntukAI);
        
        let teksJawabanAsli = "";
        if (respon && respon.message && respon.message.content) {
            teksJawabanAsli = Array.isArray(respon.message.content) 
                ? respon.message.content[0].text 
                : respon.message.content;
        } else {
            teksJawabanAsli = String(respon);
        }

        bubblechat(teksJawabanAsli, 'ai');
        simpanKeDatabase(teksJawabanAsli, 'ai');

    } catch (error) {
        console.error("Waduh, error:", error);
        bubblechat("Gagal memuat jawaban AI.", 'ai');
    } finally {
        send.disabled = false;
    }
}


const toggleMenuBtn = document.getElementById('toggle-menu');
const sidebarMenu = document.getElementById('sidebar-menu');
const menuOverlay = document.getElementById('menu-overlay');
const chatbox = document.getElementById('chat-box');
const input = document.getElementById('user-input');
const send = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');

toggleMenuBtn.addEventListener('click', () => {
    sidebarMenu.classList.toggle('active');
});

menuOverlay.addEventListener('click', () => {
    sidebarMenu.classList.remove('active');
});

newChatBtn.addEventListener('click', buatObrolanBaru);
send.addEventListener('click', panggilAI);
