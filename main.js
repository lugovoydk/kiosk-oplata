document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM
    const phoneInput = document.getElementById('phone-input');
    const clientDropdown = document.getElementById('client-dropdown');
    const payButton = document.getElementById('pay-button');
    const backspaceButton = document.getElementById('backspace');
    const clearButton = document.getElementById('clear');
    const keys = document.querySelectorAll('.key:not(.action)');

    // Форматирование номера телефона
    function formatPhoneNumber(value) {
        if (!value) return '';
        const number = value.replace(/\D/g, '');
        if (number.length === 0) return '';
        if (number.length <= 3) return `+7 (${number}`;
        if (number.length <= 6) return `+7 (${number.slice(0, 3)}) ${number.slice(3)}`;
        if (number.length <= 8) return `+7 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
        return `+7 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6, 8)}-${number.slice(8, 10)}`;
    }

    // Функция для отправки запроса к API
    async function searchClients(phone) {
        if (!phone) {
            clientDropdown.innerHTML = '';
            return;
        }

        // Убираем все нецифровые символы для запроса
        const cleanPhone = phone.replace(/\D/g, '');

        try {
            const response = await fetch('https://api.yclients.com/api/v1/company/1250744/clients/search', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer yztdh77wn9ujyuzjhjyz, User 498a07e9ba81c368aaa249d8762d587a',
                    'Accept': 'application/vnd.yclients.v2+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    page: 1,
                    page_size: 5,
                    fields: ['id', 'name', 'phone'],
                    order_by: 'phone',
                    filters: [{
                        type: 'quick_search',
                        state: { value: cleanPhone }
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка сети');
            }

            const data = await response.json();
            updateDropdown(data.data || []);

        } catch (error) {
            console.error('Ошибка при запросе:', error);
            clientDropdown.innerHTML = '<li>Ошибка при поиске клиентов</li>';
        }
    }

    // Функция обновления выпадающего списка
    function updateDropdown(clients) {
        clientDropdown.innerHTML = '';
        
        if (!clients || clients.length === 0) {
            return;
        }

        clients.forEach(client => {
            const li = document.createElement('li');
            const formattedPhone = formatPhoneNumber(client.phone);
            li.textContent = `${client.name || 'Без имени'} - ${formattedPhone}`;
            li.addEventListener('click', () => {
                phoneInput.value = formattedPhone;
                localStorage.setItem('selectedClient', JSON.stringify({
                    ...client,
                    formattedPhone
                }));
                clientDropdown.innerHTML = '';
            });
            clientDropdown.appendChild(li);
        });
    }

    // Обработчики для цифровых клавиш
    keys.forEach(key => {
        key.addEventListener('click', () => {
            const currentValue = phoneInput.value.replace(/\D/g, '');
            if (currentValue.length < 10) {
                const newValue = currentValue + key.textContent;
                phoneInput.value = formatPhoneNumber(newValue);
                searchClients(newValue);
            }
        });
    });

    // Обработчик для кнопки удаления
    backspaceButton.addEventListener('click', () => {
        const currentValue = phoneInput.value.replace(/\D/g, '');
        if (currentValue.length > 0) {
            const newValue = currentValue.slice(0, -1);
            phoneInput.value = formatPhoneNumber(newValue);
            searchClients(newValue);
        }
    });

    // Обработчик для кнопки очистки
    clearButton.addEventListener('click', () => {
        phoneInput.value = '';
        clientDropdown.innerHTML = '';
    });

    // Обработчик для кнопки оплаты
    payButton.addEventListener('click', () => {
        const currentValue = phoneInput.value.replace(/\D/g, '');
        if (currentValue.length < 10) {
            alert('Введите полный номер телефона');
            return;
        }

        // Сохраняем данные в localStorage
        localStorage.setItem('lastPaymentPhone', phoneInput.value);
        
        // Очищаем поле ввода и список
        phoneInput.value = '';
        clientDropdown.innerHTML = '';
        
        alert('Платёж обработан');
    });

    // Инициализация поля ввода
    phoneInput.value = '';
    phoneInput.placeholder = '+7 (___) ___-__-__';
});
