const fs = require('fs');
const readline = require('readline');
const Table = require('cli-table3');

const FILE_NAME = 'data.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function loadData() {
    try {
        const data = fs.readFileSync(FILE_NAME, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveData(data) {
    fs.writeFileSync(FILE_NAME, JSON.stringify(data, null, 2), 'utf8');
}

function showItems() {
    const items = loadData();
    if (items.length === 0) {
        console.log("\n📢 Tidak ada anime tersedia.\n");
    } else {
        console.log("\n📜 Daftar Anime:\n");

        const table = new Table({
            head: ['No', 'Judul Anime', 'Genre', 'Episode', 'Rating'],
            colWidths: [5, 20, 15, 10, 10]
        });

        items.forEach((item, index) => {
            let formattedRating = Number(item.rating) % 1 === 0 ? parseInt(item.rating) : parseFloat(item.rating);
            table.push([index + 1, item.title, item.genre, item.episodes, formattedRating]);
        });

        console.log(table.toString());
    }
    mainMenu();
}

function isValidNumber(value) {
    return /^\d+$/.test(value);
}

function isValidRating(value) {
    const regex = /^(10(\.0)?|[1-9](\.\d)?)$/;
    return regex.test(value);
}

function askEpisodes(callback) {
    rl.question("Masukkan jumlah episode: ", (episodes) => {
        if (isValidNumber(episodes)) {
            callback(episodes);
        } else {
            console.log("⚠ Jumlah episode harus berupa angka! Coba lagi.");
            askEpisodes(callback);
        }
    });
}

function askRating(callback) {
    rl.question("Masukkan rating anime (1-10): ", (rating) => {
        if (isValidRating(rating)) {
            callback(parseFloat(rating));
        } else {
            console.log("⚠ Rating harus antara 1 - 10! Coba lagi.");
            askRating(callback);
        }
    });
}

function addItem() {
    rl.question("Masukkan judul anime: ", (title) => {
        rl.question("Masukkan genre anime: ", (genre) => {
            askEpisodes((episodes) => {
                askRating((rating) => {
                    const items = loadData();
                    items.push({ title, genre, episodes, rating });
                    saveData(items);
                    console.log("✅ Anime berhasil ditambahkan!");
                    mainMenu();
                });
            });
        });
    });
}

function showItemsWithoutMenu() {
    const items = loadData();
    if (items.length === 0) {
        console.log("\n📢 Tidak ada anime tersedia.\n");
        return false;
    } else {
        console.log("\n📜 Daftar Anime:\n");

        const table = new Table({
            head: ['No', 'Judul Anime', 'Genre', 'Episode', 'Rating'],
            colWidths: [5, 20, 15, 10, 10]
        });

        items.forEach((item, index) => {
            let formattedRating = Number(item.rating) % 1 === 0 ? parseInt(item.rating) : parseFloat(item.rating);
            table.push([index + 1, item.title, item.genre, item.episodes, formattedRating]);
        });

        console.log(table.toString());
        return true;
    }
}

function updateItem() {
    if (!showItemsWithoutMenu()) {
        return mainMenu();
    }

    rl.question("Masukkan nomor anime yang ingin diperbarui: ", (num) => {
        const items = loadData();
        const index = parseInt(num) - 1;

        if (index >= 0 && index < items.length) {
            console.log(`✏️  Memperbarui: ${items[index].title}`);

            rl.question("Masukkan judul baru (kosongkan untuk tidak mengubah): ", (title) => {
                rl.question("Masukkan genre baru (kosongkan untuk tidak mengubah): ", (genre) => {
                    
                    function askNewEpisodes() {
                        rl.question("Masukkan jumlah episode baru (kosongkan untuk tidak mengubah): ", (episodes) => {
                            if (!episodes.trim()) {
                                askNewRating(null); // Lanjut ke rating tanpa mengubah episodes
                            } else if (isValidNumber(episodes)) {
                                askNewRating(episodes); // Lanjut ke rating dengan episodes baru
                            } else {
                                console.log("⚠ Jumlah episode harus berupa angka! Coba lagi.");
                                askNewEpisodes(); // Ulangi input jika salah
                            }
                        });
                    }

                    function askNewRating(newEpisodes) {
                        rl.question("Masukkan rating baru (kosongkan untuk tidak mengubah): ", (rating) => {
                            if (!rating.trim()) {
                                items[index].episodes = newEpisodes || items[index].episodes;
                                saveAndExit();
                            } else if (isValidRating(rating)) {
                                items[index].episodes = newEpisodes || items[index].episodes;
                                items[index].rating = parseFloat(rating);
                                saveAndExit();
                            } else {
                                console.log("⚠ Rating harus antara 1 - 10! Coba lagi.");
                                askNewRating(newEpisodes);
                            }
                        });
                    }

                    function saveAndExit() {
                        items[index].title = title.trim() || items[index].title;
                        items[index].genre = genre.trim() || items[index].genre;
                        saveData(items);
                        console.log("✅ Data anime berhasil diperbarui!");
                        mainMenu();
                    }

                    askNewEpisodes(); // Mulai proses update episode
                });
            });
        } else {
            console.log("⚠ Nomor anime tidak valid!");
            mainMenu();
        }
    });
}

function deleteItem() {
    if (!showItemsWithoutMenu()) {
        return mainMenu();
    }

    rl.question("Masukkan nomor anime yang ingin dihapus: ", (num) => {
        const items = loadData();
        const index = parseInt(num) - 1;

        if (index >= 0 && index < items.length) {
            console.log(`🗑 Menghapus: ${items[index].title}`);
            items.splice(index, 1);
            saveData(items);
            console.log("✅ Anime berhasil dihapus!");
        } else {
            console.log("⚠ Nomor anime tidak valid!");
        }
        mainMenu();
    });
}

function searchItem() {
    console.log("\n🔍 Cari anime berdasarkan:");
    console.log("1️⃣  Judul");
    console.log("2️⃣  Genre");
    console.log("3️⃣  Episode");
    console.log("4️⃣  Rating");

    rl.question("Masukkan nomor pencarian: ", (option) => {
        const items = loadData();

        if (!['1', '2', '3', '4'].includes(option)) {
            console.log("⚠ Opsi tidak valid! Coba lagi.");
            return searchItem();
        }

        rl.question("Masukkan kata kunci: ", (query) => {
            let results = [];
            
            switch (option) {
                case '1': // Cari berdasarkan judul
                    results = items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
                    break;
                case '2': // Cari berdasarkan genre
                    results = items.filter(item => item.genre.toLowerCase().includes(query.toLowerCase()));
                    break;
                case '3': // Cari berdasarkan episode
                    results = items.filter(item => item.episodes.toString() === query);
                    break;
                case '4': // Cari berdasarkan rating
                    results = items.filter(item => item.rating.toString() === query);
                    break;
            }

            if (results.length === 0) {
                console.log("\n🔍 Anime tidak ditemukan.");
            } else {
                console.log("\n📜 Hasil Pencarian:");
                
                const table = new Table({
                    head: ['No', 'Judul Anime', 'Genre', 'Episode', 'Rating'],
                    colWidths: [5, 20, 15, 10, 10]
                });

                results.forEach((item, index) => {
                    let formattedRating = Number(item.rating) % 1 === 0 ? parseInt(item.rating) : parseFloat(item.rating);
                    table.push([index + 1, item.title, item.genre, item.episodes, formattedRating]);
                });
                
                console.log(table.toString());
            }
            mainMenu();
        });
    });
}

function mainMenu() {
    console.log("\n📌 Pilih aksi:");
    console.log("1️⃣  Lihat daftar anime");
    console.log("2️⃣  Tambah anime baru");
    console.log("3️⃣  Perbarui anime");
    console.log("4️⃣  Hapus anime");
    console.log("5️⃣  Cari anime");
    console.log("6️⃣  Keluar");

    rl.question("Masukkan nomor: ", (answer) => {
        if (answer === "1") {
            showItems();
        } else if (answer === "2") {
            addItem();
        } else if (answer === "3") {
            updateItem();
        } else if (answer === "4") {
            deleteItem();
        } else if (answer === "5") {
            searchItem();
        } else {
            console.log("👋 Terima kasih telah menggunakan sistem ini!");
            rl.close();
        }
    });
}

mainMenu();
