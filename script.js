document.addEventListener('DOMContentLoaded', function() {
    // Car data
    const cars = [
    {
        id: 1,
        name: "Toyota Avanza",
        price: 500000,
        image: "avanza.jpg"  
    },
    {
        id: 2,
        name: "Toyota Kijang Innova",
        price: 700000,
        image: "innova.jpg"
    },
    {
        id: 3,
        name: "Honda HRV",
        price: 600000,
        image: "hrv.jpg"
    },
    {
        id: 4,
        name: "Daihatsu Sigra",
        price: 450000,
        image: "sigra.jpg"
    }
];

    // DOM elements
    const carsContainer = document.getElementById('cars-container');
    const calculateBtn = document.getElementById('calculate-btn');
    const saveBtn = document.getElementById('save-btn');
    const customerNameInput = document.getElementById('customer-name');
    const summaryContent = document.getElementById('summary-content');
    const bookingsList = document.getElementById('bookings-list');

    // Render car list
    function renderCarList() {
        carsContainer.innerHTML = '';
        
        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.innerHTML = `
                <img src="${car.image}" alt="${car.name}">
                <h3>${car.name}</h3>
                <p class="price">Rp ${car.price.toLocaleString()} / hari</p>
                <div class="form-group">
                    <input type="checkbox" id="car-${car.id}" class="car-checkbox" data-id="${car.id}">
                    <label for="car-${car.id}">Pilih mobil ini</label>
                </div>
                <div class="form-group">
                    <label for="start-date-${car.id}">Tanggal Mulai Sewa</label>
                    <input type="date" id="start-date-${car.id}" class="start-date" data-id="${car.id}" disabled>
                </div>
                <div class="form-group">
                    <label for="duration-${car.id}">Durasi Sewa (hari)</label>
                    <input type="number" id="duration-${car.id}" class="duration" data-id="${car.id}" min="1" value="1" disabled>
                </div>
            `;
            carsContainer.appendChild(carCard);
        });

        // Add event listeners to checkboxes
        document.querySelectorAll('.car-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const carId = this.getAttribute('data-id');
                const startDateInput = document.getElementById(`start-date-${carId}`);
                const durationInput = document.getElementById(`duration-${carId}`);
                
                startDateInput.disabled = !this.checked;
                durationInput.disabled = !this.checked;
                
                if (!this.checked) {
                    startDateInput.value = '';
                    durationInput.value = '1';
                }
            });
        });
    }

    // Calculate total
    function calculateTotal() {
        const selectedCars = [];
        let total = 0;
        
        document.querySelectorAll('.car-checkbox:checked').forEach(checkbox => {
            const carId = checkbox.getAttribute('data-id');
            const car = cars.find(c => c.id == carId);
            const startDate = document.getElementById(`start-date-${carId}`).value;
            const duration = parseInt(document.getElementById(`duration-${carId}`).value);
            
            if (!startDate || isNaN(duration) || duration < 1) {
                alert('Harap isi tanggal dan durasi sewa untuk semua mobil yang dipilih');
                return;
            }
            
            const subtotal = car.price * duration;
            total += subtotal;
            
            selectedCars.push({
                ...car,
                startDate,
                duration,
                subtotal
            });
        });
        
        if (selectedCars.length === 0) {
            alert('Pilih setidaknya satu mobil untuk disewa');
            return;
        }
        
        // Display summary
        displaySummary(selectedCars, total);
        
        // Enable save button if customer name is filled
        if (customerNameInput.value.trim()) {
            saveBtn.disabled = false;
        }
    }

    // Display summary
    function displaySummary(selectedCars, total) {
        summaryContent.innerHTML = '';
        
        selectedCars.forEach(car => {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <span>${car.name} (${car.duration} hari)</span>
                <span>Rp ${car.subtotal.toLocaleString()}</span>
            `;
            summaryContent.appendChild(summaryItem);
        });
        
        const totalElement = document.createElement('div');
        totalElement.className = 'total';
        totalElement.innerHTML = `
            <span>Total:</span>
            <span>Rp ${total.toLocaleString()}</span>
        `;
        summaryContent.appendChild(totalElement);
    }

    // Save booking
    function saveBooking() {
        const customerName = customerNameInput.value.trim();
        if (!customerName) {
            alert('Harap isi nama pelanggan');
            return;
        }
        
        const selectedCars = [];
        let total = 0;
        
        document.querySelectorAll('.car-checkbox:checked').forEach(checkbox => {
            const carId = checkbox.getAttribute('data-id');
            const car = cars.find(c => c.id == carId);
            const startDate = document.getElementById(`start-date-${carId}`).value;
            const duration = parseInt(document.getElementById(`duration-${carId}`).value);
            
            if (!startDate || isNaN(duration) || duration < 1) {
                alert('Harap isi tanggal dan durasi sewa untuk semua mobil yang dipilih');
                return;
            }
            
            const subtotal = car.price * duration;
            total += subtotal;
            
            selectedCars.push({
                id: car.id,
                name: car.name,
                price: car.price,
                startDate,
                duration,
                subtotal
            });
        });
        
        if (selectedCars.length === 0) {
            alert('Pilih setidaknya satu mobil untuk disewa');
            return;
        }
        
        const booking = {
            id: Date.now(),
            customerName,
            cars: selectedCars,
            total,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Display success message
        alert('Pemesanan berhasil disimpan!');
        
        // Reset form
        document.querySelectorAll('.car-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            const carId = checkbox.getAttribute('data-id');
            document.getElementById(`start-date-${carId}`).disabled = true;
            document.getElementById(`duration-${carId}`).disabled = true;
        });
        
        customerNameInput.value = '';
        summaryContent.innerHTML = '<p>Pilih mobil dan hitung total untuk melihat ringkasan</p>';
        saveBtn.disabled = true;
        
        // Refresh bookings list
        displayBookings();
    }

    // Display bookings
    function displayBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        
        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p>Belum ada riwayat pemesanan</p>';
            return;
        }
        
        bookingsList.innerHTML = '';
        
        bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(booking => {
            const bookingCard = document.createElement('div');
            bookingCard.className = 'booking-card';
            
            const date = new Date(booking.timestamp);
            const formattedDate = date.toLocaleString();
            
            bookingCard.innerHTML = `
                <p class="timestamp">${formattedDate}</p>
                <h3>${booking.customerName}</h3>
                <p><strong>Total: Rp ${booking.total.toLocaleString()}</strong></p>
                <p>Mobil yang disewa:</p>
                <ul>
                    ${booking.cars.map(car => `
                        <li>${car.name} (${car.duration} hari) - Rp ${car.subtotal.toLocaleString()}</li>
                    `).join('')}
                </ul>
                <button class="delete-btn" data-id="${booking.id}">Hapus Pemesanan</button>
            `;
            
            bookingsList.appendChild(bookingCard);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const bookingId = this.getAttribute('data-id');
                deleteBooking(bookingId);
            });
        });
    }

    // Delete booking
    function deleteBooking(bookingId) {
        if (confirm('Apakah Anda yakin ingin menghapus pemesanan ini?')) {
            let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            bookings = bookings.filter(booking => booking.id != bookingId);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            displayBookings();
        }
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculateTotal);
    saveBtn.addEventListener('click', saveBooking);
    
    customerNameInput.addEventListener('input', function() {
        // Enable save button only if customer name is filled and at least one car is selected
        const hasSelectedCars = document.querySelectorAll('.car-checkbox:checked').length > 0;
        saveBtn.disabled = !(this.value.trim() && hasSelectedCars);
    });

    // Initialize
    renderCarList();
    displayBookings();
    summaryContent.innerHTML = '<p>Pilih mobil dan hitung total untuk melihat ringkasan</p>';
});