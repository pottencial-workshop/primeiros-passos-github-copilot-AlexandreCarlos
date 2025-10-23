document.addEventListener('DOMContentLoaded', function() {
    loadActivities();
    
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', handleSignup);
});

async function loadActivities() {
    try {
        const response = await fetch('/activities');
        const activities = await response.json();
        
        displayActivities(activities);
        populateActivitySelect(activities);
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        document.getElementById('activities-list').innerHTML = 
            '<p class="error">Erro ao carregar atividades. Tente novamente mais tarde.</p>';
    }
}

function displayActivities(activities) {
    const activitiesList = document.getElementById('activities-list');
    
    if (Object.keys(activities).length === 0) {
        activitiesList.innerHTML = '<p>Nenhuma atividade disponível no momento.</p>';
        return;
    }
    
    activitiesList.innerHTML = Object.entries(activities).map(([name, activity]) => {
        const participantsList = activity.participants.length > 0 
            ? `<ul class="participants-list">
                 ${activity.participants.map(email => `<li>${email}</li>`).join('')}
               </ul>`
            : '<p class="no-participants">Nenhum participante inscrito ainda</p>';
        
        const spotsLeft = activity.max_participants - activity.participants.length;
        const spotsClass = spotsLeft <= 3 ? 'spots-few' : spotsLeft === 0 ? 'spots-full' : '';
        
        return `
            <div class="activity-card">
                <h4>${name}</h4>
                <p class="activity-description">${activity.description}</p>
                <p class="activity-schedule"><strong>Horário:</strong> ${activity.schedule}</p>
                <p class="activity-capacity"><strong>Capacidade:</strong> ${activity.participants.length}/${activity.max_participants} 
                   <span class="spots-left ${spotsClass}">(${spotsLeft} vagas restantes)</span>
                </p>
                <div class="participants-section">
                    <h5>Participantes Inscritos:</h5>
                    ${participantsList}
                </div>
            </div>
        `;
    }).join('');
}

function populateActivitySelect(activities) {
    const select = document.getElementById('activity');
    select.innerHTML = '<option value="">-- Selecione uma atividade --</option>';
    
    Object.keys(activities).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

async function handleSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const activityName = document.getElementById('activity').value;
    const messageDiv = document.getElementById('message');
    
    if (!email || !activityName) {
        showMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}`
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            // Recarregar atividades para mostrar a atualização
            loadActivities();
            // Limpar formulário
            document.getElementById('signup-form').reset();
        } else {
            showMessage(result.detail || 'Erro ao inscrever-se na atividade.', 'error');
        }
    } catch (error) {
        console.error('Erro ao inscrever-se:', error);
        showMessage('Erro de conexão. Tente novamente mais tarde.', 'error');
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}
